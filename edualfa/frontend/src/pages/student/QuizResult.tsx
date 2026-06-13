import { useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface LocationState {
  quizTitle?: string;
  score?: number;
  totalScore?: number;
  attempt?: any;
}

export default function QuizResult() {
  const navigate = useNavigate();
  const reviewSectionRef = useRef<HTMLDivElement | null>(null);
  const { state } = useLocation();
  const data = (state || {}) as LocationState;
  const attempt = data.attempt;

  const score = attempt?.score ?? data.score ?? 0;
  const totalScore = attempt?.totalScore ?? data.totalScore ?? 0;
  const percentage = totalScore ? Math.round((score / totalScore) * 100) : 0;
  const message = percentage >= 85 ? 'Outstanding Performance! 🌟' : percentage >= 70 ? 'Excellent Work! 👍' : percentage >= 50 ? 'Good Progress! 💪' : 'Keep Practicing! 📘';

  const progress = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = 314 - (314 * progress) / 100;
  const answersMap = attempt ? JSON.parse(attempt.answers || '{}') : {};

  const analytics = useMemo(() => {
    const questions = attempt?.quiz?.questions ?? [];
    const correctCount = questions.filter((q: any) => {
      const given = answersMap[q.id];
      try {
        const correctRaw = q.correctAnswer;
        if (q.type === 'MULTI_SELECT') {
          const correctArr = correctRaw ? JSON.parse(correctRaw) : [];
          const selArr = Array.isArray(given) ? given : given != null ? [given] : [];
          const a = [...correctArr].sort();
          const b = [...selArr].sort();
          return a.length === b.length && a.every((v, i) => v === b[i]);
        }
        if (q.type === 'SHORT_ANSWER') {
          const correctStr = correctRaw ? String(JSON.parse(correctRaw)).trim().toLowerCase() : '';
          const selStr = given ? String(given).trim().toLowerCase() : '';
          return correctStr.length > 0 && selStr === correctStr;
        }
        const correct = correctRaw ? JSON.parse(correctRaw) : null;
        return given === correct;
      } catch {
        return false;
      }
    }).length;
    const wrongCount = Math.min(questions.length - correctCount, Object.keys(answersMap).length);
    const unansweredCount = Math.max(0, questions.length - Object.keys(answersMap).length);
    const targetBenchmark = 75;
    const subjectName = attempt?.quiz?.subject?.name ?? 'Subject';

    return { questions, correctCount, wrongCount, unansweredCount, targetBenchmark, subjectName };
  }, [attempt, answersMap]);

  const timeTakenText = attempt ? `${Math.floor((attempt.timeTaken ?? 0) / 60)}m ${(attempt.timeTaken ?? 0) % 60}s` : '0m 0s';

  if (!attempt) {
    return (
      <div className="min-h-[60vh] rounded-3xl border border-[#2A2A38] bg-[#111118] p-10 text-center">
        <p className="text-sm text-[#8C8C9D]">No result data available.</p>
        <button onClick={() => navigate('/student/subjects')} className="mt-6 rounded-2xl bg-[#1A1A24] px-6 py-3 text-sm text-white transition hover:bg-[#22222B]">Return to Subjects</button>
      </div>
    );
  }

  const scrollToReview = () => {
    reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="grid gap-10 xl:grid-cols-[1.2fr_0.8fr]">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-3 rounded-3xl bg-[#1A1A24] px-4 py-3 text-[#7C6FFF]">
              <CheckCircle2 size={24} />
              <span className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Quiz Completed</span>
            </div>
            <h1 className="mt-6 text-4xl font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>{message}</h1>
            <p className="mt-3 max-w-2xl text-sm text-[#CFCFE0]">
              You completed <span className="font-semibold text-white">{data.quizTitle ?? attempt.quiz.title}</span> for <span className="font-semibold text-white">{analytics.subjectName}</span>.
            </p>
            <button onClick={scrollToReview} className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[#7C6FFF] px-5 py-3 text-sm font-semibold text-white transition hover:brightness-110">
              Review Answers
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="rounded-3xl bg-[#1A1A24] p-6 text-center">
            <div className="mx-auto mb-4 h-40 w-40 rounded-full border-8 border-[#2A2A38] bg-[#111118] p-2">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#2A2A38" strokeWidth="10" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="#7C6FFF" strokeWidth="10" strokeDasharray="282.6" strokeDashoffset={282.6 - (282.6 * progress) / 100} strokeLinecap="round" transform="rotate(-90 50 50)" />
                <text x="50" y="55" dominantBaseline="middle" textAnchor="middle" className="text-[24px] font-semibold" fill="#E8E8F0">{progress}%</text>
              </svg>
            </div>
            <p className="text-sm text-[#8C8C9D]">Overall accuracy</p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <p className="text-sm text-[#8C8C9D]">Score</p>
            <p className="mt-3 text-3xl font-semibold text-white">{score}/{totalScore}</p>
          </div>
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <p className="text-sm text-[#8C8C9D]">Percentage</p>
            <p className="mt-3 text-3xl font-semibold text-white">{percentage}%</p>
          </div>
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <p className="text-sm text-[#8C8C9D]">Correct Answers</p>
            <p className="mt-3 text-3xl font-semibold text-[#34D399]">{analytics.correctCount}</p>
          </div>
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <p className="text-sm text-[#8C8C9D]">Wrong Answers</p>
            <p className="mt-3 text-3xl font-semibold text-[#F87171]">{analytics.wrongCount}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <h2 className="text-lg font-semibold">Performance Meter</h2>
            <p className="mt-2 text-sm text-[#8C8C9D]">How your score compares to your target.</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-[#111118] p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-[#CFCFE0]">
                  <span>Your score</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-[#27272f]">
                  <div className="h-full rounded-full bg-gradient-to-r from-[#7C6FFF] to-[#FF6B6B]" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div className="rounded-3xl bg-[#111118] p-4">
                <div className="mb-2 flex items-center justify-between text-sm text-[#CFCFE0]">
                  <span>Target benchmark</span>
                  <span>{analytics.targetBenchmark}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-[#27272f]">
                  <div className="h-full rounded-full bg-[#4ade80]" style={{ width: `${analytics.targetBenchmark}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <h2 className="text-lg font-semibold">Subject Comparison</h2>
            <p className="mt-2 text-sm text-[#8C8C9D]">See your relative standing within {analytics.subjectName}.</p>
            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[#CFCFE0]">
                  <span>You</span>
                  <span>{percentage}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-[#27272f]">
                  <div className="h-full rounded-full bg-[#7C6FFF]" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[#CFCFE0]">
                  <span>Subject average</span>
                  <span>{analytics.targetBenchmark}%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-[#27272f]">
                  <div className="h-full rounded-full bg-[#38bdf8]" style={{ width: `${analytics.targetBenchmark}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-sm text-[#CFCFE0]">
                  <span>Top performer</span>
                  <span>100%</span>
                </div>
                <div className="h-4 overflow-hidden rounded-full bg-[#27272f]">
                  <div className="h-full rounded-full bg-[#22c55e]" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <p className="text-sm text-[#8C8C9D]">Time Taken</p>
            <p className="mt-3 text-2xl font-semibold text-white">{timeTakenText}</p>
          </div>
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <p className="text-sm text-[#8C8C9D]">Answered</p>
            <p className="mt-3 text-2xl font-semibold text-white">{Object.keys(answersMap).length}</p>
          </div>
          <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-6">
            <p className="text-sm text-[#8C8C9D]">Remaining</p>
            <p className="mt-3 text-2xl font-semibold text-[#FBBF24]">{analytics.unansweredCount}</p>
          </div>
        </div>
      </motion.section>

      <motion.section ref={reviewSectionRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Review Summary</p>
            <h2 className="mt-2 text-2xl font-semibold">Score breakdown</h2>
          </div>
          <button onClick={() => navigate('/leaderboard')} className="rounded-2xl bg-[#1A1A24] px-4 py-2 text-sm text-[#E8E8F0] transition hover:bg-[#22222B]">
            View Leaderboard
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {attempt.quiz.questions.map((q: any, idx: number) => {
            const given = answersMap[q.id];
            let formattedGiven = '';
            if (Array.isArray(given)) formattedGiven = given.map((i) => String.fromCharCode(65 + i)).join(', ');
            else if (typeof given === 'number') formattedGiven = String.fromCharCode(65 + given);
            else formattedGiven = String(given ?? '—');

            let correct = '';
            try {
              const c = q.correctAnswer ? JSON.parse(q.correctAnswer) : null;
              if (Array.isArray(c)) correct = c.map((i: number) => String.fromCharCode(65 + i)).join(', ');
              else if (typeof c === 'number') correct = String.fromCharCode(65 + c);
              else correct = String(c ?? '—');
            } catch {
              correct = String(q.correctAnswer ?? '—');
            }

            const isCorrect = String(formattedGiven).toLowerCase() === String(correct).toLowerCase();

            return (
              <div key={q.id} className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold">{idx + 1}. {q.questionText}</p>
                    <div className="mt-3 flex flex-col gap-2 text-sm text-[#CFCFE0] sm:flex-row sm:items-center sm:gap-6">
                      <span>Your answer: <span className={`font-semibold ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>{formattedGiven}</span></span>
                      <span>Correct: <span className="font-semibold text-white">{correct}</span></span>
                    </div>
                  </div>
                  <div className={`mt-4 h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${isCorrect ? 'bg-green-600' : 'bg-red-600'} flex text-lg`}>{isCorrect ? '✔' : '✖'}</div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>
    </div>
  );
}
