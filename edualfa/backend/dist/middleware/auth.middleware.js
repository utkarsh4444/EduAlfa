"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
function authMiddleware(allowedRoles) {
    return async (req, res, next) => {
        try {
            const authorization = req.headers.authorization;
            if (!authorization || !authorization.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Authorization token missing' });
            }
            const token = authorization.replace('Bearer ', '');
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                return res.status(500).json({ error: 'Server token configuration missing' });
            }
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            if (!decoded || !allowedRoles.includes(decoded.role)) {
                return res.status(401).json({ error: 'Unauthorized access' });
            }
            if (decoded.role === 'student') {
                const student = await prisma.student.findUnique({ where: { id: decoded.userId } });
                if (!student) {
                    return res.status(401).json({ error: 'Student not found' });
                }
                req.user = { id: student.id, role: decoded.role, name: student.name, studentId: student.studentId };
            }
            else {
                req.user = { id: decoded.userId, role: decoded.role };
            }
            next();
        }
        catch (error) {
            return res.status(401).json({ error: 'Invalid or expired token' });
        }
    };
}
