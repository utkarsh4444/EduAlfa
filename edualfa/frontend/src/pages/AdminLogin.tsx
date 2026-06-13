import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginEntry } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!username || !password) {
      toast.error('Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/admin-login', { username, password });
      loginEntry(response.data.token, response.data.user);
      toast.success('Admin access granted.');
      navigate('/admin');
    } catch (error: unknown) {
      toast.error('Incorrect admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,_rgba(255,107,107,0.12),_transparent_20%),radial-gradient(circle_at_bottom,_rgba(124,111,255,0.08),_transparent_20%),#0A0A0F]">
      <div className="w-full max-w-md rounded-3xl border border-[#2A2A38] bg-[#111118] p-8 shadow-[0_0_60px_rgba(255,107,107,0.08)]">
        <div className="text-center space-y-4">
          <div className="text-5xl">⚡</div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>EduAlfa Admin</h1>
          <p className="text-sm text-[#8C8C9D]">Enter the command center for quizzes and leaderboard oversight.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm text-[#A9A9C9]">Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-white outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
              placeholder="admin"
            />
          </div>
          <div>
            <label className="block text-sm text-[#A9A9C9]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-white outline-none transition focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
              placeholder="admin123"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A7A] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            {loading ? 'Authorizing...' : 'Enter Control Room'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-[#8C8C9D]">
          Student? <Link to="/student-login" className="text-[#FF6B6B] hover:text-[#FF8A7A]">Login here →</Link>
        </div>
      </div>
    </div>
  );
}
