import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../../lib/axios';

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const emojiOptions = ['📘', '🧠', '🧪', '🧮', '🔬', '🌍'];
const colorSwatches = ['#7C6FFF', '#FF6B6B', '#FFD700', '#34D399', '#38BDF8', '#F97316'];

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📘');
  const [color, setColor] = useState('#7C6FFF');
  const [loading, setLoading] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editingIcon, setEditingIcon] = useState('📘');
  const [editingColor, setEditingColor] = useState('#7C6FFF');

  const loadSubjects = async () => {
    const response = await api.get('/admin/subjects');
    setSubjects(response.data.subjects);
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleCreateSubject = async () => {
    if (!name) {
      toast.error('Subject name is required.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/admin/subjects', { name, icon, color });
      toast.success('Subject created.');
      setName('');
      setIcon('📘');
      setColor('#7C6FFF');
      loadSubjects();
    } catch {
      toast.error('Unable to create subject.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm('Delete this subject and all quizzes under it?')) return;
    try {
      await api.delete(`/admin/subjects/${id}`);
      toast.success('Subject deleted.');
      setSubjects((current) => current.filter((subject) => subject.id !== id));
      if (editingSubjectId === id) {
        setEditingSubjectId(null);
      }
    } catch {
      toast.error('Failed to delete subject.');
    }
  };

  const startEditingSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setEditingName(subject.name);
    setEditingIcon(subject.icon);
    setEditingColor(subject.color);
  };

  const cancelEditing = () => {
    setEditingSubjectId(null);
  };

  const handleSaveSubject = async () => {
    if (!editingSubjectId) return;
    if (!editingName) {
      toast.error('Subject name is required.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/admin/subjects/${editingSubjectId}`, {
        name: editingName,
        icon: editingIcon,
        color: editingColor,
      });

      setSubjects((current) => current.map((subject) => (
        subject.id === editingSubjectId ? response.data.subject : subject
      )));
      toast.success('Subject updated.');
      setEditingSubjectId(null);
    } catch {
      toast.error('Unable to update subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.4em] text-[#FF6B6B]/80">Subjects</p>
        <h1 className="text-4xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>Manage Subject Hubs</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-3xl border border-[#2A2A38] bg-[#111118] p-6">
            {editingSubjectId === subject.id ? (
              <div className="space-y-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl" style={{ backgroundColor: `${editingColor}20` }}>
                  <span className="text-4xl">{editingIcon}</span>
                </div>
                <input
                  value={editingName}
                  onChange={(event) => setEditingName(event.target.value)}
                  placeholder="Subject name"
                  className="w-full rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-white outline-none"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
                    <p className="text-sm text-[#8C8C9D]">Icon</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {emojiOptions.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditingIcon(emoji)}
                          className={`rounded-2xl px-3 py-2 text-xl ${editingIcon === emoji ? 'bg-[#7C6FFF]/20 text-white' : 'bg-[#111118] text-[#CFCFE0]'}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
                    <p className="text-sm text-[#8C8C9D]">Color</p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {colorSwatches.map((swatch) => (
                        <button
                          key={swatch}
                          type="button"
                          onClick={() => setEditingColor(swatch)}
                          className={`h-10 w-10 rounded-full ${editingColor === swatch ? 'ring-2 ring-[#7C6FFF]' : ''}`}
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={handleSaveSubject}
                    disabled={loading}
                    className="rounded-2xl bg-gradient-to-r from-[#34D399] to-[#10B981] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-2xl border border-[#6B7280] bg-[#1A1A24] px-4 py-2 text-xs text-[#D1D5DB] transition hover:bg-[#2A2A38]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl" style={{ backgroundColor: `${subject.color}20` }}>
                  <span className="text-4xl">{subject.icon}</span>
                </div>
                <h2 className="text-2xl font-semibold">{subject.name}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => startEditingSubject(subject)}
                    className="rounded-2xl border border-[#7C6FFF] bg-[#1A1A24] px-3 py-2 text-xs text-[#C7D2FE] transition hover:bg-[#2A2A38]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id)}
                    className="rounded-2xl border border-[#FF6B6B] bg-[#1A1A24] px-3 py-2 text-xs text-[#FF6B6B] transition hover:bg-[#2A2A38]"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
        <div className="rounded-3xl border border-dashed border-[#2A2A38] bg-[#111118] p-6">
          <h2 className="text-xl font-semibold text-white">Create New Subject</h2>
          <div className="mt-5 space-y-4">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Subject name"
              className="w-full rounded-3xl border border-[#2A2A38] bg-[#1A1A24] px-5 py-3 text-sm text-white outline-none focus:border-[#FF6B6B] focus:ring-2 focus:ring-[#FF6B6B]/20"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
                <p className="text-sm text-[#8C8C9D]">Icon</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setIcon(emoji)}
                      className={`rounded-2xl px-3 py-2 text-xl ${icon === emoji ? 'bg-[#7C6FFF]/20 text-white' : 'bg-[#111118] text-[#CFCFE0]'}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-[#2A2A38] bg-[#1A1A24] p-4">
                <p className="text-sm text-[#8C8C9D]">Color</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      onClick={() => setColor(swatch)}
                      className={`h-10 w-10 rounded-full ${color === swatch ? 'ring-2 ring-[#7C6FFF]' : ''}`}
                      style={{ backgroundColor: swatch }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateSubject}
              disabled={loading}
              className="w-full rounded-3xl bg-gradient-to-r from-[#FF6B6B] to-[#FF8A7A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Subject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
