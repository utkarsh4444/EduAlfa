import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const generateToken = (userId: string, role: 'admin' | 'student') => {
  const secret = process.env.JWT_SECRET ?? 'edualfa-secret-key-minimum-32-characters';
  return jwt.sign({ userId, role }, secret, { expiresIn: '8h' });
};

export async function adminLogin(req: Request, res: Response) {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const expectedUsername = process.env.ADMIN_USERNAME ?? 'admin';
  const expectedPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
  if (username !== expectedUsername || password !== expectedPassword) {
    return res.status(401).json({ error: 'Invalid admin credentials' });
  }

  const token = generateToken(expectedUsername, 'admin');
  return res.json({ token, user: { username: expectedUsername, role: 'admin' } });
}

export async function studentLogin(req: Request, res: Response) {
  const { studentId, password } = req.body as { studentId?: string; password?: string };
  if (!studentId || !password) {
    return res.status(400).json({ error: 'Student ID and password are required' });
  }

  const student = await prisma.student.findUnique({ where: { studentId } });
  if (!student) {
    return res.status(401).json({ error: 'Invalid student credentials' });
  }

  const valid = bcrypt.compareSync(password, student.password);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid student credentials' });
  }

  const token = generateToken(student.id, 'student');
  return res.json({ token, user: { id: student.id, name: student.name, studentId: student.studentId, role: 'student' } });
}

export async function studentRegister(req: Request, res: Response) {
  const { name, studentId, password, confirmPassword } = req.body as {
    name?: string;
    studentId?: string;
    password?: string;
    confirmPassword?: string;
  };

  if (!name || !studentId || !password || !confirmPassword) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const existingStudent = await prisma.student.findUnique({ where: { studentId } });
  if (existingStudent) {
    return res.status(409).json({ error: 'Student ID already exists' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const student = await prisma.student.create({
    data: {
      name,
      studentId,
      password: hashedPassword,
    },
  });

  const token = generateToken(student.id, 'student');
  return res.json({
    token,
    user: { id: student.id, name: student.name, studentId: student.studentId, role: 'student' },
  });
}

export async function getCurrentUser(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  return res.json({ user: req.user });
}
