import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
// REMOVE this line OR keep it only if needed safely

const prisma = new PrismaClient();

export async function getSubjects(_req: Request, res: Response) {
  const subjects = await prisma.subject.findMany({
    include: { quizzes: true },
    orderBy: { name: 'asc' },
  });

  return res.json({ subjects });
}

export async function getSubjectQuizzes(req: Request, res: Response) {
  const { id } = req.params;

  const subject = await prisma.subject.findUnique({
    where: { id },
    include: { quizzes: true },
  });

  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  return res.json({ subject, quizzes: subject.quizzes });
}

export async function getQuiz(req: Request, res: Response) {
  const { id } = req.params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { orderIndex: 'asc' } },
      subject: true,
    },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const quizSafe = {
    id: quiz.id,
    title: quiz.title,
    duration: quiz.duration,
    subject: quiz.subject,
    questions: quiz.questions.map((question) => ({
      id: question.id,
      questionText: question.questionText,
      options: question.options ? JSON.parse(question.options) : [],
      points: question.points,
      orderIndex: question.orderIndex,
      type: question.type,
    })),
  };

  return res.json({ quiz: quizSafe });
}

async function earnBadge(studentId: string, condition: string) {
  const badge = await prisma.badge.findFirst({ where: { condition } });
  if (!badge) return;

  const existingBadge = await prisma.studentBadge.findFirst({
    where: { studentId, badgeId: badge.id },
  });

  if (!existingBadge) {
    await prisma.studentBadge.create({
      data: { studentId, badgeId: badge.id },
    });
  }
}

export async function submitQuiz(req: Request, res: Response) {
  const { id } = req.params;

  const { answers, timeTaken } = req.body as {
    answers?: { [key: string]: number };
    timeTaken?: number;
  };

  if (!answers || typeof timeTaken !== 'number') {
    return res.status(400).json({ error: 'Answers and time taken are required' });
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { questions: true },
  });

  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const studentId = req.user?.id;
  if (!studentId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const totalScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);

  const answeredQuestionCount = Object.keys(answers).length;
  if (answeredQuestionCount === 0) {
    return res.status(400).json({ error: 'At least one answer must be submitted' });
  }

  let fastAttempts = 0;
  let correctPoints = 0;

  const isFastAttempt = timeTaken <= quiz.duration * 60 * 0.5;

  quiz.questions.forEach((question) => {
    const selected = answers[String(question.id)];
    const correctRaw = question.correctAnswer;

    let isCorrect = false;

    try {
      const qType = question.type || 'MCQ';

      if (qType === 'MCQ' || qType === 'TRUE_FALSE') {
        const correct = correctRaw
          ? JSON.parse(String(correctRaw))
          : null;

        isCorrect = Number(selected) === Number(correct);
      }

      else if (qType === 'MULTI_SELECT') {
        const correctArr = correctRaw ? JSON.parse(String(correctRaw)) : [];

        const selArr = Array.isArray(selected)
          ? selected.map(Number)
          : selected !== undefined && selected !== null
            ? [Number(selected)]
            : [];

        const a = [...correctArr].map(Number).sort();
        const b = [...selArr].sort();

        isCorrect =
          a.length === b.length &&
          a.every((v, i) => v === b[i]);
      }

      else if (qType === 'SHORT_ANSWER') {
        const correctStr = correctRaw
          ? String(JSON.parse(String(correctRaw))).trim().toLowerCase()
          : '';

        const selStr = selected
          ? String(selected).trim().toLowerCase()
          : '';

        isCorrect = correctStr.length > 0 && selStr === correctStr;
      }
    } catch (e) {
     isCorrect =
  String(selected) === String(question.correctAnswer);
    }

    if (isCorrect) {
      correctPoints += question.points;
    }

    if (isFastAttempt) {
      fastAttempts += 1;
    }
  });

  const score = correctPoints;

  const attempt = await prisma.quizAttempt.create({
    data: {
      studentId,
      quizId: quiz.id,
      score,
      totalScore,
      timeTaken,
      answers: JSON.stringify(answers),
    },
    include: {
      quiz: {
        include: {
          subject: true,
          questions: { orderBy: { orderIndex: 'asc' } },
        },
      },
      student: true,
    },
  });

  const aimScore = totalScore === 0 ? 0 : Math.round((score / totalScore) * 100);

  if (score === totalScore) {
    await earnBadge(studentId, 'perfect');
  }

  if (isFastAttempt) {
    await earnBadge(studentId, 'speed');
  }

  if (aimScore >= 90) {
    await earnBadge(studentId, 'subject_expert');
  }

  const leaderboard = await calculateLeaderboard(prisma);

  const io = req.app.get('io') as {
    emit: (event: string, data: unknown) => void;
  } | undefined;

  io?.emit('leaderboard:update', leaderboard);

  return res.json({ attempt, leaderboard });
}

export async function getStudentAttempts(req: Request, res: Response) {
  const studentId = req.user?.id;

  if (!studentId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId },
    include: { quiz: { include: { subject: true } } },
    orderBy: { submittedAt: 'desc' },
  });

  return res.json({ attempts });
}

export async function getStudentProfile(req: Request, res: Response) {
  const studentId = req.user?.id;

  if (!studentId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      badges: { include: { badge: true } },
      attempts: {
        select: {
          id: true,
          score: true,
          totalScore: true,
          submittedAt: true,
          quiz: {
            select: {
              title: true,
              subject: { select: { name: true } },
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      },
    },
  });

  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  return res.json({ profile: student });
}

export async function updateStudentProfile(req: Request, res: Response) {
  const studentId = req.user?.id;

  if (!studentId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { name } = req.body;

  try {
    const updateData: { name?: string; photoUrl?: string } = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if ((req as any).file) {
      const file = (req as any).file;

      const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');

      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const extension = path.extname(file.originalname) || '.jpg';
      const fileName = `${studentId}-${Date.now()}${extension}`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, file.buffer);

      updateData.photoUrl = `/uploads/profiles/${fileName}`;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
      include: {
        badges: { include: { badge: true } },
        attempts: {
          select: {
            id: true,
            score: true,
            totalScore: true,
            submittedAt: true,
            quiz: {
              select: {
                title: true,
                subject: { select: { name: true } },
              },
            },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    return res.json({ profile: updatedStudent });
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to update profile',
      details: String(error),
    });
  }
}
