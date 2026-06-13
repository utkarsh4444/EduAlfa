import { Router } from 'express';
import multer from 'multer';
import { getSubjects, getSubjectQuizzes, getQuiz, submitQuiz, getStudentAttempts, getStudentProfile, updateStudentProfile } from '../controllers/student.controller';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/subjects', getSubjects);
router.get('/subjects/:id/quizzes', getSubjectQuizzes);
router.get('/quizzes/:id', getQuiz);
router.post('/quizzes/:id/submit', submitQuiz);
router.get('/attempts', getStudentAttempts);
router.get('/profile', getStudentProfile);
router.post('/profile/update', upload.single('photo'), updateStudentProfile);

export default router;
