import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'admin' | 'student';
        name?: string;
        studentId?: string;
      };
    }
  }
}
