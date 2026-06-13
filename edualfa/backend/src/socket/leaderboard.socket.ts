import { Server } from "socket.io";

export function leaderboardSocket(io: Server) {
  io.on("connection", (socket) => {
    console.log("User connected to leaderboard socket");

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

// SAFE EMIT FUNCTION (no prisma issues)
export async function sendLeaderboard(io: Server) {
  const leaderboard = [];
  io.emit("leaderboard:update", leaderboard);
}