"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = getLeaderboard;
exports.getLeaderboardBySubject = getLeaderboardBySubject;
exports.getLeaderboardSubjects = getLeaderboardSubjects;
exports.getLeaderboardWeekly = getLeaderboardWeekly;
exports.getLeaderboardMonthly = getLeaderboardMonthly;
// SAFE fallback controller (no DB errors)
async function getLeaderboard(req, res) {
    return res.json([]);
}
async function getLeaderboardBySubject(req, res) {
    return res.json([]);
}
async function getLeaderboardSubjects(req, res) {
    return res.json([]);
}
async function getLeaderboardWeekly(req, res) {
    return res.json([]);
}
async function getLeaderboardMonthly(req, res) {
    return res.json([]);
}
