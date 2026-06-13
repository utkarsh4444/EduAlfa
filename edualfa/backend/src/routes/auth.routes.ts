import { Router } from 'express';
import { adminLogin, studentLogin, studentRegister, getCurrentUser } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/admin-login', adminLogin);
router.post('/student-login', studentLogin);
router.post('/student-register', studentRegister);
router.get('/me', authMiddleware(['admin', 'student']), getCurrentUser);

export default router;
