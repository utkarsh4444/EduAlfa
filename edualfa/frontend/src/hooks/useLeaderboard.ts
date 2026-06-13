import { useEffect, useMemo, useState } from 'react';
import { useSocket } from './useSocket';
import api from '../lib/axios';

export interface LeaderboardEntry {
  rank: number;
  studentId: string;
  studentName: string;
  score: number;
  quizzes: number;
  badges: number;
}

export function useLeaderboard() {
  const socket = useSocket();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [previousRanks, setPreviousRanks] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        const response = await api.get('/leaderboard');
        setLeaderboard(response.data.leaderboard);
      } catch {
        // ignore fetch errors
      }
    };

    loadLeaderboard();
  }, []);

  useEffect(() => {
    const handleUpdate = (data: LeaderboardEntry[]) => {
      setPreviousRanks((current) => {
        const next: Record<string, number> = {};
        data.forEach((entry) => {
          next[entry.studentId] = current[entry.studentId] ?? entry.rank;
        });
        return next;
      });
      setLeaderboard(data);
    };
    if (!socket) return;
    socket.on('leaderboard:update', handleUpdate);
    return () => {
      socket.off('leaderboard:update', handleUpdate);
    };
  }, [socket]);

  return useMemo(() => ({ leaderboard, previousRanks }), [leaderboard, previousRanks]);
}
