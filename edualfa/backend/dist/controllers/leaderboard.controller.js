"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLeaderboard = calculateLeaderboard;
exports.getLeaderboard = getLeaderboard;
exports.getLeaderboardSubjects = getLeaderboardSubjects;
exports.getLeaderboardBySubject = getLeaderboardBySubject;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function calculateLeaderboard(client = prisma) {
    const attempts = await client.quizAttempt.findMany({ include: { student: true, quiz: true } });
    const grouped = {};
    attempts.forEach((attempt) => {
        const key = attempt.studentId;
        if (!grouped[key]) {
            grouped[key] = {
                studentId: attempt.studentId,
                studentName: attempt.student.name,
                totalScore: 0,
                totalPossible: 0,
                attempts: 0,
                badges: 0,
                fastAttempts: 0,
            };
        }
        grouped[key].totalScore += attempt.score;
        grouped[key].totalPossible += attempt.totalScore;
        grouped[key].attempts += 1;
        if (attempt.timeTaken <= attempt.quiz.duration * 60 * 0.5) {
            grouped[key].fastAttempts += 1;
        }
    });
    const badgeCounts = await client.studentBadge.groupBy({ by: ['studentId'], _count: { id: true } });
    badgeCounts.forEach((badge) => {
        if (grouped[badge.studentId]) {
            grouped[badge.studentId].badges = badge._count.id;
        }
    });
    const leaderboard = Object.values(grouped).map((item) => {
        const accuracyScore = item.totalPossible === 0 ? 0 : (item.totalScore / item.totalPossible) * 100;
        const speedBonus = Math.min(item.fastAttempts * 5, 20);
        const consistencyMultiplier = item.attempts >= 3 ? 1.1 : 1.0;
        const finalScore = Math.round((accuracyScore + speedBonus) * consistencyMultiplier * 10) / 10;
        return {
            studentId: item.studentId,
            studentName: item.studentName,
            quizzes: item.attempts,
            score: finalScore,
            badges: item.badges,
        };
    });
    return leaderboard.sort((a, b) => b.score - a.score).map((entry, index) => ({ rank: index + 1, ...entry }));
}
async function getLeaderboard(req, res) {
    const leaderboard = await calculateLeaderboard();
    return res.json({ leaderboard });
}
async function getLeaderboardSubjects(_req, res) {
    const subjects = await prisma.subject.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } });
    return res.json({ subjects });
}
async function getLeaderboardBySubject(req, res) {
    const { id } = req.params;
    const attempts = await prisma.quizAttempt.findMany({ include: { student: true, quiz: true }, where: { quiz: { subjectId: id } } });
    const grouped = {};
    attempts.forEach((attempt) => {
        const key = attempt.studentId;
        if (!grouped[key]) {
            grouped[key] = {
                studentId: attempt.studentId,
                studentName: attempt.student.name,
                totalScore: 0,
                totalPossible: 0,
                attempts: 0,
                badges: 0,
                fastAttempts: 0,
            };
        }
        grouped[key].totalScore += attempt.score;
        grouped[key].totalPossible += attempt.totalScore;
        grouped[key].attempts += 1;
        if (attempt.timeTaken <= attempt.quiz.duration * 60 * 0.5) {
            grouped[key].fastAttempts += 1;
        }
    });
    const badgeCounts = await prisma.studentBadge.groupBy({ by: ['studentId'], _count: { id: true } });
    badgeCounts.forEach((badge) => {
        if (grouped[badge.studentId]) {
            grouped[badge.studentId].badges = badge._count.id;
        }
    });
    const leaderboard = Object.values(grouped).map((item) => {
        const accuracyScore = item.totalPossible === 0 ? 0 : (item.totalScore / item.totalPossible) * 100;
        const speedBonus = Math.min(item.fastAttempts * 5, 20);
        const consistencyMultiplier = item.attempts >= 3 ? 1.1 : 1.0;
        const finalScore = Math.round((accuracyScore + speedBonus) * consistencyMultiplier * 10) / 10;
        return {
            studentId: item.studentId,
            studentName: item.studentName,
            quizzes: item.attempts,
            score: finalScore,
            badges: item.badges,
        };
    });
    return res.json({ leaderboard: leaderboard.sort((a, b) => b.score - a.score).map((entry, index) => ({ rank: index + 1, ...entry })) });
}
