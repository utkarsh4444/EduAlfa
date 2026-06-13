import { Router } from 'express';
import {
  getLeaderboard,
  getLeaderboardBySubject,
  getLeaderboardSubjects,
  getLeaderboardWeekly,
  getLeaderboardMonthly,
} from '../controllers/leaderboard.controller';

const router = Router();

router.get('/', getLeaderboard);
router.get('/weekly', getLeaderboardWeekly);
router.get('/monthly', getLeaderboardMonthly);
router.get('/subjects', getLeaderboardSubjects);
router.get('/subject/:id', getLeaderboardBySubject);

export default router;
