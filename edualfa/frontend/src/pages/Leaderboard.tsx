import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { LeaderboardEntry, useLeaderboard } from '../hooks/useLeaderboard';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leaderboard, previousRanks } = useLeaderboard();
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedRange, setSelectedRange] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [subjectOptions, setSubjectOptions] = useState<{ id: string; name: string }[]>([]);
  const [displayed, setDisplayed] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/leaderboard/subjects')
      .then((response) => {
        const subjects = Array.isArray(response.data) ? response.data : response.data.subjects ?? [];
        setSubjectOptions(subjects);
      })
      .catch(() => setSubjectOptions([]));
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams();
        if (selectedRange !== 'all') query.set('range', selectedRange);
        if (selectedSubject !== 'all') query.set('subjectId', selectedSubject);
        const response = await api.get(`/leaderboard${query.toString() ? `?${query.toString()}` : ''}`);
        const lb = Array.isArray(response.data) ? response.data : response.data.leaderboard ?? [];
        setDisplayed(lb);
      } catch {
        setError('Could not load leaderboard. Showing current results.');
        setDisplayed(leaderboard);
      } finally {
        setIsLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedRange, selectedSubject, leaderboard]);

  useEffect(() => {
    if (selectedSubject === 'all' && selectedRange === 'all') {
      setDisplayed(leaderboard);
    }
  }, [leaderboard, selectedSubject, selectedRange]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0A0A0F] to-[#1A1A24] flex flex-col p-4 sm:p-6 md:p-8">
      <div className="mb-6 md:mb-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#27272e]"
        >
          ← Back
        </button>
        <div className="mt-4">
          <p className="text-sm uppercase tracking-[0.4em] text-[#FFD700]/70">Leaderboard</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mt-2" style={{ fontFamily: 'Syne, sans-serif' }}>🏆 Leaderboard</h1>
        </div>
      </div>
      <div className="flex-1 grid gap-5 lg:grid-cols-[1fr_0.4fr] w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-4 sm:p-6 md:p-8 flex flex-col">
          <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-[#8C8C9D]">Live rank updates</p>
              <p className="text-sm text-[#34D399]">● Live</p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value)}
                className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-3 sm:px-4 py-2 sm:py-3 text-sm text-white outline-none flex-1 sm:flex-none"
              >
                <option value="all">Overall</option>
                {subjectOptions.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <select
                value={selectedRange}
                onChange={(event) => setSelectedRange(event.target.value as 'all' | 'weekly' | 'monthly')}
                className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-3 sm:px-4 py-2 sm:py-3 text-sm text-white outline-none flex-1 sm:flex-none"
              >
                <option value="all">All Time</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>
          <div className="grid gap-3 sm:gap-4 flex-1 overflow-y-auto">
            <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-3">
              {displayed.slice(0, 3).map((entry) => (
                <div key={entry.studentId} className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4 sm:p-5 text-center">
                  <p className="text-sm text-[#8C8C9D]">{entry.rank === 1 ? 'Gold' : entry.rank === 2 ? 'Silver' : 'Bronze'}</p>
                  <p className="mt-3 text-2xl sm:text-3xl font-semibold text-[#FFD700]">#{entry.rank}</p>
                  <p className="mt-2 text-sm sm:text-base">{entry.studentName}</p>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-3xl border border-[#2A2A38] bg-[#111118] flex-1 flex flex-col">
              <div className="grid gap-0 divide-y divide-[#2A2A38] flex-1 flex flex-col">
                <div className="hidden grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr] px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-[0.2em] text-[#8C8C9D] lg:grid">
                  <span>Rank</span>
                  <span>Student</span>
                  <span>Score</span>
                  <span>Quizzes</span>
                  <span>Badges</span>
                </div>
                <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 lg:p-0 overflow-y-auto flex-1">
                  <AnimatePresence>
                    {displayed.map((entry) => {
                      const isCurrent = user?.id === entry.studentId;
                      return (
                        <motion.div
                          key={entry.studentId}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.25 }}
                          className={`rounded-2xl sm:rounded-3xl border border-[#2A2A38] p-3 sm:p-4 lg:grid lg:grid-cols-[0.5fr_1.5fr_1fr_1fr_1fr] lg:items-center lg:gap-3 text-sm sm:text-base ${isCurrent ? 'bg-[#2E1B3F]' : 'bg-[#1A1A24]'}`}
                        >
                        <div className="flex items-center gap-2 font-semibold text-white lg:block">
                          <span className="text-base sm:text-lg">#{entry.rank}</span>
                          <span className="text-xs sm:text-sm text-[#8C8C9D] lg:hidden">Rank</span>
                        </div>
                        <div className="mt-2 sm:mt-3 lg:mt-0">
                          <p className="font-semibold text-white text-sm sm:text-base">{entry.studentName}</p>
                          <p className="text-xs sm:text-sm text-[#8C8C9D] hidden lg:block">Student</p>
                        </div>
                        <div className="mt-2 sm:mt-3 lg:mt-0">
                          <p className="font-semibold text-white text-sm sm:text-base">{entry.score}</p>
                          <p className="text-xs sm:text-sm text-[#8C8C9D] hidden lg:block">Score</p>
                        </div>
                        <div className="mt-2 sm:mt-3 lg:mt-0">
                          <p className="font-semibold text-white text-sm sm:text-base">{entry.quizzes}</p>
                          <p className="text-xs sm:text-sm text-[#8C8C9D] hidden lg:block">Quizzes</p>
                        </div>
                        <div className="mt-2 sm:mt-3 flex items-center gap-2 lg:mt-0">
                          <span className="font-semibold text-white text-sm sm:text-base">{entry.badges}</span>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#8C8C9D]">
                            {previousRanks[entry.studentId] > entry.rank && <span className="text-[#34D399]">▲</span>}
                            {previousRanks[entry.studentId] < entry.rank && <span className="text-[#FB7185]">▼</span>}
                          </div>
                        </div>
                      </motion.div>
                    )})}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
