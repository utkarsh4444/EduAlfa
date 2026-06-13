import express from "express";
import {
  getLeaderboard,
  getLeaderboardBySubject,
  getLeaderboardSubjects,
  getLeaderboardWeekly,
  getLeaderboardMonthly,
} from "../controllers/leaderboard.controller";

const router = express.Router();

router.get("/", getLeaderboard);
router.get("/subject", getLeaderboardBySubject);
router.get("/subjects", getLeaderboardSubjects);
router.get("/weekly", getLeaderboardWeekly);
router.get("/monthly", getLeaderboardMonthly);

export default router;