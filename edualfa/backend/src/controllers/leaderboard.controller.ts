import { Request, Response } from "express";

// SAFE fallback controller (no DB errors)
export async function getLeaderboard(req: Request, res: Response) {
  return res.json([]);
}

export async function getLeaderboardBySubject(req: Request, res: Response) {
  return res.json([]);
}

export async function getLeaderboardSubjects(req: Request, res: Response) {
  return res.json([]);
}

export async function getLeaderboardWeekly(req: Request, res: Response) {
  return res.json([]);
}

export async function getLeaderboardMonthly(req: Request, res: Response) {
  return res.json([]);
}