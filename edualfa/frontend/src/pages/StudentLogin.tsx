import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { loginEntry } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!studentId || !password) {
      toast.error('Student ID and password are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/student-login', { studentId, password });
      loginEntry(response.data.token, response.data.user);
      toast.success('Welcome to EduAlfa!');
      navigate('/student');
    } catch (error: unknown) {
      toast.error('Unable to login. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,_rgba(124,111,255,0.12),_transparent_20%),radial-gradient(circle_at_bottom,_rgba(255,107,107,0.12),_transparent_20%),#0A0A0F]">
      <div className="w-full max-w-md rounded-3xl border border-[#2A2A38] bg-[#111118] p-8 shadow-[0_0_60px_rgba(124,111,255,0.08)]">
        <div className="text-center space-y-4">
          <div className="text-5xl">🎓</div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>EduAlfa</h1>
          <p className="text-sm text-[#8C8C9D]">Enter the learning arena with your student identity.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm text-[#A9A9C9]">Student ID</label>
            <input
              value={studentId}
              onChange={(event) => setStudentId(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-white outline-none transition focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20"
              placeholder="STU-2024-001"
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm text-[#A9A9C9]">
              <label>Password</label>
            </div>
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 pr-12 text-white outline-none transition focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8C9D]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#7C6FFF] to-[#9F96FF] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            {loading ? 'Entering...' : 'Enter Arena'}
          </button>
        </form>
        <div className="mt-6 space-y-3">
          <div className="text-center text-sm text-[#8C8C9D]">
            No account? <Link to="/student-signup" className="text-[#7C6FFF] hover:text-[#9F96FF]">Create one →</Link>
          </div>
          <div className="text-center text-sm text-[#8C8C9D]">
            Admin? <Link to="/admin-login" className="text-[#7C6FFF] hover:text-[#9F96FF]">Login here →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
