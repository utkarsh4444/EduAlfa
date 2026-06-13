"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStudents = listStudents;
exports.createStudent = createStudent;
exports.updateStudent = updateStudent;
exports.deleteStudent = deleteStudent;
exports.listSubjects = listSubjects;
exports.createSubject = createSubject;
exports.updateSubject = updateSubject;
exports.deleteSubject = deleteSubject;
exports.listQuizzes = listQuizzes;
exports.getQuiz = getQuiz;
exports.createQuiz = createQuiz;
exports.updateQuiz = updateQuiz;
exports.deleteQuiz = deleteQuiz;
exports.listAttempts = listAttempts;
exports.getStats = getStats;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function formatStudentId(count) {
    const index = count + 1;
    return `STU-2024-${String(index).padStart(3, '0')}`;
}
async function listStudents(req, res) {
    const students = await prisma.student.findMany({
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, studentId: true, createdAt: true },
    });
    return res.json({ students });
}
async function createStudent(req, res) {
    const { name, password } = req.body;
    if (!name || !password) {
        return res.status(400).json({ error: 'Name and password are required' });
    }
    const total = await prisma.student.count();
    const studentId = formatStudentId(total);
    const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
    const student = await prisma.student.create({
        data: { name, studentId, password: hashedPassword, avatarSeed: String(Math.floor(Math.random() * 8) + 1) },
        select: { id: true, name: true, studentId: true, createdAt: true },
    });
    return res.status(201).json({ student });
}
async function updateStudent(req, res) {
    const { id } = req.params;
    const { name, password } = req.body;
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
        return res.status(404).json({ error: 'Student not found' });
    }
    const data = {};
    if (name)
        data.name = name;
    if (password)
        data.password = bcryptjs_1.default.hashSync(password, 10);
    const updated = await prisma.student.update({
        where: { id },
        data,
        select: { id: true, name: true, studentId: true, createdAt: true },
    });
    return res.json({ student: updated });
}
async function deleteStudent(req, res) {
    const { id } = req.params;
    await prisma.student.delete({ where: { id } });
    return res.status(204).send();
}
async function listSubjects(_req, res) {
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });
    return res.json({ subjects });
}
async function createSubject(req, res) {
    const { name, icon, color } = req.body;
    if (!name || !icon || !color) {
        return res.status(400).json({ error: 'Subject name, icon, and color are required' });
    }
    const subject = await prisma.subject.create({ data: { name, icon, color } });
    return res.status(201).json({ subject });
}
async function updateSubject(req, res) {
    const { id } = req.params;
    const { name, icon, color } = req.body;
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) {
        return res.status(404).json({ error: 'Subject not found' });
    }
    const updated = await prisma.subject.update({ where: { id }, data: { name: name ?? subject.name, icon: icon ?? subject.icon, color: color ?? subject.color } });
    return res.json({ subject: updated });
}
async function deleteSubject(req, res) {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id } });
    return res.status(204).send();
}
async function listQuizzes(_req, res) {
    const quizzes = await prisma.quiz.findMany({ include: { subject: true } });
    return res.json({ quizzes });
}
async function getQuiz(req, res) {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
    if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    return res.json({ quiz });
}
async function createQuiz(req, res) {
    const { title, subjectId, duration, questions } = req.body;
    if (!title || !subjectId || !questions || questions.length === 0) {
        return res.status(400).json({ error: 'Quiz title, subject, and questions are required' });
    }
    const quiz = await prisma.quiz.create({
        data: {
            title,
            subjectId,
            duration: duration ?? 10,
            questions: { create: questions.map((question, index) => ({
                    questionText: question.questionText,
                    options: JSON.stringify(question.options),
                    correctAnswer: String(question.correctAnswer),
                    points: question.points ?? 10,
                    orderIndex: question.orderIndex ?? index,
                })) },
        },
        include: { questions: true },
    });
    try {
        const io = req.app.get?.('io');
        if (io)
            io.emit('quiz:created', quiz);
    }
    catch (e) {
        // safe to ignore socket emit errors
    }
    return res.status(201).json({ quiz });
}
async function updateQuiz(req, res) {
    const { id } = req.params;
    const { title, subjectId, duration, questions } = req.body;
    const quiz = await prisma.quiz.findUnique({ where: { id }, include: { questions: true } });
    if (!quiz) {
        return res.status(404).json({ error: 'Quiz not found' });
    }
    await prisma.question.deleteMany({ where: { quizId: id } });
    const updatedQuestions = questions?.map((question, index) => ({
        questionText: question.questionText,
        options: JSON.stringify(question.options),
        correctAnswer: String(question.correctAnswer),
        points: question.points ?? 10,
        orderIndex: question.orderIndex ?? index,
    })) ?? [];
    const updated = await prisma.quiz.update({
        where: { id },
        data: {
            title: title ?? quiz.title,
            subjectId: subjectId ?? quiz.subjectId,
            duration: duration ?? quiz.duration,
            questions: { create: updatedQuestions },
        },
        include: { questions: true },
    });
    try {
        const io = req.app.get?.('io');
        if (io)
            io.emit('quiz:updated', updated);
    }
    catch (e) { }
    return res.json({ quiz: updated });
}
async function deleteQuiz(req, res) {
    const { id } = req.params;
    // capture subjectId before deletion to notify clients
    const quiz = await prisma.quiz.findUnique({ where: { id } });
    await prisma.quiz.delete({ where: { id } });
    try {
        const io = req.app.get?.('io');
        if (io)
            io.emit('quiz:deleted', { id, subjectId: quiz?.subjectId });
    }
    catch (e) { }
    return res.status(204).send();
}
async function listAttempts(_req, res) {
    const attempts = await prisma.quizAttempt.findMany({
        include: {
            student: { select: { id: true, name: true, studentId: true } },
            quiz: { include: { subject: true } },
        },
        orderBy: { submittedAt: 'desc' },
        take: 50,
    });
    return res.json({ attempts });
}
async function getStats(_req, res) {
    const studentCount = await prisma.student.count();
    const subjectCount = await prisma.subject.count();
    const quizCount = await prisma.quiz.count();
    const attemptCount = await prisma.quizAttempt.count();
    return res.json({ stats: { students: studentCount, subjects: subjectCount, quizzes: quizCount, attempts: attemptCount } });
}
