"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLeaderboardSocket = initLeaderboardSocket;
const leaderboard_controller_1 = require("../controllers/leaderboard.controller");
function initLeaderboardSocket(io, prisma) {
    io.on('connection', async (socket) => {
        const leaderboard = await (0, leaderboard_controller_1.calculateLeaderboard)(prisma);
        socket.emit('leaderboard:update', leaderboard);
        socket.on('join:student', (studentId) => {
            socket.join(`student:${studentId}`);
        });
    });
}
