import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { useAuth } from '../../context/AuthContext';
import { ScoreCard } from '../../components/ui/ScoreCard';
import { BadgePopup } from '../../components/ui/BadgePopup';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import QuickActions from '../../components/dashboard/QuickActions';

interface SubjectType {
  id: string;
  name: string;
  icon: string;
  color: string;
  quizzes: { id: string }[];
}

interface AttemptType {
  id: string;
  score: number;
  totalScore: number;
  submittedAt: string;
  quiz: { id: string; title: string; subject: { name: string } };
}

const difficultyMap: Record<string, { label: string; tone: string }> = {
  Mathematics: { label: 'Hard', tone: 'text-[#F87171]' },
  Science: { label: 'Medium', tone: 'text-[#FBBF24]' },
  English: { label: 'Easy', tone: 'text-[#34D399]' },
  'Social Studies': { label: 'Medium', tone: 'text-[#FBBF24]' },
  Hindi: { label: 'Easy', tone: 'text-[#34D399]' },
  'Computer': { label: 'Medium', tone: 'text-[#60A5FA]' },
  'General Knowledge': { label: 'Easy', tone: 'text-[#34D399]' },
  Economics: { label: 'Medium', tone: 'text-[#FBBF24]' },
  Geography: { label: 'Medium', tone: 'text-[#FBBF24]' },
  History: { label: 'Medium', tone: 'text-[#FBBF24]' },
};

