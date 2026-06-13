import { Router } from 'express';
import {
  listStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  listQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  listAttempts,
  getStats,
} from '../controllers/admin.controller';

const router = Router();

router.get('/students', listStudents);
router.post('/students', createStudent);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);

router.get('/subjects', listSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

router.get('/quizzes', listQuizzes);
router.get('/quizzes/:id', getQuiz);
router.post('/quizzes', createQuiz);
router.put('/quizzes/:id', updateQuiz);
router.delete('/quizzes/:id', deleteQuiz);

router.get('/attempts', listAttempts);
router.get('/stats', getStats);

export default router;
