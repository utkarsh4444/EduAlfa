import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

interface Question {
  id: string;
  questionText: string;
  options: string[];
  points: number;
  type?: 'MCQ' | 'TRUE_FALSE' | 'MULTI_SELECT' | 'SHORT_ANSWER';
}

interface Quiz {
  id: string;
  title: string;
  duration: number;
  subject: { name: string };
  questions: Question[];
}

export default function QuizAttempt() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/student/quizzes/${id}`).then((response) => {
      setQuiz(response.data.quiz);
      setTimeLeft(response.data.quiz.duration * 60);
    });
  }, [id]);

  useEffect(() => {
    if (!quiz) return;
    const interval = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(interval);
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [quiz]);

  useEffect(() => {
    if (quiz && timeLeft === 0 && !isSubmitting && quiz.questions.length) {
      handleSubmit();
    }
  }, [timeLeft]);

  // restore autosaved answers/time/index for this quiz
  useEffect(() => {
    if (!quiz) return;
    try {
      const raw = localStorage.getItem(`quiz_save_${quiz.id}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.answers) setAnswers(parsed.answers);
      if (typeof parsed.currentIndex === 'number') setCurrentIndex(parsed.currentIndex);
      if (typeof parsed.timeLeft === 'number') setTimeLeft(parsed.timeLeft);
    } catch {
      // ignore
    }
  }, [quiz]);

  // autosave answers periodically and on unload
  useEffect(() => {
    if (!quiz) return;
    const save = () => {
      localStorage.setItem(
        `quiz_save_${quiz.id}`,
        JSON.stringify({ answers, currentIndex, timeLeft, updatedAt: Date.now() })
      );
    };
    const interval = setInterval(save, 5000);
    const onUnload = () => save();
    window.addEventListener('beforeunload', onUnload);
    return () => {
      clearInterval(interval);
      window.removeEventListener('beforeunload', onUnload);
      save();
    };
  }, [quiz, answers, currentIndex, timeLeft]);

  const question = quiz?.questions[currentIndex];
  const percentage = quiz ? Math.round(((currentIndex + 1) / quiz.questions.length) * 100) : 0;

  const handleSelect = (optionIndex: number) => {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.id]: optionIndex }));
  };

  const handleToggleMulti = (optionIndex: number) => {
    if (!question) return;
    setAnswers((current) => {
      const existing = Array.isArray(current[question.id]) ? [...(current[question.id] as number[])] : [];
      const idx = existing.indexOf(optionIndex);
      if (idx === -1) existing.push(optionIndex); else existing.splice(idx, 1);
      return { ...current, [question.id]: existing };
    });
  };

  const handleShortAnswer = (value: string) => {
    if (!question) return;
    setAnswers((current) => ({ ...current, [question.id]: value }));
  };

  const performSubmit = async () => {
    if (!quiz) return;
    setIsSubmitting(true);
    try {
      const response = await api.post(`/student/quizzes/${quiz.id}/submit`, { answers, timeTaken: quiz.duration * 60 - timeLeft });
      localStorage.removeItem(`quiz_save_${quiz.id}`);
      navigate('/student/quiz-result', {
        state: {
          quizTitle: quiz.title,
          score: response.data.attempt.score,
          totalScore: response.data.attempt.totalScore,
          attempt: response.data.attempt,
        },
      });
    } catch {
      // ignore
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  const handleSubmit = () => {
    setShowConfirm(true);
  };

  const toggleFullscreen = () => {
    const el = containerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-8">
      <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Quiz</p>
            <h1 className="text-3xl font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>{quiz?.title ?? 'Loading Quiz...'}</h1>
          </div>
          <div className="flex gap-4 text-sm text-white items-center">
            <div className="rounded-3xl bg-[#1A1A24] px-4 py-3">Time left: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
            <div className="rounded-3xl bg-[#1A1A24] px-4 py-3">Progress: {percentage}%</div>
            <button type="button" onClick={toggleFullscreen} className="rounded-2xl bg-[#1A1A24] px-4 py-3 text-sm text-[#E8E8F0]">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
          </div>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#1A1A24]">
          <div className="h-full rounded-full bg-[#FF6B6B] transition-all" style={{ width: `${percentage}%` }} />
        </div>
      </div>

      {question && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#8C8C9D]">Question {currentIndex + 1} of {quiz.questions.length}</p>
              <h2 className="mt-2 text-2xl font-semibold">{question.questionText}</h2>
            </div>
            <div className="rounded-3xl bg-[#1A1A24] px-4 py-3 text-sm text-[#E8E8F0]">{question.points} pts</div>
          </div>
          {/* Question navigator */}
          <div className="mb-4 flex flex-wrap gap-2">
            {quiz.questions.map((q, idx) => {
              const answered = answers[q.id] !== undefined && answers[q.id] !== '' && !(Array.isArray(answers[q.id]) && (answers[q.id] as any[]).length === 0);
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 w-9 rounded-full text-sm ${idx === currentIndex ? 'bg-[#7C6FFF] text-white' : answered ? 'bg-[#1A1A24] text-[#CFCFE0] border border-[#2A2A38]' : 'bg-[#111118] text-[#8C8C9D] border border-[#2A2A38]'}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
          <div className="grid gap-4">
            {question.type === 'SHORT_ANSWER' ? (
              <input
                value={String(answers[question.id] ?? '')}
                onChange={(e) => handleShortAnswer(e.target.value)}
                className="w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-white outline-none"
                placeholder="Type your answer here"
              />
            ) : question.type === 'MULTI_SELECT' ? (
              question.options.map((option, index) => {
                const selected = Array.isArray(answers[question.id]) && (answers[question.id] as number[]).includes(index);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleToggleMulti(index)}
                    className={`rounded-3xl border px-5 py-4 text-left transition ${selected ? 'border-[#7C6FFF] bg-[#7C6FFF]/15 text-white' : 'border-[#2A2A38] bg-[#1A1A24] text-[#CFCFE0] hover:border-[#7C6FFF] hover:bg-[#7C6FFF]/10'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#18181F] text-lg font-semibold">{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })
            ) : (
              question.options.map((option, index) => {
                const selected = answers[question.id] === index;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(index)}
                    className={`rounded-3xl border px-5 py-4 text-left transition ${selected ? 'border-[#7C6FFF] bg-[#7C6FFF]/15 text-white' : 'border-[#2A2A38] bg-[#1A1A24] text-[#CFCFE0] hover:border-[#7C6FFF] hover:bg-[#7C6FFF]/10'}`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#18181F] text-lg font-semibold">{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((value) => Math.max(value - 1, 0))}
                className="rounded-2xl bg-[#1A1A24] px-5 py-3 text-sm text-[#8C8C9D] transition hover:bg-[#22222B] disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentIndex === quiz.questions.length - 1}
                onClick={() => setCurrentIndex((value) => Math.min(value + 1, quiz.questions.length - 1))}
                className="rounded-2xl bg-[#1A1A24] px-5 py-3 text-sm text-[#8C8C9D] transition hover:bg-[#22222B] disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-2xl bg-gradient-to-r from-[#7C6FFF] to-[#FF6B6B] px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Quiz 🚀'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-black">
            <h3 className="text-lg font-semibold">Confirm Submission</h3>
            <p className="mt-2 text-sm text-gray-700">Are you sure you want to submit? This will finalize your answers.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowConfirm(false)} className="rounded-2xl px-4 py-2 bg-gray-100">Cancel</button>
              <button onClick={() => performSubmit()} className="rounded-2xl px-4 py-2 bg-gradient-to-r from-[#7C6FFF] to-[#FF6B6B] text-white">Yes, submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
