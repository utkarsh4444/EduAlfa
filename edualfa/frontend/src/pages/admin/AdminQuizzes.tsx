import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Subject {
  id: string;
  name: string;
}

interface Quiz {
  id: string;
  title: string;
  duration: number;
  subject: { name: string };
}

interface QuestionForm {
  questionText: string;
  options: string[];
  correctAnswer: number;
}

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editQuizId, setEditQuizId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [duration, setDuration] = useState(10);
  const [questions, setQuestions] = useState<QuestionForm[]>([
    { questionText: '', options: ['', '', '', ''], correctAnswer: 0 },
  ]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    const [quizzesResponse, subjectsResponse] = await Promise.all([
      api.get('/admin/quizzes'),
      api.get('/admin/subjects'),
    ]);
    setQuizzes(quizzesResponse.data.quizzes);
    setSubjects(subjectsResponse.data.subjects);
    if (!subjectId && subjectsResponse.data.subjects.length) {
      setSubjectId(subjectsResponse.data.subjects[0].id);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddQuestion = () => {
    setQuestions((current) => [...current, { questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
  };

  const handleQuestionChange = (index: number, field: keyof QuestionForm, value: string | number) => {
    setQuestions((current) => current.map((question, idx) => idx === index ? { ...question, [field]: value } : question));
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((current) => current.map((question, idx) => {
      if (idx !== questionIndex) return question;
      const nextOptions = [...question.options];
      nextOptions[optionIndex] = value;
      return { ...question, options: nextOptions };
    }));
  };

  const resetForm = () => {
    setEditQuizId(null);
    setTitle('');
    setDuration(10);
    setQuestions([{ questionText: '', options: ['', '', '', ''], correctAnswer: 0 }]);
    if (subjects.length) {
      setSubjectId(subjects[0].id);
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmitQuiz = async () => {
    if (!title || !subjectId || questions.length === 0) {
      toast.error('Fill in quiz title, subject, and at least one question.');
      return;
    }
    for (const question of questions) {
      if (!question.questionText || question.options.some((option) => !option)) {
        toast.error('Each question must have text and all options filled.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        title,
        subjectId,
        duration,
        questions: questions.map((question) => ({
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: 10,
        })),
      };

      if (editQuizId) {
        await api.put(`/admin/quizzes/${editQuizId}`, payload);
        toast.success('Quiz updated.');
      } else {
        await api.post('/admin/quizzes', payload);
        toast.success('Quiz created.');
      }

      resetForm();
      setIsFormOpen(false);
      loadData();
    } catch {
      toast.error(editQuizId ? 'Failed to update quiz.' : 'Failed to create quiz.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuiz = async (quizId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/quizzes/${quizId}`);
      const quiz = response.data.quiz;
      setEditQuizId(quizId);
      setTitle(quiz.title);
      setSubjectId(quiz.subjectId);
      setDuration(quiz.duration);
      setQuestions(quiz.questions.map((question: any) => ({
        questionText: question.questionText,
        options: JSON.parse(question.options),
        correctAnswer: Number(question.correctAnswer),
      })));
      setIsFormOpen(true);
    } catch {
      toast.error('Failed to load quiz for editing.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      toast.success('Quiz deleted.');
      setQuizzes((current) => current.filter((quiz) => quiz.id !== quizId));
    } catch {
      toast.error('Failed to delete quiz.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-[#FF6B6B]/80">Quizzes</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Quiz Studio</h1>
      </div>
      <button
        onClick={() => setIsFormOpen((value) => {
          if (value) resetForm();
          return !value;
        })}
        className="rounded-3xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A7A] px-6 py-4 text-sm font-semibold text-white"
      >
        {isFormOpen ? 'Close Quiz Form' : 'Create New Quiz'}
      </button>

      {isFormOpen && (
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Quiz title"
              className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-white outline-none"
            />
            <select
              value={subjectId}
              onChange={(event) => setSubjectId(event.target.value)}
              className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-white outline-none"
            >
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            <input
              type="number"
              min={5}
              max={60}
              value={duration}
              onChange={(event) => setDuration(Number(event.target.value))}
              className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-white outline-none"
              placeholder="Duration"
            />
          </div>
          <div className="mt-6 space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-[#8C8C9D]">Question {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => setQuestions((current) => current.filter((_, idx) => idx !== index))}
                    className="rounded-2xl bg-[#2A2A38] px-3 py-2 text-xs text-[#E8E8F0]"
                  >
                    Remove
                  </button>
                </div>
                <textarea
                  value={question.questionText}
                  onChange={(event) => handleQuestionChange(index, 'questionText', event.target.value)}
                  rows={3}
                  className="mt-3 w-full rounded-3xl border border-[#2A2A38] bg-[#111118] px-4 py-3 text-sm text-white outline-none"
                  placeholder="Enter question text"
                />
                <div className="mt-4 space-y-3">
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center gap-3">
                      <span className="w-6 text-sm text-[#8C8C9D]">{String.fromCharCode(65 + optionIndex)}</span>
                      <input
                        value={option}
                        onChange={(event) => handleOptionChange(index, optionIndex, event.target.value)}
                        className="flex-1 rounded-3xl border border-[#2A2A38] bg-[#111118] px-4 py-3 text-sm text-white outline-none"
                        placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-3 text-sm text-[#8C8C9D]">
                  <span>Correct answer:</span>
                  <select
                    value={question.correctAnswer}
                    onChange={(event) => handleQuestionChange(index, 'correctAnswer', Number(event.target.value))}
                    className="rounded-3xl border border-[#2A2A38] bg-[#111118] px-4 py-3 text-sm text-white outline-none"
                  >
                    {question.options.map((_, optionIndex) => (
                      <option key={optionIndex} value={optionIndex}>{String.fromCharCode(65 + optionIndex)}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="mt-4 rounded-3xl bg-[#1A1A24] px-5 py-3 text-sm text-[#E8E8F0]"
          >
            Add Question
          </button>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleSubmitQuiz}
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A7A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50 sm:w-auto"
            >
              {loading ? 'Saving quiz...' : 'Save Quiz'}
            </button>
            <button
              type="button"
              onClick={closeForm}
              className="w-full rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-[#CFCFE0] transition hover:bg-[#22222B] sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-[#2A2A38] bg-[#111118]">
        <table className="min-w-full divide-y divide-[#2A2A38] text-left text-sm text-[#E8E8F0]">
          <thead className="bg-[#111118]">
            <tr>
              <th className="px-6 py-4">Title</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.map((quiz) => (
              <tr key={quiz.id} className="border-t border-[#2A2A38] hover:bg-[#1A1A24]">
                <td className="px-6 py-4">{quiz.title}</td>
                <td className="px-6 py-4">{quiz.subject.name}</td>
                <td className="px-6 py-4">{quiz.duration} min</td>
                <td className="px-6 py-4 flex gap-2">
                  <button
                    onClick={() => handleEditQuiz(quiz.id)}
                    className="rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-2 text-sm text-[#E8E8F0] transition hover:border-[#7C6FFF]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    className="rounded-2xl border border-[#FF6B6B] bg-[#1A1A24] px-4 py-2 text-sm text-[#FF6B6B] transition hover:bg-[#2A2A38]"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
