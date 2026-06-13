const base = 'http://localhost:5000';

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed = text;
  try { parsed = JSON.parse(text); } catch {}
  console.log(path, res.status, parsed);
  return { status: res.status, body: parsed };
}

(async () => {
  try {
    const login = await post('/api/auth/admin-login', { username: 'admin', password: 'admin123' });
    if (!login.body || !login.body.token) {
      console.error('Login failed');
      return;
    }
    const token = login.body.token;
    await post('/api/admin/subjects', { name: 'API Test Subject', icon: '🧪', color: '#10B981' }, token);
    await post('/api/admin/students', { name: 'API Student', password: 'password123' }, token);
  } catch (error) {
    console.error(error);
  }
})();
