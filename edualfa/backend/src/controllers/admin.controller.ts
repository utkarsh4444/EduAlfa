import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function formatStudentId(count: number) {
  const index = count + 1;
  return `STU-2024-${String(index).padStart(3, '0')}`;
}

export async function listStudents(req: Request, res: Response) {
  const students = await prisma.student.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, studentId: true, createdAt: true },
  });
  return res.json({ students });
}

export async function createStudent(req: Request, res: Response) {
  const { name, password } = req.body as { name?: string; password?: string };
  if (!name || !password) {
    return res.status(400).json({ error: 'Name and password are required' });
  }

  const total = await prisma.student.count();
  const studentId = formatStudentId(total);
  const hashedPassword = bcrypt.hashSync(password, 10);

  const student = await prisma.student.create({
    data: { name, studentId, password: hashedPassword, avatarSeed: String(Math.floor(Math.random() * 8) + 1) },
    select: { id: true, name: true, studentId: true, createdAt: true },
  });

  return res.status(201).json({ student });
}

export async function updateStudent(req: Request, res: Response) {
  const { id } = req.params;
  const { name, password } = req.body as { name?: string; password?: string };
  const student = await prisma.student.findUnique({ where: { id } });
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const data: { name?: string; password?: string } = {};
  if (name) data.name = name;
  if (password) data.password = bcrypt.hashSync(password, 10);

  const updated = await prisma.student.update({
    where: { id },
    data,
    select: { id: true, name: true, studentId: true, createdAt: true },
  });
  return res.json({ student: updated });
}

export async function deleteStudent(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.student.delete({ where: { id } });
  return res.status(204).send();
}

export async function listSubjects(_req: Request, res: Response) {
  const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
  return res.json({ subjects });
}

export async function createSubject(req: Request, res: Response) {
  const { name, icon, color } = req.body as { name?: string; icon?: string; color?: string };
  if (!name || !icon || !color) {
    return res.status(400).json({ error: 'Subject name, icon, and color are required' });
  }
  const subject = await prisma.subject.create({ data: { name, icon, color } });
  return res.status(201).json({ subject });
}

export async function updateSubject(req: Request, res: Response) {
  const { id } = req.params;
  const { name, icon, color } = req.body as { name?: string; icon?: string; color?: string };
  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) {
    return res.status(404).json({ error: 'Subject not found' });
  }
  const updated = await prisma.subject.update({ where: { id }, data: { name: name ?? subject.name, icon: icon ?? subject.icon, color: color ?? subject.color } });
  return res.json({ subject: updated });
}

export async function deleteSubject(req: Request, res: Response) {
  const { id } = req.params;
  await prisma.subject.delete({ where: { id } });
  return res.status(204).send();
}

export async function listQuizzes(_req: Request, res: Response) {
  const quizzes = await prisma.quiz.findMany({ include: { subject: true } });
  return res.json({ quizzes });
}

export async function getQuiz(req: Request, res: Response) {
  const { id } = req.params;
  const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }
  return res.json({ quiz });
}

export async function createQuiz(req: Request, res: Response) {
  const { title, subjectId, duration, questions } = req.body as {
    title?: string;
    subjectId?: string;
    duration?: number;
    questions?: { questionText: string; options: string[]; correctAnswer: string | number; points?: number; orderIndex?: number }[];
  };

  if (!title || !subjectId || !questions || questions.length === 0) {
    return res.status(400).json({ error: 'Quiz title, subject, and questions are required' });
  }

  const quiz = await prisma.quiz.create({
    data: {
      title,
      subjectId,
      duration: duration ?? 10,
      questions: { create: questions.map((question, index) => ({
        questionText: question.questionText,
        options: JSON.stringify(question.options),
        correctAnswer: String(question.correctAnswer),
        points: question.points ?? 10,
        orderIndex: question.orderIndex ?? index,
      })) },
    },
    include: { questions: true },
  });

  try {
    const io = (req.app as any).get?.('io');
    if (io) io.emit('quiz:created', quiz);
  } catch (e) {
    // safe to ignore socket emit errors
  }

  return res.status(201).json({ quiz });
}


export async function updateQuiz(req: Request, res: Response) {
  const { id } = req.params;
  const { title, subjectId, duration, questions } = req.body as {
    title?: string;
    subjectId?: string;
    duration?: number;
    questions?: { id?: string; questionText: string; options: string[]; correctAnswer: string | number; points?: number; orderIndex?: number }[];
  };

  const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
  if (!quiz) {
    return res.status(404).json({ error: 'Quiz not found' });
  }

  await prisma.question.deleteMany({ where: { quizId: id } });
  const updatedQuestions = questions?.map((question, index) => ({
    questionText: question.questionText,
    options: JSON.stringify(question.options),
    correctAnswer: String(question.correctAnswer),
    points: question.points ?? 10,
    orderIndex: question.orderIndex ?? index,
  })) ?? [];

  const updated = await prisma.quiz.update({
    where: { id },
    data: {
      title: title ?? quiz.title,
      subjectId: subjectId ?? quiz.subjectId,
      duration: duration ?? quiz.duration,
      questions: { create: updatedQuestions },
    },
    include: { questions: true },
  });

  try {
    const io = (req.app as any).get?.('io');
    if (io) io.emit('quiz:updated', updated);
  } catch (e) {}

  return res.json({ quiz: updated });
}

export async function deleteQuiz(req: Request, res: Response) {
  const { id } = req.params;
  // capture subjectId before deletion to notify clients
  const quiz = await prisma.quiz.findUnique({ where: { id } });
  await prisma.quiz.delete({ where: { id } });
  try {
    const io = (req.app as any).get?.('io');
    if (io) io.emit('quiz:deleted', { id, subjectId: quiz?.subjectId });
  } catch (e) {}
  return res.status(204).send();
}

export async function listAttempts(_req: Request, res: Response) {
  const attempts = await prisma.quizAttempt.findMany({
    include: {
      student: { select: { id: true, name: true, studentId: true } },
      quiz: { include: { subject: true } },
    },
    orderBy: { submittedAt: 'desc' },
    take: 50,
  });
  return res.json({ attempts });
}

export async function getStats(_req: Request, res: Response) {
  const studentCount = await prisma.student.count();
  const subjectCount = await prisma.subject.count();
  const quizCount = await prisma.quiz.count();
  const attemptCount = await prisma.quizAttempt.count();
  return res.json({ stats: { students: studentCount, subjects: subjectCount, quizzes: quizCount, attempts: attemptCount } });
}
