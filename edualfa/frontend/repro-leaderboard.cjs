const axios = require('axios');
const { io } = require('socket.io-client');
(async () => {
  try {
    const base = 'http://localhost:5000/api';
    const login = await axios.post(`${base}/auth/student-login`, { studentId: 'STU-2024-001', password: 'password123' });
    const token = login.data.token;
    const me = login.data.user;
    console.log('LOGIN', me);
    const before = await axios.get(`${base}/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('BEFORE top5', before.data.leaderboard.slice(0,5).map((e) => ({rank:e.rank, studentName:e.studentName, score:e.score}))); 
    const current = before.data.leaderboard.find((e) => e.studentId === me.id);
    console.log('BEFORE current', current);
    const subjects = await axios.get(`${base}/student/subjects`, { headers: { Authorization: `Bearer ${token}` } });
    const subject = subjects.data.subjects[0];
    const quizzes = await axios.get(`${base}/student/subjects/${subject.id}/quizzes`, { headers: { Authorization: `Bearer ${token}` } });
    const quizId = quizzes.data.quizzes[0]?.id;
    const quiz = await axios.get(`${base}/student/quizzes/${quizId}`, { headers: { Authorization: `Bearer ${token}` } });
    const answers = {};
    quiz.data.quiz.questions.forEach((q) => { answers[q.id] = 0; });
    const submit = await axios.post(`${base}/student/quizzes/${quizId}/submit`, { answers, timeTaken: 10 }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('SUBMIT score', submit.data.attempt.score);
    const after = await axios.get(`${base}/leaderboard`, { headers: { Authorization: `Bearer ${token}` } });
    console.log('AFTER top5', after.data.leaderboard.slice(0,5).map((e) => ({rank:e.rank, studentName:e.studentName, score:e.score}))); 
    const currentAfter = after.data.leaderboard.find((e) => e.studentId === me.id);
    console.log('AFTER current', currentAfter);
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err.response ? err.response.data : err.message);
    process.exit(1);
  }
})();
