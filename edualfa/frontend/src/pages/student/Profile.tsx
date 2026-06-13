import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';
import { BadgePopup } from '../../components/ui/BadgePopup';
import { useLeaderboard } from '../../hooks/useLeaderboard';

interface ProfileBadge {
  badge: { name: string; description: string; icon: string; rarity: string };
}

interface ProfileData {
  id: string;
  name: string;
  studentId: string;
  avatarSeed: string;
  photoUrl?: string;
  totalScore: number;
  rank: number;
  createdAt: string;
  badges: ProfileBadge[];
  attempts: {
    id: string;
    score: number;
    totalScore: number;
    submittedAt: string;
    quiz: { title: string; subject: { name: string } };
  }[];
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { leaderboard } = useLeaderboard();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get('/student/profile').then((response) => {
      setProfile(response.data.profile);
      setEditName(response.data.profile.name);
      if (response.data.profile.photoUrl) {
        setProfilePhoto(resolvePhotoUrl(response.data.profile.photoUrl));
      }
    }).catch((error) => {
      console.error('Failed to load profile:', error);
    });
  }, []);

  const stats = useMemo(() => {
    if (!profile) return { quizzes: 0, average: 0, bestScore: 0, badgeCount: 0 };
    const quizzes = profile.attempts.length;
    const average = quizzes
      ? Math.round(profile.attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalScore) * 100, 0) / quizzes)
      : 0;
    const bestScore = profile.attempts.reduce((best, attempt) => Math.max(best, attempt.score), 0);
    return { quizzes, average, bestScore, badgeCount: profile.badges.length };
  }, [profile]);

  const currentRank = useMemo(() => {
    if (!user) return 0;
    return leaderboard.find((entry) => entry.studentId === user.id)?.rank ?? 0;
  }, [leaderboard, user]);

  const resolvePhotoUrl = (url?: string | null) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${api.defaults.baseURL?.replace(/\/$/, '')}${url}`;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', editName);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      console.log('Sending profile update with:', { name: editName, hasPhoto: !!photoFile });

      const response = await api.post('/student/profile/update', formData);

      console.log('Profile update response:', response.data);

      setProfile(response.data.profile);
      setEditName(response.data.profile.name);
      setPhotoFile(null);
      if (response.data.profile.photoUrl) {
        setProfilePhoto(resolvePhotoUrl(response.data.profile.photoUrl));
      }
      setIsEditMode(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Profile update error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Failed to update profile';
      alert(`Error: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setEditName(profile?.name ?? '');
    setPhotoFile(null);
    if (profile?.photoUrl) {
      setProfilePhoto(resolvePhotoUrl(profile.photoUrl));
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#27272e]"
        >
          ← Back
        </button>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Student Profile</p>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Your learning profile</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#8C8C9D]">A premium overview of your progress, achievements, badges, and recent quiz performance.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsEditMode(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-[#7C6FFF] bg-[#2E1B3F] px-4 py-2 text-sm font-semibold text-[#7C6FFF] transition hover:bg-[#3D2851]"
          >
            ✏️ Edit Profile
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="space-y-6 rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-[#7C6FFF] to-[#FF6B6B] text-5xl font-bold text-white overflow-hidden">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  profile?.name?.charAt(0) ?? user?.name?.charAt(0) ?? 'S'
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsEditMode(true)}
                className="absolute bottom-0 right-0 rounded-full bg-[#7C6FFF] p-2 text-white hover:bg-[#6A5CE1] transition"
              >
                <Camera size={16} />
              </button>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Student</p>
              <h2 className="text-3xl font-semibold text-white">{profile?.name ?? user?.name ?? 'Student'}</h2>
              <p className="mt-2 text-sm text-[#8C8C9D]">ID: {profile?.studentId ?? user?.studentId ?? 'STU-000'}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Total XP</p>
              <p className="mt-3 text-3xl font-semibold text-white">{profile ? profile.totalScore : '—'}</p>
            </div>
            <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Current Rank</p>
              <p className="mt-3 text-3xl font-semibold text-white">{currentRank ? `#${currentRank}` : '—'}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-5 text-center">
              <p className="text-sm text-[#8C8C9D]">Quizzes Completed</p>
              <p className="mt-3 text-2xl font-semibold text-white">{stats.quizzes}</p>
            </div>
            <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-5 text-center">
              <p className="text-sm text-[#8C8C9D]">Average Score</p>
              <p className="mt-3 text-2xl font-semibold text-white">{stats.average}%</p>
            </div>
            <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-5 text-center">
              <p className="text-sm text-[#8C8C9D]">Best Score</p>
              <p className="mt-3 text-2xl font-semibold text-white">{stats.bestScore}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Badges earned</p>
              <h2 className="text-2xl font-semibold">Achievement collection</h2>
            </div>
            <p className="text-sm text-[#8C8C9D]">Stay motivated and unlock more badges.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {profile?.badges.length ? (
              profile.badges.map((badge, idx) => <BadgePopup key={`${badge.badge.name}-${idx}`} badge={badge.badge} />)
            ) : (
              <div className="rounded-3xl border border-dashed border-[#2A2A38] bg-[#1A1A24] p-6 text-center text-sm text-[#8C8C9D]">
                No badges yet. Complete subject quizzes to start collecting them.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Profile Insights</p>
          <h2 className="mt-2 text-3xl font-semibold">Your learning habits</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Joined</p>
              <p className="mt-2 text-lg text-white">{profile ? new Date(profile.createdAt).toLocaleDateString() : 'Loading...'}</p>
            </div>
            <div className="rounded-3xl bg-[#1A1A24] p-5">
              <p className="text-sm text-[#8C8C9D]">Suggested next step</p>
              <p className="mt-2 text-lg text-white">Keep your streak alive by attempting one new quiz every day.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
          <p className="text-sm uppercase tracking-[0.4em] text-[#7C6FFF]/80">Recent quiz activity</p>
          <h2 className="mt-2 text-3xl font-semibold">Latest attempts</h2>
          <div className="mt-6 space-y-4">
            {profile?.attempts.length ? (
              profile.attempts.slice(0, 4).map((attempt) => (
                <div key={attempt.id} className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{attempt.quiz.title}</p>
                      <p className="text-sm text-[#8C8C9D]">{attempt.quiz.subject.name}</p>
                    </div>
                    <span className="rounded-2xl bg-[#27272d] px-3 py-1 text-sm text-[#E8E8F0]">{new Date(attempt.submittedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#8C8C9D]">
                    <span>{attempt.score}/{attempt.totalScore}</span>
                    <span>{Math.round((attempt.score / attempt.totalScore) * 100)}%</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-[#2A2A38] bg-[#1A1A24] p-6 text-center text-sm text-[#8C8C9D]">
                No quiz attempts yet. Start your first quiz to build your profile.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#2A2A38] bg-[#111118] p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-2xl font-semibold text-white">Edit Profile</h2>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full bg-[#2A2A38] p-2 text-white hover:bg-[#3A3A48] transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Photo Upload Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="flex h-28 w-28 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-[#7C6FFF] to-[#FF6B6B] text-5xl font-bold text-white overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      profile?.name?.charAt(0) ?? 'S'
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 rounded-full bg-[#7C6FFF] p-3 text-white hover:bg-[#6A5CE1] transition cursor-pointer">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-[#8C8C9D]">Click camera to upload photo</p>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-white outline-none focus:border-[#7C6FFF] transition"
                  placeholder="Enter your name"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-2xl border border-[#2A2A38] bg-[#1A1A24] px-4 py-3 text-white font-semibold transition hover:bg-[#27272e]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#7C6FFF] to-[#FF6B6B] px-4 py-3 text-white font-semibold transition hover:brightness-110 disabled:opacity-50"
                >
                  <Save size={18} />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
