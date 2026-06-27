# VAMBU TVET SmartLearn — Frontend

React + Vite + Tailwind CSS v4 frontend for the VSL learning platform.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend URL
npm run dev
```

Runs at http://localhost:5173 by default. Requires the backend API to be running (see `../backend/README.md`).

## Structure

```
src/
  api/            axios client + endpoint functions
  context/        AuthContext (global auth state, login/logout)
  components/     AppShell (sidebar layout), ProtectedRoute, LevelStamp (CBET badge)
  pages/
    LoginPage.jsx
    student/      Dashboard, course units, common units, unit detail, quiz taking, progress
    teacher/      Dashboard, manage courses/units, content upload, quiz builder, analytics, students
  utils/cbet.js   Shared CBET level constants/labels
```

## Roles

- **Student**: sees only their enrolled course's units + common units (Safety, Math, English). Takes quizzes, tracks progress.
- **Teacher / Admin**: manages courses, units, content uploads, quizzes, and views analytics across all students.

The same login page routes to the right dashboard based on the account's role — there's no separate teacher/student login flow.

## Build for production

```bash
npm run build
```

Outputs to `dist/`. Serve with any static host (nginx, Vercel, Netlify, etc.) — just make sure `VITE_API_BASE_URL` is set correctly at build time for your deployed backend.
