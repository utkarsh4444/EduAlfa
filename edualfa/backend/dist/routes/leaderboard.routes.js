"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
const router = (0, express_1.Router)();
router.get('/', leaderboard_controller_1.getLeaderboard);
router.get('/subjects', leaderboard_controller_1.getLeaderboardSubjects);
router.get('/subject/:id', leaderboard_controller_1.getLeaderboardBySubject);
exports.default = router;
