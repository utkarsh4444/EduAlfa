import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

interface AttemptType {
  id: string;
  score: number;
  totalScore: number;
  timeTaken: number;
  submittedAt: string;
  quiz: { title: string; subject: { name: string } };
}

export default function StudentHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<AttemptType[]>([]);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  useEffect(() => {
    api.get('/student/attempts').then((response) => setAttempts(response.data.attempts));
  }, []);

  const subjects = useMemo(
    () => Array.from(new Set(attempts.map((attempt) => attempt.quiz.subject.name))),
    [attempts]
  );

  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      const subjectMatch = subjectFilter === 'all' || attempt.quiz.subject.name === subjectFilter;
      const date = new Date(attempt.submittedAt);
      const today = new Date();
      let dateMatch = true;
      if (dateFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        dateMatch = date >= weekAgo;
      } else if (dateFilter === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(today.getMonth() - 1);
        dateMatch = date >= monthAgo;
      }
      const percentage = attempt.totalScore ? Math.round((attempt.score / attempt.totalScore) * 100) : 0;
      let scoreMatch = true;
      if (scoreFilter === 'low') scoreMatch = percentage < 50;
      if (scoreFilter === 'mid') scoreMatch = percentage >= 50 && percentage < 75;
      if (scoreFilter === 'high') scoreMatch = percentage >= 75;
      return subjectMatch && dateMatch && scoreMatch;
    });
  }, [attempts, subjectFilter, dateFilter, scoreFilter]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#27272e]"
        >
          ← Back
        </button>
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">History</p>
          <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>My Quiz Attempts</h1>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <select
          value={subjectFilter}
          onChange={(event) => setSubjectFilter(event.target.value)}
          className="rounded-3xl border border-[#2A2A38] bg-[#111118] px-4 py-3 text-white outline-none"
        >
          <option value="all">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
        <select
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="rounded-3xl border border-[#2A2A38] bg-[#111118] px-4 py-3 text-white outline-none"
        >
          <option value="all">All Time</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
        </select>
        <select
          value={scoreFilter}
          onChange={(event) => setScoreFilter(event.target.value)}
          className="rounded-3xl border border-[#2A2A38] bg-[#111118] px-4 py-3 text-white outline-none"
        >
          <option value="all">All Scores</option>
          <option value="high">75% and above</option>
          <option value="mid">50%-74%</option>
          <option value="low">Below 50%</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[#2A2A38] bg-[#111118]">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-[#111118] text-left text-sm uppercase tracking-[0.2em] text-[#8C8C9D]">
              <th className="px-6 py-4">Quiz Name</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Percentage</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Time Taken</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttempts.length ? (
              filteredAttempts.map((attempt) => {
                const percentage = attempt.totalScore ? Math.round((attempt.score / attempt.totalScore) * 100) : 0;
                const timeText = Math.floor(attempt.timeTaken / 60) + 'm ' + (attempt.timeTaken % 60) + 's';
                return (
                  <tr key={attempt.id} className="border-t border-[#2A2A38] text-sm text-[#E8E8F0] hover:bg-[#1A1A24]">
                    <td className="px-6 py-4">{attempt.quiz.title}</td>
                    <td className="px-6 py-4">{attempt.quiz.subject.name}</td>
                    <td className="px-6 py-4">{attempt.score}/{attempt.totalScore}</td>
                    <td className="px-6 py-4">{percentage}%</td>
                    <td className="px-6 py-4">{new Date(attempt.submittedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">{timeText}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#8C8C9D]">No attempts match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
