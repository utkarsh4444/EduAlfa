# EduAlfa - Class 8 Quiz Platform

EduAlfa is a dark-themed quiz platform for Class 8 students with real-time leaderboard, admin management, and immersive student flows.

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, React Router DOM v6, Axios, Socket.io-client, Recharts, React Hot Toast, Lucide React
- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Socket.io, JWT, bcryptjs, cors, dotenv

## Architecture

```
edualfa/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── socket/
│   │   └── server.ts
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── hooks/
    │   ├── pages/
    │   ├── lib/
    │   └── App.tsx
    └── package.json
```

## Local Setup

### Backend

```bash
cd edualfa/backend
npm install
cp .env.example .env
# Update DATABASE_URL if needed
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend

```bash
cd edualfa/frontend
npm install
npm run dev
```

## Admin Credentials

- Username: `admin`
- Password: `admin123`

## Leaderboard Scoring Formula

```js
finalScore = Math.round(
  (accuracyScore + speedBonus) * consistencyMultiplier * 10
) / 10
```

Where:
- `accuracyScore = (correctPoints / totalPoints) * 100`
- `speedBonus = min(count of fast attempts * 5, 20)`
- `consistencyMultiplier = attempts >= 3 ? 1.1 : 1.0`

## Deployment Guide

### Railway

1. Push repository to GitHub.
2. Create Railway project and connect repository.
3. Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `CLIENT_URL`.
4. Set backend start command: `npm run start`.

### Vercel

1. Add frontend project to Vercel.
2. Set environment variables: `VITE_API_URL`, `VITE_SOCKET_URL`.
3. Connect to GitHub and deploy.

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/admin-login` | POST | Admin login |
| `/api/auth/student-login` | POST | Student login |
| `/api/auth/me` | GET | Get authenticated user |
| `/api/admin/students` | GET/POST/PUT/DELETE | Manage students |
| `/api/admin/subjects` | GET/POST/PUT/DELETE | Manage subjects |
| `/api/admin/quizzes` | GET/POST/PUT/DELETE | Manage quizzes |
| `/api/admin/attempts` | GET | List quiz attempts |
| `/api/admin/stats` | GET | Admin stats |
| `/api/student/subjects` | GET | Student subjects |
| `/api/student/subjects/:id/quizzes` | GET | List quizzes by subject |
| `/api/student/quizzes/:id` | GET | Fetch quiz details |
| `/api/student/quizzes/:id/submit` | POST | Submit quiz |
| `/api/student/attempts` | GET | Student attempts |
| `/api/student/profile` | GET | Profile info |
| `/api/leaderboard` | GET | Leaderboard data |
| `/api/leaderboard/subject/:id` | GET | Leaderboard by subject |
