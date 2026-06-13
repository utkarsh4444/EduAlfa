import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { calculateLeaderboard } from './leaderboard.controller';

const prisma = new PrismaClient();

export async function getSubjects(_req: Request, res: Response) {
  const subjects = await prisma.subject.findMany({ include: { quizzes: true }, orderBy: { name: 'asc' } });
  return res.json({ subjects });
}

export async function getSubjectQuizzes(req: Request, res: Response) {
  const { id } = req.params;
  const subject = await prisma.subject.findUnique({ where: { id }, include: { quizzes: true } });
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }
  return res.json({ subject, quizzes: subject.quizzes });
}

export async function getQuiz(req: Request, res: Response) {
  const { id } = req.params;
  const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: { orderBy: { orderIndex: 'asc' } }, subject: true } });
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

function calculateScore(correctPoints: number, totalPoints: number, fastAttempts: number, attempts: number) {
  const accuracyScore = totalPoints === 0 ? 0 : (correctPoints / totalPoints) * 100;
  const speedBonus = Math.min(fastAttempts * 5, 20);
  const consistencyMultiplier = attempts >= 3 ? 1.1 : 1.0;
  return Math.round((accuracyScore + speedBonus) * consistencyMultiplier * 10) / 10;
}

async function earnBadge(studentId: string, condition: string) {
  const badge = await prisma.badge.findFirst({ where: { condition } });
  if (!badge) return;
  const existingBadge = await prisma.studentBadge.findFirst({ where: { studentId, badgeId: badge.id } });
  if (!existingBadge) {
    await prisma.studentBadge.create({ data: { studentId, badgeId: badge.id } });
  }
}

export async function submitQuiz(req: Request, res: Response) {
  const { id } = req.params;
  const { answers, timeTaken } = req.body as { answers?: { [key: string]: number }; timeTaken?: number };
  if (!answers || typeof timeTaken !== 'number') {
    return res.status(400).json({ error: 'Answers and time taken are required' });
  }

  const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  const studentId = req.user?.id as string;
  const totalScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  const answeredQuestionCount = Object.keys(answers).length;
  if (answeredQuestionCount === 0) {
    return res.status(400).json({ error: 'At least one answer must be submitted' });
  }

  let fastAttempts = 0;
  let correctPoints = 0;

  quiz.questions.forEach((question) => {
    const selected = answers[question.id];
    const correctRaw = question.correctAnswer;
    let isCorrect = false;

    try {
      const qType = question.type || 'MCQ';
      if (qType === 'MCQ' || qType === 'TRUE_FALSE') {
        // correctRaw expected to be a JSON number or boolean
        const correct = correctRaw ? JSON.parse(correctRaw) : null;
        isCorrect = selected === correct;
      } else if (qType === 'MULTI_SELECT') {
        const correctArr = correctRaw ? JSON.parse(correctRaw) : [];
        const selArr = Array.isArray(selected) ? selected : (selected ? [selected] : []);
        // compare sets
        const a = [...correctArr].sort();
        const b = [...selArr].sort();
        isCorrect = a.length === b.length && a.every((v, i) => v === b[i]);
      } else if (qType === 'SHORT_ANSWER') {
        const correctStr = correctRaw ? String(JSON.parse(correctRaw)).trim().toLowerCase() : '';
        const selStr = selected ? String(selected).trim().toLowerCase() : '';
        isCorrect = correctStr.length > 0 && selStr === correctStr;
      }
    } catch (e) {
      // fallback: strict equality
      isCorrect = selected === question.correctAnswer;
    }

    if (isCorrect) correctPoints += question.points;
    if (timeTaken <= quiz.duration * 60 * 0.5) {
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

  const aimScore = Math.round((score / totalScore) * 100);
  if (score === totalScore) {
    await earnBadge(studentId, 'perfect');
  }
  if (timeTaken <= quiz.duration * 60 * 0.5) {
    await earnBadge(studentId, 'speed');
  }
  if (aimScore >= 90) {
    await earnBadge(studentId, 'subject_expert');
  }

  const leaderboard = await calculateLeaderboard(prisma);
  const socketNamespace = req.app.get('io') as { emit: (event: string, data: unknown) => void } | undefined;
  socketNamespace?.emit('leaderboard:update', leaderboard);

  return res.json({ attempt, leaderboard });
}

export async function getStudentAttempts(req: Request, res: Response) {
  const studentId = req.user?.id as string;
  const attempts = await prisma.quizAttempt.findMany({
    where: { studentId },
    include: { quiz: { include: { subject: true } } },
    orderBy: { submittedAt: 'desc' },
  });
  return res.json({ attempts });
}

export async function getStudentProfile(req: Request, res: Response) {
  const studentId = req.user?.id as string;
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
          quiz: { select: { title: true, subject: { select: { name: true } } } },
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
  const studentId = req.user?.id as string;
  const { name } = req.body;
  
  if (!studentId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const updateData: { name?: string; photoUrl?: string } = {};
    
    if (name && name.trim()) {
      updateData.name = name.trim();
    }
    
    // Handle file upload if present
    if ((req as any).file) {
      try {
        const file = (req as any).file;
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Preserve the file extension from the uploaded image
        const extension = path.extname(file.originalname) || '.jpg';
        const fileName = `${studentId}-${Date.now()}${extension}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, file.buffer);
        
        updateData.photoUrl = `/uploads/profiles/${fileName}`;
        console.log(`Photo saved to: ${filePath}`);
      } catch (fileError) {
        console.error('Error saving file:', fileError);
        // Continue anyway, just don't update the photo
      }
    }
    
    // Only update if there's something to update
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
            quiz: { select: { title: true, subject: { select: { name: true } } } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });
    
    console.log(`Profile updated for student: ${studentId}`);
    return res.json({ profile: updatedStudent });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Failed to update profile', details: String(error) });
  }
}
