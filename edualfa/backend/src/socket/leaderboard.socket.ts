import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function leaderboardSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('User connected to leaderboard socket');
    // Emit current leaderboard right away for the connected client
    sendLeaderboard(io).catch(() => {});

    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });
}

// Emit current leaderboard to all connected clients
export async function sendLeaderboard(io: Server) {
  try {
    const students = await prisma.student.findMany({
      orderBy: { totalScore: 'desc' },
      select: {
        id: true,
        name: true,
        totalScore: true,
        rank: true,
        _count: { select: { attempts: true, badges: true } },
      },
      take: 100,
    });

    const leaderboard = students.map((s, idx) => ({
      rank: s.rank && s.rank > 0 ? s.rank : idx + 1,
      studentId: s.id,
      studentName: s.name,
      score: s.totalScore ?? 0,
      quizzes: s._count.attempts ?? 0,
      badges: s._count.badges ?? 0,
    }));

    io.emit('leaderboard:update', leaderboard);
  } catch (err) {
    console.error('sendLeaderboard error', err);
    io.emit('leaderboard:update', []);
  }
}