import { AnimatePresence, motion } from 'framer-motion';
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import AdminLogin from './pages/AdminLogin';
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';
import StudentDashboard from './pages/student/StudentDashboard';
import SubjectList from './pages/student/SubjectList';
import SubjectQuizzes from './pages/student/SubjectQuizzes';
import QuizAttempt from './pages/student/QuizAttempt';
import QuizResult from './pages/student/QuizResult';
import StudentHistory from './pages/student/StudentHistory';
import { Toaster } from 'react-hot-toast';
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/Analytics';
import AdminStudents from './pages/admin/AdminStudents';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminQuizzes from './pages/admin/AdminQuizzes';
import AdminAttempts from './pages/admin/AdminAttempts';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/student/Profile';

function RequireAuth({ allowedRole, children }: { allowedRole: 'student' | 'admin'; children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user || user.role !== allowedRole) {
    const redirectTo = allowedRole === 'student' ? '/student-login' : '/admin-login';
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
}

function AnimatedRouteWrapper({ children }: { children: JSX.Element }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route
        path="/student/*"
        element={
          <RequireAuth allowedRole="student">
            <StudentLayout />
          </RequireAuth>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="subjects" element={<SubjectList />} />        <Route path="subjects/:id" element={<SubjectQuizzes />} />        <Route path="quiz/:id" element={<QuizAttempt />} />
        <Route path="quiz-result" element={<QuizResult />} />
        <Route path="history" element={<StudentHistory />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="profile" element={<Profile />} />
      </Route>
      <Route
        path="/admin/*"
        element={
          <RequireAuth allowedRole="admin">
            <AdminLayout />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<AdminStudents />} />
        <Route path="subjects" element={<AdminSubjects />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="attempts" element={<AdminAttempts />} />
      </Route>
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="*" element={<Navigate to="/student-login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AnimatedRouteWrapper>
        <AppRoutes />
      </AnimatedRouteWrapper>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}
