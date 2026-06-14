import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Return overall leaderboard. Supports optional query params: subjectId, range (weekly|monthly).
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { subjectId, range } = req.query as { subjectId?: string; range?: string };

    // If subjectId or range provided, aggregate from QuizAttempt; otherwise use Student.totalScore
    if (subjectId || range) {
      const where: any = {};
      if (subjectId) {
        where.quiz = { subjectId };
      }
      if (range === 'weekly') {
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        where.submittedAt = { gte: since };
      } else if (range === 'monthly') {
        const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        where.submittedAt = { gte: since };
      }

      const attempts = await prisma.quizAttempt.findMany({
        where,
        select: { studentId: true, score: true },
      });

      const map: Record<string, { score: number; quizzes: number }> = {};
      for (const a of attempts) {
        map[a.studentId] ??= { score: 0, quizzes: 0 };
        map[a.studentId].score += a.score;
        map[a.studentId].quizzes += 1;
      }

      const entries = await Promise.all(
        Object.entries(map).map(async ([studentId, stats], idx) => {
          const student = await prisma.student.findUnique({ where: { id: studentId } });
          return {
            rank: idx + 1,
            studentId,
            studentName: student?.name ?? 'Unknown',
            score: stats.score,
            quizzes: stats.quizzes,
            badges: 0,
          };
        })
      );

      // sort by score desc
      entries.sort((a, b) => b.score - a.score);
      // normalize ranks
      entries.forEach((e, i) => (e.rank = i + 1));

      return res.json({ leaderboard: entries });
    }

    // Default: use Student table
    const students = await prisma.student.findMany({
      orderBy: { totalScore: 'desc' },
      select: {
        id: true,
        name: true,
        totalScore: true,
        rank: true,
        _count: { select: { attempts: true, badges: true } },
      },
    });

    const leaderboard = students.map((s, idx) => ({
      rank: idx + 1,
      studentId: s.id,
      studentName: s.name,
      score: s.totalScore ?? 0,
      quizzes: s._count.attempts ?? 0,
      badges: s._count.badges ?? 0,
    }));

    return res.json({ leaderboard });
  } catch (err) {
    console.error('getLeaderboard error', err);
    return res.status(500).json({ leaderboard: [] });
  }
}

export async function getLeaderboardBySubject(req: Request, res: Response) {
  const subjectId = String(req.query.subjectId || req.body?.subjectId || '');
  if (!subjectId) return res.json({ leaderboard: [] });
  try {
    const attempts = await prisma.quizAttempt.findMany({
      where: { quiz: { subjectId } },
      select: { studentId: true, score: true },
    });
    const map: Record<string, { score: number; quizzes: number }> = {};
    for (const a of attempts) {
      map[a.studentId] ??= { score: 0, quizzes: 0 };
      map[a.studentId].score += a.score;
      map[a.studentId].quizzes += 1;
    }
    const entries = await Promise.all(
      Object.entries(map).map(async ([studentId, stats], idx) => {
        const student = await prisma.student.findUnique({ where: { id: studentId } });
        return {
          rank: idx + 1,
          studentId,
          studentName: student?.name ?? 'Unknown',
          score: stats.score,
          quizzes: stats.quizzes,
          badges: 0,
        };
      })
    );
    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => (e.rank = i + 1));
    return res.json({ leaderboard: entries });
  } catch (err) {
    console.error('getLeaderboardBySubject error', err);
    return res.status(500).json({ leaderboard: [] });
  }
}

export async function getLeaderboardSubjects(_req: Request, res: Response) {
  try {
    const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
    return res.json({ subjects });
  } catch (err) {
    console.error('getLeaderboardSubjects error', err);
    return res.status(500).json({ subjects: [] });
  }
}

export async function getLeaderboardWeekly(req: Request, res: Response) {
  req.query.range = 'weekly';
  return getLeaderboard(req, res);
}

export async function getLeaderboardMonthly(req: Request, res: Response) {
  req.query.range = 'monthly';
  return getLeaderboard(req, res);
}