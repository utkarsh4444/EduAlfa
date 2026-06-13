import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Student {
  id: string;
  name: string;
  studentId: string;
  createdAt: string;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    const response = await api.get('/admin/students');
    setStudents(response.data.students);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filtered = students.filter((student) => student.name.toLowerCase().includes(search.toLowerCase()) || student.studentId.toLowerCase().includes(search.toLowerCase()));

  const handleCreateStudent = async () => {
    if (!name || !password) {
      toast.error('Name and password are required.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/students', { name, password });
      toast.success('Student created successfully.');
      setName('');
      setPassword('');
      setIsFormOpen(false);
      loadStudents();
    } catch (error: unknown) {
      toast.error('Unable to create student.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Delete this student record?')) return;
    try {
      await api.delete(`/admin/students/${id}`);
      toast.success('Student deleted.');
      setStudents((current) => current.filter((student) => student.id !== id));
    } catch {
      toast.error('Failed to delete student.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-[#FF6B6B]/80">Students</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Manage Learners</h1>
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search students..."
          className="w-full rounded-3xl border border-[#2A2A38] bg-[#111118] px-5 py-3 text-sm text-white outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20 sm:max-w-sm"
        />
        <button
          onClick={() => setIsFormOpen((value) => !value)}
          className="rounded-3xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A7A] px-5 py-3 text-sm font-semibold text-white"
        >
          {isFormOpen ? 'Close Form' : 'Add Student'}
        </button>
      </div>

      {isFormOpen && (
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <h2 className="text-xl font-semibold text-white">Create New Student</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Full name"
              className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-white outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-white outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
            />
          </div>
          <button
            onClick={handleCreateStudent}
            disabled={loading}
            className="mt-6 rounded-3xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A7A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Student'}
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-[#2A2A38] bg-[#111118]">
        <table className="min-w-full divide-y divide-[#2A2A38] text-left text-sm text-[#E8E8F0]">
          <thead className="bg-[#111118]">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Student ID</th>
              <th className="px-6 py-4">Created</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((student) => (
              <tr key={student.id} className="border-t border-[#2A2A38] hover:bg-[#1A1A24]">
                <td className="px-6 py-4">{student.name}</td>
                <td className="px-6 py-4">{student.studentId}</td>
                <td className="px-6 py-4">{new Date(student.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDeleteStudent(student.id)}
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
