import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { calculateLeaderboard } from '../controllers/leaderboard.controller';

export function initLeaderboardSocket(io: Server, prisma: PrismaClient) {
  io.on('connection', async (socket) => {
    const leaderboard = await calculateLeaderboard(prisma);
    socket.emit('leaderboard:update', leaderboard);

    socket.on('join:student', (studentId: string) => {
      socket.join(`student:${studentId}`);
    });
  });
}
