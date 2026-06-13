"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLogin = adminLogin;
exports.studentLogin = studentLogin;
exports.studentRegister = studentRegister;
exports.getCurrentUser = getCurrentUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const generateToken = (userId, role) => {
    const secret = process.env.JWT_SECRET ?? 'edualfa-secret-key-minimum-32-characters';
    return jsonwebtoken_1.default.sign({ userId, role }, secret, { expiresIn: '8h' });
};
async function adminLogin(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    const expectedUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD ?? 'admin123';
    if (username !== expectedUsername || password !== expectedPassword) {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    const token = generateToken(expectedUsername, 'admin');
    return res.json({ token, user: { username: expectedUsername, role: 'admin' } });
}
async function studentLogin(req, res) {
    const { studentId, password } = req.body;
    if (!studentId || !password) {
        return res.status(400).json({ error: 'Student ID and password are required' });
    }
    const student = await prisma.student.findUnique({ where: { studentId } });
    if (!student) {
        return res.status(401).json({ error: 'Invalid student credentials' });
    }
    const valid = bcryptjs_1.default.compareSync(password, student.password);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid student credentials' });
    }
    const token = generateToken(student.id, 'student');
    return res.json({ token, user: { id: student.id, name: student.name, studentId: student.studentId, role: 'student' } });
}
async function studentRegister(req, res) {
    const { name, studentId, password, confirmPassword } = req.body;
    if (!name || !studentId || !password || !confirmPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const existingStudent = await prisma.student.findUnique({ where: { studentId } });
    if (existingStudent) {
        return res.status(409).json({ error: 'Student ID already exists' });
    }
    const hashedPassword = bcryptjs_1.default.hashSync(password, 10);
    const student = await prisma.student.create({
        data: {
            name,
            studentId,
            password: hashedPassword,
        },
    });
    const token = generateToken(student.id, 'student');
    return res.json({
        token,
        user: { id: student.id, name: student.name, studentId: student.studentId, role: 'student' },
    });
}
async function getCurrentUser(req, res) {
    if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    return res.json({ user: req.user });
}
