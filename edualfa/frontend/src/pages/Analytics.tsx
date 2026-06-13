import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';

interface AttemptType {
  id: string;
  score: number;
  totalScore: number;
  submittedAt: string;
  quiz: { title: string; subject: { name: string } };
}

export default function Analytics() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptType[]>([]);

  useEffect(() => {
    api.get('/student/attempts').then((response) => setAttempts(response.data.attempts));
  }, []);

  const subjectPerformance = useMemo(() => {
    const grouping: Record<string, { quizzes: number; score: number; total: number }> = {};
    attempts.forEach((attempt) => {
      const key = attempt.quiz.subject.name;
      if (!grouping[key]) grouping[key] = { quizzes: 0, score: 0, total: 0 };
      grouping[key].quizzes += 1;
      grouping[key].score += attempt.score;
      grouping[key].total += attempt.totalScore;
    });
    return Object.entries(grouping).map(([subject, values]) => ({
      subject,
      quizzes: values.quizzes,
      average: values.total ? Math.round((values.score / values.total) * 100) : 0,
    }));
  }, [attempts]);

  const totalQuizzes = attempts.length;
  const averageScore = totalQuizzes
    ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalScore) * 100, 0) / totalQuizzes)
    : 0;
  const bestScore = attempts.reduce((best, attempt) => Math.max(best, Math.round((attempt.score / attempt.totalScore) * 100)), 0);
  const questionsPerWeek = useMemo(() => {
    if (!attempts.length) return 0;
    const firstAttempt = Math.min(...attempts.map((attempt) => new Date(attempt.submittedAt).getTime()));
    const days = Math.max(1, Math.ceil((Date.now() - firstAttempt) / (1000 * 60 * 60 * 24)));
    return Math.max(1, Math.round(attempts.length / Math.max(1, Math.ceil(days / 7))));
  }, [attempts]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#27272e]"
        >
          ← Back
        </button>
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Student Analytics</p>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Performance analytics</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#8C8C9D]">Understand your strengths, weekly momentum, and subject mastery across Class 8 quizzes.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm text-[#8C8C9D]">Total Quizzes</p>
          <p className="mt-4 text-3xl font-semibold text-white">{totalQuizzes}</p>
        </div>
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm text-[#8C8C9D]">Average Score</p>
          <p className="mt-4 text-3xl font-semibold text-white">{averageScore}%</p>
        </div>
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm text-[#8C8C9D]">Best Quiz Score</p>
          <p className="mt-4 text-3xl font-semibold text-white">{bestScore}%</p>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Momentum</p>
              <h2 className="text-2xl font-semibold">Weekly progress</h2>
            </div>
            <p className="text-sm text-[#8C8C9D]">Updated live</p>
          </div>
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Quizzes per week</p>
              <p className="mt-3 text-3xl font-semibold text-white">{questionsPerWeek}</p>
            </div>
            <div className="rounded-3xl bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Last activity</p>
              <p className="mt-3 text-lg text-white">{attempts.length ? new Date(attempts[0].submittedAt).toLocaleDateString() : 'No activity yet'}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Subject mastery</p>
          <h2 className="text-2xl font-semibold">Your top subjects</h2>
          <div className="mt-6 space-y-4">
            {subjectPerformance.length ? (
              subjectPerformance.map((item) => (
                <div key={item.subject} className="rounded-3xl bg-[#1A1A24] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-white">{item.subject}</p>
                    <p className="text-sm text-[#8C8C9D]">{item.average}%</p>
                  </div>
                  <div className="mt-3 h-3 rounded-full bg-[#0F172A]">
                    <div className="h-full rounded-full bg-[#7C6FFF]" style={{ width: `${item.average}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[#2A2A38] bg-[#1A1A24] p-6 text-center text-sm text-[#8C8C9D]">
                No analytics available until you complete your first quiz.
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
