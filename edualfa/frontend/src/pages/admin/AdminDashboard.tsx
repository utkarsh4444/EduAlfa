import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';

interface Stats {
  students: number;
  subjects: number;
  quizzes: number;
  attempts: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({ students: 0, subjects: 0, quizzes: 0, attempts: 0 });

  useEffect(() => {
    api.get('/admin/stats').then((response) => setStats(response.data.stats));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-[#FF6B6B]/80">Admin Control</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard Overview</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Students', value: stats.students },
          { label: 'Subjects', value: stats.subjects },
          { label: 'Quizzes', value: stats.quizzes },
          { label: 'Attempts', value: stats.attempts },
        ].map((card) => (
          <div key={card.label} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
            <p className="text-sm text-[#8C8C9D]">{card.label}</p>
            <p className="mt-4 text-3xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
          <div className="mt-6 grid gap-3">
            <button onClick={() => navigate('/admin/students')} className="rounded-2xl bg-[#1A1A24] px-5 py-3 text-left text-sm text-[#E8E8F0]">Manage Students</button>
            <button onClick={() => navigate('/admin/quizzes')} className="rounded-2xl bg-[#1A1A24] px-5 py-3 text-left text-sm text-[#E8E8F0]">Manage Quizzes</button>
            <button onClick={() => navigate('/leaderboard')} className="rounded-2xl bg-[#1A1A24] px-5 py-3 text-left text-sm text-[#E8E8F0]">View Leaderboard</button>
          </div>
        </div>
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <h2 className="text-xl font-semibold">Recent Attempts</h2>
          <div className="mt-6 space-y-3 text-sm text-[#8C8C9D]">No recent attempts available for preview. Use the attempts section to review student performance.</div>
        </div>
      </div>
    </div>
  );
}
