import { ArrowRight, BarChart3, BookOpen, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const actions = [
  { label: 'Start Quiz', to: '/student/subjects', icon: Play, description: 'Jump into a new quiz now.' },
  { label: 'View Subjects', to: '/student/subjects', icon: BookOpen, description: 'Browse all subjects and quizzes.' },
  { label: 'Leaderboard', to: '/leaderboard', icon: BarChart3, description: 'See how you rank.' },
  { label: 'Analytics', to: '/student/analytics', icon: ArrowRight, description: 'Track your progress.' },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.to)}
            className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-5 text-left transition hover:-translate-y-1 hover:bg-[#1E1E29]"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[#7C6FFF]/10 text-[#7C6FFF]">
                <Icon size={20} />
              </div>
              <div>
                <p className="font-semibold text-white">{action.label}</p>
                <p className="text-sm text-[#8C8C9D]">{action.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
