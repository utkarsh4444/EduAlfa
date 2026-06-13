import { useNavigate } from 'react-router-dom';

interface SubjectCardProps {
  id: string;
  name: string;
  icon: string;
  color: string;
  quizzes: { id: string }[];
  attempted?: number;
}

export default function SubjectCard({ id, name, icon, color, quizzes, attempted = 0 }: SubjectCardProps) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(`/student/subjects/${id}`)}
      className="w-full text-left rounded-3xl border border-[#2A2A38] bg-[#111118] p-6 transition hover:-translate-y-1 hover:border-[#7C6FFF]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl" style={{ backgroundColor: `${color}20` }}>
            <span className="text-2xl">{icon}</span>
          </div>
          <div>
            <p className="text-lg font-semibold">{name}</p>
            <p className="text-sm text-[#8C8C9D]">{quizzes.length} quizzes</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-[#8C8C9D]">Completed</p>
          <p className="mt-1 font-semibold">{attempted}/{quizzes.length}</p>
        </div>
      </div>
    </button>
  );
}
