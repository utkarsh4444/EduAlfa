"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const student_routes_1 = __importDefault(require("./routes/student.routes"));
const leaderboard_routes_1 = __importDefault(require("./routes/leaderboard.routes"));
const auth_middleware_1 = require("./middleware/auth.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const leaderboard_socket_1 = require("./socket/leaderboard.socket");
const seedModule = require('../prisma/seed');
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});
const prisma = new client_1.PrismaClient();
// Allow all origins since frontend is served from same server
app.use((0, cors_1.default)({ credentials: true }));
app.use((0, express_1.json)());
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Serve frontend static files
const frontendPath = path_1.default.join(__dirname, '../../frontend/dist');
app.use(express_1.default.static(frontendPath));
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});
app.use('/api/auth', auth_routes_1.default);
app.use('/api/admin', (0, auth_middleware_1.authMiddleware)(['admin']), admin_routes_1.default);
app.use('/api/student', (0, auth_middleware_1.authMiddleware)(['student']), student_routes_1.default);
app.use('/api/leaderboard', leaderboard_routes_1.default);
app.set('io', io);
// SPA fallback: serve index.html for all non-API routes
app.get('*', (_req, res) => {
    res.sendFile(path_1.default.join(frontendPath, 'index.html'));
});
app.use(error_middleware_1.errorHandler);
(0, leaderboard_socket_1.initLeaderboardSocket)(io, prisma);
const port = Number(process.env.PORT ?? 5000);
async function seedBadges() {
    const badgeDefinitions = [
        { name: 'Top Scholar', description: 'Rank 1 achiever in leaderboard', icon: '🥇', condition: 'rank1', rarity: 'legendary' },
        { name: 'On Fire', description: '3 quiz streak unlocked', icon: '🔥', condition: 'streak3', rarity: 'rare' },
        { name: 'Speed Demon', description: 'Fast quiz submission bonus earned', icon: '⚡', condition: 'speed', rarity: 'rare' },
        { name: 'Perfectionist', description: 'Perfect score achieved', icon: '💯', condition: 'perfect', rarity: 'epic' },
        { name: 'Subject Expert', description: 'Mastered a subject with high score', icon: '📚', condition: 'subject_expert', rarity: 'uncommon' },
        { name: 'Easy Master', description: 'Scored 80%+ on Easy quiz', icon: '🟢', condition: 'easy_master', rarity: 'uncommon' },
        { name: 'Medium Master', description: 'Scored 80%+ on Medium quiz', icon: '🟡', condition: 'medium_master', rarity: 'rare' },
        { name: 'Hard Master', description: 'Scored 80%+ on Hard quiz', icon: '🔴', condition: 'hard_master', rarity: 'epic' },
        { name: 'Subject Champion', description: 'Completed all three difficulty levels', icon: '🏆', condition: 'subject_champion', rarity: 'legendary' },
    ];
    for (const badge of badgeDefinitions) {
        const existingBadge = await prisma.badge.findFirst({ where: { condition: badge.condition } });
        if (existingBadge) {
            await prisma.badge.update({
                where: { id: existingBadge.id },
                data: badge,
            });
        }
        else {
            await prisma.badge.create({ data: badge });
        }
    }
}
async function start() {
    await prisma.$connect();
    await seedBadges();
    if (seedModule?.main) {
        try {
            await seedModule.main();
        }
        catch (seedError) {
            console.error('Error running seed script:', seedError);
        }
    }
    server.listen(port, () => {
        console.log(`EduAlfa backend running on http://localhost:${port}`);
    });
}
start().catch((error) => {
    console.error('Server startup failed', error);
    process.exit(1);
});
