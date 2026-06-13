const base = 'http://localhost:5000';

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  console.log('POST', path, res.status, parsed);
  return { status: res.status, body: parsed };
}

async function get(path, token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { headers });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  console.log('GET', path, res.status, parsed);
  return { status: res.status, body: parsed };
}

(async () => {
  try {
    // Admin login
    const adminLogin = await post('/api/auth/admin-login', { username: 'admin', password: 'admin123' });
    if (!adminLogin.body || !adminLogin.body.token) return console.error('Admin login failed');
    const adminToken = adminLogin.body.token;

    // Create subject
    const subject = await post('/api/admin/subjects', { name: 'SmokeTest Subject', icon: '📘', color: '#0ea5a4' }, adminToken);
    const subjectId = subject.body && (subject.body.subject?.id || subject.body.id || subject.body.data?.id) || null;

    // Create student
    const student = await post('/api/admin/students', { name: 'Smoke Student', password: 'password123' }, adminToken);
    const studentId = student.body && (student.body.student?.studentId || student.body.studentId || student.body.studentId) || null;

    // Create quiz
    const questions = [
      { questionText: '2+2?', options: ['1','2','3','4'], correctAnswer: 3 },
    ];
    const quiz = await post('/api/admin/quizzes', { title: 'SmokeTest Quiz', subjectId: subjectId || undefined, duration: 5, questions }, adminToken);
    const quizId = quiz.body && quiz.body.id ? quiz.body.id : (quiz.body && quiz.body.data && quiz.body.data.id) || null;

    // Student login
    const studentLogin = await post('/api/auth/student-login', { studentId: studentId || 'STU-0000', password: 'password123' });
    if (!studentLogin.body || !studentLogin.body.token) return console.error('Student login failed');
    const studentToken = studentLogin.body.token;

    // Student get subjects
    await get('/api/student/subjects', studentToken);

    // Student get quiz details
    if (quizId) {
      const quizDetails = await get(`/api/student/quizzes/${quizId}`, studentToken);
      const qId = quizDetails.body?.quiz?.questions?.[0]?.id;
      const answers = {};
      if (qId) answers[qId] = 3;
      // Attempt quiz (POST to quizzes/:id/submit)
      await post(`/api/student/quizzes/${quizId}/submit`, { answers, timeTaken: 30 }, studentToken);
    }

    // Leaderboard
    await get('/api/leaderboard', null);

    console.log('Smoke test completed');
  } catch (err) {
    console.error('ERR', err);
  }
})();
