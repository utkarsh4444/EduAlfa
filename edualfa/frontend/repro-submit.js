const axios = require('axios');
const { io } = require('socket.io-client');
(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const login = await axios.post(`${base}/auth/student-login`, { studentId: 'STU-2024-001', password: 'password123' });
    const token = login.data.token;
    console.log('LOGIN', token ? 'ok' : 'fail');
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => console.log('SOCKET connected', socket.id));
    socket.on('leaderboard:update', (data) => {
      console.log('SOCKET leaderboard:update', Array.isArray(data) ? data.length : data);
    });
    socket.on('connect_error', (err) => {
      console.error('SOCKET connect_error', err.message);
    });
    const subjects = await axios.get(`${base}/student/subjects`, { headers: { Authorization: `Bearer ${token}` } });
    const subject = subjects.data.subjects[0];
    console.log('SUBJECT', subject?.id, subject?.name);
    const quizzes = await axios.get(`${base}/student/subjects/${subject.id}/quizzes`, { headers: { Authorization: `Bearer ${token}` } });
    const quizId = quizzes.data.quizzes[0]?.id;
    console.log('QUIZ', quizId);
    const quiz = await axios.get(`${base}/student/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });
    const answers = {};
    quiz.data.quiz.questions.forEach((q) => {
      if (q.type === 'MULTI_SELECT') answers[q.id] = [0]; else answers[q.id] = 0;
    });
    const submit = await axios.post(`${base}/student/quizzes/${quizId}/submit`, { answers, timeTaken: quiz.data.quiz.duration * 60 }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('SUBMIT score', submit.data.attempt.score, 'leaderboard len', Array.isArray(submit.data.leaderboard) ? submit.data.leaderboard.length : 'none');
    setTimeout(() => { socket.close(); process.exit(0); }, 2000);
  } catch (err) {
    console.error('ERROR', err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();
