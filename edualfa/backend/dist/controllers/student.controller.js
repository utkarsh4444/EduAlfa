"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubjects = getSubjects;
exports.getSubjectQuizzes = getSubjectQuizzes;
exports.getQuiz = getQuiz;
exports.submitQuiz = submitQuiz;
exports.getStudentAttempts = getStudentAttempts;
exports.getStudentProfile = getStudentProfile;
const client_1 = require("@prisma/client");
const leaderboard_controller_1 = require("./leaderboard.controller");
const prisma = new client_1.PrismaClient();
async function getSubjects(_req, res) {
    const subjects = await prisma.subject.findMany({ include: { quizzes: true }, orderBy: { name: 'asc' } });
    return res.json({ subjects });
}
async function getSubjectQuizzes(req, res) {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({ where: { id }, include: { quizzes: true } });
    if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
    }
    return res.json({ subject, quizzes: subject.quizzes });
}
async function getQuiz(req, res) {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: { orderBy: { orderIndex: 'asc' } }, subject: true } });
    if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    const quizSafe = {
        id: quiz.id,
        title: quiz.title,
        duration: quiz.duration,
        subject: quiz.subject,
        questions: quiz.questions.map((question) => ({
            id: question.id,
            questionText: question.questionText,
            options: JSON.parse(question.options),
            points: question.points,
            orderIndex: question.orderIndex,
        })),
    };
    return res.json({ quiz: quizSafe });
}
function calculateScore(correctPoints, totalPoints, fastAttempts, attempts) {
    const accuracyScore = totalPoints === 0 ? 0 : (correctPoints / totalPoints) * 100;
    const speedBonus = Math.min(fastAttempts * 5, 20);
    const consistencyMultiplier = attempts >= 3 ? 1.1 : 1.0;
    return Math.round((accuracyScore + speedBonus) * consistencyMultiplier * 10) / 10;
}
async function earnBadge(studentId, condition) {
    const badge = await prisma.badge.findFirst({ where: { condition } });
    if (!badge)
        return;
    const existingBadge = await prisma.studentBadge.findFirst({ where: { studentId, badgeId: badge.id } });
    if (!existingBadge) {
        await prisma.studentBadge.create({ data: { studentId, badgeId: badge.id } });
    }
}
async function submitQuiz(req, res) {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;
    if (!answers || typeof timeTaken !== 'number') {
        return res.status(400).json({ error: 'Answers and time taken are required' });
    }
    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
    if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    const studentId = req.user?.id;
    const totalScore = quiz.questions.reduce((sum, q) => sum + q.points, 0);
    const answeredQuestionCount = Object.keys(answers).length;
    if (answeredQuestionCount === 0) {
        return res.status(400).json({ error: 'At least one answer must be submitted' });
    }
    let fastAttempts = 0;
    let correctPoints = 0;
    quiz.questions.forEach((question) => {
        const selected = answers[question.id];
        if (selected === question.correctAnswer) {
            correctPoints += question.points;
        }
        if (timeTaken <= quiz.duration * 60 * 0.5) {
            fastAttempts += 1;
        }
    });
    const score = correctPoints;
    const attempt = await prisma.quizAttempt.create({
        data: {
            studentId,
            quizId: quiz.id,
            score,
            totalScore,
            timeTaken,
            answers: JSON.stringify(answers),
        },
        include: { quiz: true, student: true },
    });
    const aimScore = Math.round((score / totalScore) * 100);
    if (score === totalScore) {
        await earnBadge(studentId, 'perfect');
    }
    if (timeTaken <= quiz.duration * 60 * 0.5) {
        await earnBadge(studentId, 'speed');
    }
    if (aimScore >= 90) {
        await earnBadge(studentId, 'subject_expert');
    }
    const leaderboard = await (0, leaderboard_controller_1.calculateLeaderboard)(prisma);
    const socketNamespace = req.app.get('io');
    socketNamespace?.emit('leaderboard:update', leaderboard);
    return res.json({ attempt, leaderboard });
}
async function getStudentAttempts(req, res) {
    const studentId = req.user?.id;
    const attempts = await prisma.quizAttempt.findMany({
        where: { studentId },
        include: { quiz: { include: { subject: true } } },
        orderBy: { submittedAt: 'desc' },
    });
    return res.json({ attempts });
}
async function getStudentProfile(req, res) {
    const studentId = req.user?.id;
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            badges: { include: { badge: true } },
            attempts: {
                select: {
                    id: true,
                    score: true,
                    totalScore: true,
                    submittedAt: true,
                    quiz: { select: { title: true, subject: { select: { name: true } } } },
                },
                orderBy: { submittedAt: 'desc' },
            },
        },
    });
    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }
    return res.json({ profile: student });
}
