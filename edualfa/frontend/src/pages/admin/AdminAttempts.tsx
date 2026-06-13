import { useEffect, useMemo, useState } from 'react';
import api from '../../lib/axios';

interface Attempt {
  id: string;
  score: number;
  totalScore: number;
  submittedAt: string;
  student: { name: string; studentId: string };
  quiz: { title: string; subject: { name: string } };
}

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [searchStudent, setSearchStudent] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  useEffect(() => {
    api.get('/admin/attempts').then((response) => setAttempts(response.data.attempts));
  }, []);

  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      const matchesStudent = searchStudent
        ? attempt.student.name.toLowerCase().includes(searchStudent.toLowerCase()) || attempt.student.studentId.toLowerCase().includes(searchStudent.toLowerCase())
        : true;
      const matchesSubject = filterSubject ? attempt.quiz.subject.name.toLowerCase().includes(filterSubject.toLowerCase()) : true;
      return matchesStudent && matchesSubject;
    });
  }, [attempts, searchStudent, filterSubject]);

  const exportCsv = () => {
    const csvRows = [
      ['Student Name', 'Student ID', 'Subject', 'Quiz Title', 'Score', 'Total', 'Date'],
      ...filteredAttempts.map((attempt) => [
        attempt.student.name,
        attempt.student.studentId,
        attempt.quiz.subject.name,
        attempt.quiz.title,
        String(attempt.score),
        String(attempt.totalScore),
        new Date(attempt.submittedAt).toLocaleString(),
      ]),
    ];

    const csvContent = csvRows.map((row) => row.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'edualfa_attempts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-[#FF6B6B]/80">Attempts</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Review Submissions</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm text-[#8C8C9D]">Filters</p>
          <div className="mt-4 space-y-3">
            <input
              value={filterSubject}
              onChange={(event) => setFilterSubject(event.target.value)}
              className="w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-sm text-white outline-none"
              placeholder="Subject"
            />
            <input
              value={searchStudent}
              onChange={(event) => setSearchStudent(event.target.value)}
              className="w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-sm text-white outline-none"
              placeholder="Student name or ID"
            />
          </div>
        </div>
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm text-[#8C8C9D]">Export</p>
          <button
            onClick={exportCsv}
            className="mt-4 rounded-3xl bg-[#1A1A24] px-5 py-3 text-sm text-white transition hover:bg-[#2A2A38]"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-[#2A2A38] bg-[#111118]">
        <table className="min-w-full divide-y divide-[#2A2A38] text-left text-sm text-[#E8E8F0]">
          <thead className="bg-[#111118]">
            <tr>
              <th className="px-6 py-4">Student</th>
              <th className="px-6 py-4">Quiz</th>
              <th className="px-6 py-4">Score</th>
              <th className="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredAttempts.map((attempt) => (
              <tr key={attempt.id} className="border-t border-[#2A2A38] hover:bg-[#1A1A24]">
                <td className="px-6 py-4">{attempt.student.name} <span className="text-xs text-[#8C8C9D]">{attempt.student.studentId}</span></td>
                <td className="px-6 py-4">{attempt.quiz.title} <div className="text-xs text-[#8C8C9D]">{attempt.quiz.subject.name}</div></td>
                <td className="px-6 py-4">{attempt.score}/{attempt.totalScore}</td>
                <td className="px-6 py-4">{new Date(attempt.submittedAt).toLocaleDateString()}</td>
              </tr>
            ))}
            {!filteredAttempts.length && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[#8C8C9D]">
                  No attempts found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
