import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function setupLeaderboardSocket(io: Server) {
  io.on('connection', (socket) => {
    console.log('User connected to leaderboard socket:', socket.id);

    // send initial leaderboard
    sendLeaderboard(io);

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}

// safe leaderboard calculation
export async function calculateLeaderboard(prismaClient: PrismaClient) {
  const students = await prismaClient.student.findMany({
    include: {
      attempts: true,
    },
  });

  const leaderboard = students
    .map((student) => {
      const totalScore = student.attempts.reduce(
        (sum, a) => sum + (a.score || 0),
        0
      );

      const totalAttempts = student.attempts.length;

      const average =
        totalAttempts === 0 ? 0 : totalScore / totalAttempts;

      return {
        studentId: student.id,
        name: student.name,
        totalScore,
        totalAttempts,
        averageScore: Number(average.toFixed(2)),
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  return leaderboard;
}

// emit leaderboard to all clients
export async function sendLeaderboard(io: Server) {
  try {
    const leaderboard = await calculateLeaderboard(prisma);

    io.emit('leaderboard:update', leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
  }
}
