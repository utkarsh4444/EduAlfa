import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GraduationCap, Layers, ListChecks, Users, Trophy } from 'lucide-react';

const links = [
  { label: 'Dashboard', to: '/admin', icon: Layers },
  { label: 'Students', to: '/admin/students', icon: Users },
  { label: 'Subjects', to: '/admin/subjects', icon: GraduationCap },
  { label: 'Quizzes', to: '/admin/quizzes', icon: ListChecks },
  { label: 'Attempts', to: '/admin/attempts', icon: Trophy },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-[radial-gradient(circle_at_top,_rgba(255,107,107,0.12),_transparent_12%),#0A0A0F]">
      <aside className="hidden w-60 flex-col border-r border-[#2A2A38] bg-[#111118] px-6 py-8 lg:flex">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8A7A] text-lg font-bold text-white">EA</div>
          <div>
            <p className="text-sm text-[#8C8C9D]">EduAlfa Admin</p>
            <h2 className="text-lg font-semibold">Control Suite</h2>
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
                  `rounded-2xl px-4 py-3 text-sm transition ${isActive ? 'bg-[#FF6B6B]/15 text-[#FF6B6B] border-l-2 border-[#FF6B6B]' : 'text-[#A9A9C9] hover:bg-[#FF6B6B]/10'}`
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
        <button
          onClick={() => {
            logout();
            navigate('/admin-login');
          }}
          className="mt-auto rounded-2xl bg-[#1A1A24] px-4 py-3 text-sm text-[#8C8C9D] transition hover:bg-[#22222B]"
        >
          Sign out
        </button>
      </aside>
      <main className="flex-1 p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}
