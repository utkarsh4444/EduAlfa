import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChart3, BookOpen, Grid, History, Trophy, UserCircle2 } from 'lucide-react';
import TopNav from '../dashboard/TopNav';

const links = [
  { label: 'Dashboard', to: '/student', icon: Grid },
  { label: 'Subjects', to: '/student/subjects', icon: BookOpen },
  { label: 'Analytics', to: '/student/analytics', icon: BarChart3 },
  { label: 'Leaderboard', to: '/leaderboard', icon: Trophy },
  { label: 'My History', to: '/student/history', icon: History },
  { label: 'Profile', to: '/student/profile', icon: UserCircle2 },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top,_rgba(124,111,255,0.08),_transparent_12%),#0A0A0F]">
      <aside className="hidden w-60 flex-col border-r border-[#2A2A38] bg-[#111118] px-6 py-8 lg:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C6FFF] to-[#9F96FF] text-lg font-bold text-white">EA</div>
          <div>
            <p className="text-sm text-[#8C8C9D]">EduAlfa</p>
            <h2 className="text-lg font-semibold">Student Portal</h2>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm transition ${isActive ? 'bg-[#7C6FFF]/15 text-[#7C6FFF] border-l-2 border-[#7C6FFF]' : 'text-[#A9A9C9] hover:bg-[#7C6FFF]/10'}`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  {link.label}
                </div>
              </NavLink>
            );
          })}
        </nav>
        <div className="mt-auto rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-[#7C6FFF]/10 text-center leading-[3rem] text-xl">{user?.name?.charAt(0) ?? 'S'}</div>
            <div>
              <p className="text-sm font-semibold">{user?.name ?? 'Student'}</p>
              <p className="text-xs text-[#8C8C9D]">{user?.studentId ?? 'STU-000'}</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/student-login');
            }}
            className="mt-4 w-full rounded-2xl bg-[#1A1A24] px-4 py-2 text-sm text-[#8C8C9D] transition hover:bg-[#22222B]"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 lg:p-10">
        <TopNav />
        <Outlet />
      </main>
    </div>
  );
}
