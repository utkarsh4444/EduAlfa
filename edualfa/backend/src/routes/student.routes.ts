import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { getSubjects, getSubjectQuizzes, getQuiz, submitQuiz, getStudentAttempts, getStudentProfile, updateStudentProfile } from '../controllers/student.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public endpoints
router.get('/subjects', getSubjects);
router.get('/subjects/:id/quizzes', getSubjectQuizzes);
router.get('/quizzes/:id', getQuiz);

// Protected endpoints
router.post('/quizzes/:id/submit', authMiddleware(['student']), submitQuiz);
router.get('/attempts', authMiddleware(['student']), getStudentAttempts);
router.get('/profile', authMiddleware(['student']), getStudentProfile);
router.post('/profile/update', authMiddleware(['student']), upload.single('photo'), updateStudentProfile);

export default router;
