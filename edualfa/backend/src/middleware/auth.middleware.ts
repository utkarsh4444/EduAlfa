import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JwtPayload {
  userId: string;
  role: 'admin' | 'student';
}

export function authMiddleware(allowedRoles: ('admin' | 'student')[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization token missing' });
      }

      const token = authorization.replace('Bearer ', '');
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        return res.status(500).json({ error: 'Server token configuration missing' });
      }

      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (!decoded || !allowedRoles.includes(decoded.role)) {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      if (decoded.role === 'student') {
        const student = await prisma.student.findUnique({ where: { id: decoded.userId } });
        if (!student) {
          return res.status(401).json({ error: 'Student not found' });
        }
        req.user = { id: student.id, role: decoded.role, name: student.name, studentId: student.studentId };
      } else {
        req.user = { id: decoded.userId, role: decoded.role };
      }

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}
