import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { useSocket } from '../../hooks/useSocket';

interface Quiz {
  id: string;
  title: string;
  duration: number;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  quizzes: Quiz[];
}

export default function SubjectQuizzes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socket = useSocket();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    api.get(`/student/subjects/${id}/quizzes`)
      .then((response) => {
        setSubject({ ...response.data.subject, quizzes: response.data.quizzes });
      })
      .catch((err) => {
        console.error('Failed to load subject quizzes:', err);
        setError('Unable to load quizzes for this subject.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    const onCreated = (quiz: any) => {
      if (quiz.subjectId !== id) return;
      setSubject((s) => s ? { ...s, quizzes: [quiz, ...(s.quizzes || [])] } : s);
    };

    const onUpdated = (quiz: any) => {
      if (quiz.subjectId !== id) return;
      setSubject((s) => s ? { ...s, quizzes: (s.quizzes || []).map((q) => q.id === quiz.id ? quiz : q) } : s);
    };

    const onDeleted = (payload: any) => {
      if (!payload || payload.subjectId !== id) return;
      setSubject((s) => s ? { ...s, quizzes: (s.quizzes || []).filter((q) => q.id !== payload.id) } : s);
    };

    socket.on('quiz:created', onCreated);
    socket.on('quiz:updated', onUpdated);
    socket.on('quiz:deleted', onDeleted);

    return () => {
      socket.off('quiz:created', onCreated);
      socket.off('quiz:updated', onUpdated);
      socket.off('quiz:deleted', onDeleted);
    };
  }, [socket, id]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading quizzes…</div>;
  }

  if (error) {
    return <div className="min-h-[60vh] flex items-center justify-center text-[#E8E8F0]">{error}</div>;
  }

  if (!subject) {
    return <div className="min-h-[60vh] flex items-center justify-center text-[#E8E8F0]">Subject not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Subject</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{subject.name} Quizzes</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subject.quizzes.length ? subject.quizzes.map((quiz) => (
          <motion.button
            key={quiz.id}
            onClick={() => navigate(`/student/quiz/${quiz.id}`)}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.25 }}
            className="group rounded-3xl border border-[#2A2A38] bg-[#111118] p-6 text-left text-white"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-2xl bg-[#1A1A24] px-3 py-1 text-sm text-[#8C8C9D]">{quiz.duration} min</span>
            </div>
            <h2 className="text-2xl font-semibold">{quiz.title}</h2>
            <p className="mt-4 text-sm text-[#8C8C9D]">Start the quiz and see how fast you can finish with accuracy.</p>
          </motion.button>
        )) : (
          <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-8 text-center text-[#8C8C9D]">No quizzes are available for this subject yet.</div>
        )}
      </div>
    </div>
  );
}
