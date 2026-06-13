import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function StudentSignup() {
  const navigate = useNavigate();
  const { loginEntry } = useAuth();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !studentId || !password || !confirmPassword) {
      toast.error('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/student-register', {
        name,
        studentId,
        password,
        confirmPassword,
      });
      loginEntry(response.data.token, response.data.user);
      toast.success('Account created successfully!');
      navigate('/student');
    } catch (error: unknown) {
      const err = error as any;
      toast.error(err.response?.data?.error || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,_rgba(124,111,255,0.12),_transparent_20%),radial-gradient(circle_at_bottom,_rgba(255,107,107,0.12),_transparent_20%),#0A0A0F]">
      <div className="w-full max-w-md rounded-3xl border border-[#2A2A38] bg-[#111118] p-8 shadow-[0_0_60px_rgba(124,111,255,0.08)]">
        <div className="text-center space-y-4">
          <div className="text-5xl">🎓</div>
          <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Create Account</h1>
          <p className="text-sm text-[#8C8C9D]">Join the learning arena and start your journey.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label className="block text-sm text-[#A9A9C9]">Full Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-white outline-none transition focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20"
              placeholder="John Doe"
            />
          </div>
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
            <label className="block text-sm text-[#A9A9C9]">Password</label>
            <div className="relative mt-2">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 pr-12 text-white outline-none transition focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20"
                placeholder="At least 6 characters"
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
          <div>
            <label className="block text-sm text-[#A9A9C9]">Confirm Password</label>
            <div className="relative mt-2">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 pr-12 text-white outline-none transition focus:border-[#7C6FFF] focus:ring-2 focus:ring-[#7C6FFF]/20"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C8C9D]"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-[#7C6FFF] to-[#9F96FF] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 text-center text-sm text-[#8C8C9D]">
          Already have an account? <Link to="/student-login" className="text-[#7C6FFF] hover:text-[#9F96FF]">Login here →</Link>
        </div>
      </div>
    </div>
  );
}
