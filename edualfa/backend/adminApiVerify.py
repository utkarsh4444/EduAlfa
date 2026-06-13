import json
import urllib.request
import urllib.error

base = 'http://127.0.0.1:5000'

def post(path, data, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    req = urllib.request.Request(base + path, data=json.dumps(data).encode('utf-8'), headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            return resp.status, json.loads(body)
    except urllib.error.HTTPError as err:
        body = err.read().decode('utf-8')
        try:
            body = json.loads(body)
        except Exception:
            pass
        return err.code, body

status, login = post('/api/auth/admin-login', {'username': 'admin', 'password': 'admin123'})
print('admin-login', status, login)
if status != 200 or 'token' not in login:
    raise SystemExit(1)

token = login['token']
status, subject = post('/api/admin/subjects', {'name': 'API Test Subject', 'icon': '🧪', 'color': '#10B981'}, token)
print('create-subject', status, subject)
status, student = post('/api/admin/students', {'name': 'API Student', 'password': 'password123'}, token)
print('create-student', status, student)
status, quiz = post('/api/admin/quizzes', {'title': 'API Test Quiz', 'subjectId': subject.get('subject', {}).get('id', ''), 'duration': 10, 'questions': [{'questionText':'Why?','options':['A','B','C','D'],'correctAnswer':0}]}, token)
print('create-quiz', status, quiz)
