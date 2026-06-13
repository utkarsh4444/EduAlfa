"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaderboardSocket = leaderboardSocket;
exports.sendLeaderboard = sendLeaderboard;
function leaderboardSocket(io) {
    io.on("connection", (socket) => {
        console.log("User connected to leaderboard socket");
        socket.on("disconnect", () => {
            console.log("User disconnected");
        });
    });
}
// SAFE EMIT FUNCTION (no prisma issues)
async function sendLeaderboard(io) {
    const leaderboard = [];
    io.emit("leaderboard:update", leaderboard);
}
