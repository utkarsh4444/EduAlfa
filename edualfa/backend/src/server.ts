import express, { json, Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentRoutes from './routes/student.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import { leaderboardSocket } from './socket/leaderboard.socket';
import bcrypt from 'bcryptjs';

const seedModule: any = require('../prisma/seed');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
const prisma = new PrismaClient();

// Allow requests from the frontend dev server and support credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve frontend static files
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', authMiddleware(['admin']), adminRoutes);
// student routes: public quiz access and submission remain public;
// apply auth middleware to protected endpoints inside the router instead
app.use('/api/student', studentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.set('io', io);

// SPA fallback: serve index.html for all non-API routes
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use(errorHandler);

leaderboardSocket(io);

const port = Number(process.env.PORT ?? 5000);

async function seedBadges() {
  const badgeDefinitions = [
    { name: 'Top Scholar', description: 'Rank 1 achiever in leaderboard', icon: '🥇', condition: 'rank1', rarity: 'legendary' },
    { name: 'On Fire', description: '3 quiz streak unlocked', icon: '🔥', condition: 'streak3', rarity: 'rare' },
    { name: 'Speed Demon', description: 'Fast quiz submission bonus earned', icon: '⚡', condition: 'speed', rarity: 'rare' },
    { name: 'Perfectionist', description: 'Perfect score achieved', icon: '💯', condition: 'perfect', rarity: 'epic' },
    { name: 'Subject Expert', description: 'Mastered a subject with high score', icon: '📚', condition: 'subject_expert', rarity: 'uncommon' },
    { name: 'Easy Master', description: 'Scored 80%+ on Easy quiz', icon: '🟢', condition: 'easy_master', rarity: 'uncommon' },
    { name: 'Medium Master', description: 'Scored 80%+ on Medium quiz', icon: '🟡', condition: 'medium_master', rarity: 'rare' },
    { name: 'Hard Master', description: 'Scored 80%+ on Hard quiz', icon: '🔴', condition: 'hard_master', rarity: 'epic' },
    { name: 'Subject Champion', description: 'Completed all three difficulty levels', icon: '🏆', condition: 'subject_champion', rarity: 'legendary' },
  ];

  for (const badge of badgeDefinitions) {
    const existingBadge = await prisma.badge.findFirst({ where: { condition: badge.condition } });
    if (existingBadge) {
      await prisma.badge.update({
        where: { id: existingBadge.id },
        data: badge,
      });
    } else {
      await prisma.badge.create({ data: badge });
    }
  }
}

async function start() {
  await prisma.$connect();
  await seedBadges();
  if (seedModule?.main) {
    try {
      await seedModule.main();
    } catch (seedError) {
      console.error('Error running seed script:', seedError);
    }
  }
  server.listen(port, () => {
    console.log(`EduAlfa backend running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Server startup failed', error);
  process.exit(1);
});
