import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import SubjectCard from '../../components/subjects/SubjectCard';

interface SubjectType {
  id: string;
  name: string;
  icon: string;
  color: string;
  quizzes: { id: string }[];
}

export default function SubjectList() {
  const [subjects, setSubjects] = useState<SubjectType[]>([]);
  const [attemptsCount, setAttemptsCount] = useState<{ [subjectName: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([api.get('/student/subjects'), api.get('/student/attempts')])
      .then(([subjectResp, attemptsResp]) => {
        setSubjects(subjectResp.data.subjects);
        const map: { [key: string]: number } = {};
        attemptsResp.data.attempts.forEach((a: any) => {
          const name = a.quiz.subject.name;
          map[name] = (map[name] || 0) + 1;
        });
        setAttemptsCount(map);
      })
      .catch((err) => {
        console.error('Failed to load subjects or attempts:', err);
        setError('Unable to load subjects. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Explore</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Choose a Subject</h1>
      </div>
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center text-[#E8E8F0]">Loading subjects…</div>
      ) : error ? (
        <div className="min-h-[40vh] rounded-3xl border border-[#2A2A38] bg-[#111118] p-6 text-center text-[#E8E8F0]">{error}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.length ? subjects.map((subject) => (
            <motion.div key={subject.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}>
              <SubjectCard
                id={subject.id}
                name={subject.name}
                icon={subject.icon}
                color={subject.color}
                quizzes={subject.quizzes}
                attempted={attemptsCount[subject.name] || 0}
              />
            </motion.div>
          )) : (
            <div className="min-h-[40vh] rounded-3xl border border-[#2A2A38] bg-[#111118] p-6 text-center text-[#E8E8F0]">
              No subjects found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
