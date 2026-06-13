"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const student_controller_1 = require("../controllers/student.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
router.get('/subjects', student_controller_1.getSubjects);
router.get('/subjects/:id/quizzes', student_controller_1.getSubjectQuizzes);
router.get('/quizzes/:id', student_controller_1.getQuiz);
router.post('/quizzes/:id/submit', student_controller_1.submitQuiz);
router.get('/attempts', student_controller_1.getStudentAttempts);
router.get('/profile', student_controller_1.getStudentProfile);
router.post('/profile/update', upload.single('photo'), student_controller_1.updateStudentProfile);
exports.default = router;
