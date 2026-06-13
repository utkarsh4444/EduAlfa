"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const router = express_1.default.Router();
router.get("/", leaderboard_controller_1.getLeaderboard);
router.get("/subject", leaderboard_controller_1.getLeaderboardBySubject);
router.get("/subjects", leaderboard_controller_1.getLeaderboardSubjects);
router.get("/weekly", leaderboard_controller_1.getLeaderboardWeekly);
router.get("/monthly", leaderboard_controller_1.getLeaderboardMonthly);
exports.default = router;
