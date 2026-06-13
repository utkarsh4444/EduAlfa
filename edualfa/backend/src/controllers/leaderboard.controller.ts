import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

async function buildLeaderboard(attempts: any[], client: PrismaClient) {
  const grouped: Record<string, { studentId: string; studentName: string; totalScore: number; totalPossible: number; attempts: number; badges: number; fastAttempts: number }> = {};

  attempts.forEach((attempt) => {
    const key = attempt.studentId;
    if (!grouped[key]) {
      grouped[key] = {
        studentId: attempt.studentId,
        studentName: attempt.student.name,
        totalScore: 0,
        totalPossible: 0,
        attempts: 0,
        badges: 0,
        fastAttempts: 0,
      };
    }
    grouped[key].totalScore += attempt.score;
    grouped[key].totalPossible += attempt.totalScore;
    grouped[key].attempts += 1;
    if (attempt.timeTaken <= attempt.quiz.duration * 60 * 0.5) {
      grouped[key].fastAttempts += 1;
    }
  });

  const badgeCounts = await client.studentBadge.groupBy({ by: ['studentId'], _count: { id: true } });
  badgeCounts.forEach((badge) => {
    if (grouped[badge.studentId]) {
      grouped[badge.studentId].badges = badge._count.id;
    }
  });

  const leaderboard = Object.values(grouped).map((item) => {
    const accuracyScore = item.totalPossible === 0 ? 0 : (item.totalScore / item.totalPossible) * 100;
    const speedBonus = Math.min(item.fastAttempts * 5, 20);
    const consistencyMultiplier = item.attempts >= 3 ? 1.1 : 1.0;
    const finalScore = Math.round((accuracyScore + speedBonus) * consistencyMultiplier * 10) / 10;
    return {
      studentId: item.studentId,
      studentName: item.studentName,
      quizzes: item.attempts,
      score: finalScore,
      badges: item.badges,
    };
  });

  return leaderboard.sort((a, b) => b.score - a.score).map((entry, index) => ({ rank: index + 1, ...entry }));
}

export async function calculateLeaderboard(filter: { since?: Date; subjectId?: string } = {}, client: PrismaClient = prisma) {
  const where: any = {};
  if (filter.since) {
    where.submittedAt = { gte: filter.since };
  }
  if (filter.subjectId) {
    where.quiz = { subjectId: filter.subjectId };
  }
  const attempts = await client.quizAttempt.findMany({ where, include: { student: true, quiz: true } });
  return buildLeaderboard(attempts, client);
}

function buildDateFilter(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

export async function getLeaderboard(req: Request, res: Response) {
  const { range, subjectId } = req.query;
  const filter: { since?: Date; subjectId?: string } = {};

  if (range === 'weekly') {
    filter.since = buildDateFilter(7);
  } else if (range === 'monthly') {
    filter.since = buildDateFilter(30);
  }

  if (typeof subjectId === 'string' && subjectId.trim()) {
    filter.subjectId = subjectId;
  }

  const leaderboard = await calculateLeaderboard(filter);
  return res.json({ leaderboard });
}

export async function getLeaderboardWeekly(req: Request, res: Response) {
  const since = buildDateFilter(7);
  const attempts = await prisma.quizAttempt.findMany({
    where: { submittedAt: { gte: since } },
    include: { student: true, quiz: true },
  });
  const leaderboard = await buildLeaderboard(attempts, prisma);
  return res.json({ leaderboard });
}

export async function getLeaderboardMonthly(req: Request, res: Response) {
  const since = buildDateFilter(30);
  const attempts = await prisma.quizAttempt.findMany({
    where: { submittedAt: { gte: since } },
    include: { student: true, quiz: true },
  });
  const leaderboard = await buildLeaderboard(attempts, prisma);
  return res.json({ leaderboard });
}

export async function getLeaderboardSubjects(_req: Request, res: Response) {
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
  return res.json({ subjects });
}

export async function getLeaderboardBySubject(req: Request, res: Response) {
  const { id } = req.params;
  const attempts = await prisma.quizAttempt.findMany({ include: { student: true, quiz: true }, where: { quiz: { subjectId: id } } });
  const grouped: Record<string, { studentId: string; studentName: string; totalScore: number; totalPossible: number; attempts: number; badges: number; fastAttempts: number }> = {};

  attempts.forEach((attempt) => {
    const key = attempt.studentId;
    if (!grouped[key]) {
      grouped[key] = {
        studentId: attempt.studentId,
        studentName: attempt.student.name,
        totalScore: 0,
        totalPossible: 0,
        attempts: 0,
        badges: 0,
        fastAttempts: 0,
      };
    }
    grouped[key].totalScore += attempt.score;
    grouped[key].totalPossible += attempt.totalScore;
    grouped[key].attempts += 1;
    if (attempt.timeTaken <= attempt.quiz.duration * 60 * 0.5) {
      grouped[key].fastAttempts += 1;
    }
  });

  const badgeCounts = await prisma.studentBadge.groupBy({ by: ['studentId'], _count: { id: true } });
  badgeCounts.forEach((badge) => {
    if (grouped[badge.studentId]) {
      grouped[badge.studentId].badges = badge._count.id;
    }
  });

  const leaderboard = Object.values(grouped).map((item) => {
    const accuracyScore = item.totalPossible === 0 ? 0 : (item.totalScore / item.totalPossible) * 100;
    const speedBonus = Math.min(item.fastAttempts * 5, 20);
    const consistencyMultiplier = item.attempts >= 3 ? 1.1 : 1.0;
    const finalScore = Math.round((accuracyScore + speedBonus) * consistencyMultiplier * 10) / 10;
    return {
      studentId: item.studentId,
      studentName: item.studentName,
      quizzes: item.attempts,
      score: finalScore,
      badges: item.badges,
    };
  });

  return res.json({ leaderboard: leaderboard.sort((a, b) => b.score - a.score).map((entry, index) => ({ rank: index + 1, ...entry })) });
}