export default function StudentDashboard() {
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [attempts, setAttempts] = useState<AttemptType[]>([]);
  const [badges, setBadges] = useState<{ badge: { name: string; rarity: string; icon: string } }[]>([]);
  const { leaderboard } = useLeaderboard();
  const { user } = useAuth();

  useEffect(() => {
    api.get('/student/subjects').then((response) => setSubjects(response.data.subjects));
    api.get('/student/attempts').then((response) => setAttempts(response.data.attempts));
    api.get('/student/profile').then((response) => {
      setBadges(response.data.profile.badges ?? []);
    });
  }, []);

  const stats = useMemo(() => {
    const quizzes = attempts.length;
    const average = quizzes
      ? Number((attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalScore) * 100, 0) / quizzes).toFixed(0))
      : 0;
    const highest = attempts.reduce((max, attempt) => Math.max(max, attempt.score), 0);
    const totalXP = quizzes * 25 + average * 5;
    const streak = attempts.length
      ? attempts.reduce((days, attempt, index, arr) => {
          if (index === 0) return 1;
          const current = new Date(attempt.submittedAt);
          const previous = new Date(arr[index - 1].submittedAt);
          const diff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
          return diff === 1 ? days + 1 : days;
        }, 1)
      : 0;
    const rank = user ? leaderboard.find((entry) => entry.studentId === user.id)?.rank ?? 0 : 0;
    const uniqueQuizIds = new Set(attempts.map((attempt) => attempt.quiz.id)).size;
    const totalAvailableQuizzes = subjects.reduce((count, subject) => count + subject.quizzes.length, 0);
    const completion = totalAvailableQuizzes ? Math.round((uniqueQuizIds / totalAvailableQuizzes) * 100) : 0;
    return { quizzes, average, highest, xp: totalXP, streak, rank, completion };
  }, [attempts, leaderboard, user, subjects]);

  const subjectProgress = useMemo(
    () => subjects.map((subject) => {
      const attemptsForSubject = attempts.filter((attempt) => attempt.quiz.subject.name === subject.name).length;
      const totalQuizzes = subject.quizzes.length || 1;
      return {
        ...subject,
        completion: Math.min(100, Math.round((attemptsForSubject / totalQuizzes) * 100)),
        progressLabel: `${attemptsForSubject} / ${totalQuizzes} quizzes completed`,
        difficulty: difficultyMap[subject.name]?.label ?? 'Medium',
        difficultyTone: difficultyMap[subject.name]?.tone ?? 'text-[#FBBF24]',
      };
    }),
    [attempts, subjects]
  );

  return (
    <div className="space-y-10">
      <QuickActions />
      <section className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5 rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Student Dashboard</p>
              <h1 className="text-4xl font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>Premium Learning Hub</h1>
            </div>
            <span className="rounded-full border border-[#2A2A38] bg-[#1A1A24] px-4 py-2 text-sm text-[#E8E8F0]">Welcome, {user?.name ?? 'Scholar'}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-2">
            <ScoreCard label="Total Quizzes" value={stats.quizzes.toString()} />
            <ScoreCard label="Average Score" value={`${stats.average}%`} />
            <ScoreCard label="Highest Score" value={stats.highest ? `${stats.highest}` : '—'} />
            <ScoreCard label="Current Rank" value={stats.rank ? `#${stats.rank}` : '—'} />
            <ScoreCard label="Total XP" value={`${stats.xp}`} />
            <ScoreCard label="Active Streak" value={`${stats.streak} days`} />
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Weekly Performance</p>
              <h2 className="text-2xl font-semibold">Focus on growth</h2>
            </div>
            <div className="rounded-2xl bg-[#1A1A24] px-4 py-2 text-sm text-[#8C8C9D]">Updated Now</div>
          </div>
          <div className="mt-8 grid gap-4">
            <div className="rounded-3xl bg-[#1A1A24] p-6">
              <p className="text-sm text-[#8C8C9D]">Completion Rate</p>
              <div className="mt-4 h-3 rounded-full bg-[#0F172A]">
                <div className="h-full rounded-full bg-[#7C6FFF]" style={{ width: `${stats.completion}%` }} />
              </div>
              <p className="mt-3 text-sm text-[#E8E8F0]">{subjects.length ? `${stats.completion}%` : 'No quizzes available yet'}</p>
            </div>
            <div className="rounded-3xl bg-[#1A1A24] p-6">
              <p className="text-sm text-[#8C8C9D]">Learning Momentum</p>
              <p className="mt-3 text-4xl font-semibold text-white">{stats.streak} 🔥</p>
              <p className="mt-2 text-sm text-[#8C8C9D]">Keep your streak going with daily quizzes.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Subjects</p>
            <h2 className="text-3xl font-semibold">Class 8 Subject Progress</h2>
          </div>
          <p className="text-sm text-[#8C8C9D]">Tap a subject to continue learning or review quizzes.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {subjectProgress.map((subject) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group rounded-3xl border border-[#2A2A38] bg-[#111118] p-6 transition hover:-translate-y-1 hover:border-[#7C6FFF]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl" style={{ backgroundColor: `${subject.color}20` }}>
                    <span className="text-3xl">{subject.icon}</span>
                  </div>
                  <div>
                    <p className="text-xl font-semibold">{subject.name}</p>
                    <p className="text-sm text-[#8C8C9D]">{subject.quizzes.length} quizzes</p>
                  </div>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm ${subject.difficultyTone}`}>{subject.difficulty}</span>
              </div>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm text-[#8C8C9D]">
                  <span>{subject.progressLabel}</span>
                  <span>{subject.completion}%</span>
                </div>
                <div className="h-3 rounded-full bg-[#1A1A24]">
                  <div className="h-full rounded-full bg-[#7C6FFF]" style={{ width: `${subject.completion}%` }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Attempts</h2>
            <span className="rounded-2xl bg-[#1A1A24] px-3 py-1 text-xs text-[#8C8C9D]">Latest 3</span>
          </div>
          <div className="space-y-4">
            {attempts.slice(0, 3).map((attempt) => (
              <div key={attempt.id} className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{attempt.quiz.title}</p>
                    <p className="text-sm text-[#8C8C9D]">{attempt.quiz.subject.name}</p>
                  </div>
                  <span className="rounded-2xl bg-[#27272d] px-3 py-1 text-sm text-[#E8E8F0]">{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[#8C8C9D]">
                  <span>Score: {attempt.score}/{attempt.totalScore}</span>
                  <span>{Math.round((attempt.score / attempt.totalScore) * 100)}%</span>
                </div>
              </div>
            ))}
            {!attempts.length && <p className="text-sm text-[#8C8C9D]">No quiz history yet. Start a quiz to build momentum.</p>}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Achievement Spotlight</h2>
            <span className="rounded-2xl bg-[#1A1A24] px-3 py-1 text-xs text-[#8C8C9D]">Gamified</span>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Earned Badges</p>
              <p className="mt-3 text-3xl font-semibold text-white">{badges.length}</p>
            </div>
            <div className="rounded-3xl bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Learning Rank</p>
              <p className="mt-3 text-3xl font-semibold text-white">{stats.rank ? `#${stats.rank}` : '—'}</p>
            </div>
          </div>
        </motion.section>
      </section>
    </div>
  );
}
