import { LogOut, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-[#2A2A38] bg-[#111118] p-5 shadow-[0_0_40px_rgba(16,24,40,0.25)] md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Student Portal</p>
          <h1 className="text-3xl font-semibold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{user?.name ?? 'Student'}</h1>
          <p className="mt-2 text-sm text-[#8C8C9D]">Keep learning, stay curious, and climb the leaderboard.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/student/profile')}
          className="inline-flex items-center gap-3 rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-sm text-white transition hover:bg-[#27272e]"
        >
          <UserCircle2 size={18} />
          Profile
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          logout();
          navigate('/student-login');
        }}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C6FFF] to-[#FF6B6B] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
}
