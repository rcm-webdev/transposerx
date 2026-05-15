# TransposerX LMS — Design Spec
**Date:** 2026-05-14
**Status:** Approved

## Overview

TransposerX evolves from a single-page prescription transposition calculator into a full-stack clinical training LMS for new ophthalmic technicians. The app performs prescription transposition calculations and teaches the underlying optometry concepts through structured lessons, embedded quizzes, and an active recall practice mode — with per-user progress tracking and transposition history.

**Positioning:** A clinical training tool that both performs the calculation and teaches the underlying optometry concept — with per-user progress tracking, transposition history, and an active recall practice mode. Production-ready.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Vite + React 19 + React Router v6 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react (no emojis anywhere) |
| Forms | React Hook Form + Zod |
| Server state | TanStack Query |
| Toasts | Sonner |
| MDX | vite-plugin-mdx (compiled at build time) |
| Backend | Express + TypeScript |
| Auth | Better Auth (email/password) with Prisma adapter |
| ORM | Prisma |
| Database | PostgreSQL |
| Dev DB | Docker (postgres:16 via docker-compose.yml) |
| Frontend deploy | Vercel |
| Backend deploy | Render (Node web service + managed PostgreSQL) |

---

## Project Structure

Monorepo with two packages. Root `package.json` contains workspace scripts only — no shared code between client and server.

```
transposerx/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TransposeForm.tsx
│   │   │   ├── QuizComponent.tsx
│   │   │   ├── LessonCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── Navbar.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transpose.tsx
│   │   │   ├── Lessons.tsx
│   │   │   ├── LessonDetail.tsx
│   │   │   └── Practice.tsx
│   │   ├── lib/
│   │   │   ├── transpose.ts       # pure function, duplicated from server
│   │   │   ├── api.ts             # typed fetch wrappers for all API routes
│   │   │   └── auth.ts            # Better Auth client instance
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── content/
│   │   └── lessons/
│   │       ├── 01-what-is-cylinder.mdx
│   │       ├── 02-what-is-axis.mdx
│   │       ├── 03-why-transposition-matters.mdx
│   │       └── 04-when-to-use-each-format.mdx
│   ├── vite.config.ts
│   └── package.json
├── server/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── transpositions.ts
│   │   │   ├── lessons.ts
│   │   │   ├── practice.ts
│   │   │   └── auth.ts
│   │   ├── lib/
│   │   │   ├── prisma.ts
│   │   │   ├── transpose.ts       # pure function, duplicated from client
│   │   │   └── lessons.ts         # hardcoded lesson metadata (slug, title, order) — 4 lessons, never changes in MVP
│   │   ├── middleware/
│   │   │   └── requireAuth.ts
│   │   └── index.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── .env                           # server env vars (never committed)
└── package.json                   # root scripts only
```

---

## Database Schema

Better Auth generates and owns `User`, `Session`, `Account`, and `Verification` models via `npx better-auth generate`. Do not hand-write these.

App-owned models:

```prisma
model TranspositionHistory {
  id            String   @id @default(cuid())
  userId        String
  inputSphere   Float
  inputCylinder Float
  inputAxis     Int
  outSphere     Float
  outCylinder   Float
  outAxis       Int
  eye           String   // "OD" | "OS"
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
}

model LessonProgress {
  id          String         @id @default(cuid())
  userId      String
  lessonSlug  String
  status      ProgressStatus @default(not_started)
  completedAt DateTime?
  user        User           @relation(fields: [userId], references: [id])

  @@unique([userId, lessonSlug])
}

model QuizAttempt {
  id        String   @id @default(cuid())
  userId    String
  source    String   // lesson slug | "practice"
  score     Int      // correct answers
  total     Int      // questions in session
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}

enum ProgressStatus {
  not_started
  started
  completed
}
```

**Key decisions:**
- `eye` field on `TranspositionHistory` — OD and OS saved as separate rows for clean per-eye querying.
- `QuizAttempt` tracks session outcomes only (score + total), not individual question answers. Keeps the schema minimal.
- No `QuizQuestion` table — questions live in MDX frontmatter. DB only tracks outcomes.
- History is append-only. No DELETE routes in MVP.

---

## API Design

All routes under `/api`. Auth routes handled by the Better Auth handler. All non-auth routes protected by `requireAuth` middleware (returns 401 if no valid session).

### Auth
```
ALL  /api/auth/**    Better Auth handler (login, register, session, signout)
```

### Transpositions
```
GET  /api/transpositions         Last 10 for current user, ordered createdAt desc
POST /api/transpositions         body: { eye, inputSphere, inputCylinder, inputAxis }
                                 Server runs transpose() + Zod validation, saves to DB
                                 Returns: { id, outSphere, outCylinder, outAxis }
```

### Lessons
```
GET  /api/lessons                All 4 lesson metadata + user's LessonProgress status
                                 Returns: [{ slug, title, order, status }]

POST /api/lessons/:slug/start    Upsert LessonProgress { status: "started" }
                                 Will not downgrade a "completed" lesson
                                 Returns: { status }

POST /api/lessons/:slug/complete Upsert LessonProgress { status: "completed", completedAt: now() }
                                 Returns: { status, completedAt }
```

### Practice
```
POST /api/practice/attempt       body: { source, score, total }
                                 Saves QuizAttempt to DB
                                 Returns: { id, score, total, createdAt }

GET  /api/practice/best          User's best QuizAttempt by score/total ratio
                                 Returns: { score, total, createdAt } | null
```

### Dashboard
```
GET  /api/dashboard              Single aggregated endpoint
                                 Returns: {
                                   lessonsCompleted: number,
                                   lessonProgress: [{ slug, title, status }],
                                   recentHistory: [last 5 TranspositionHistory rows],
                                   bestQuiz: { score, total } | null
                                 }
```

---

## Frontend Architecture

### Routes

```
/login                 Public — Login.tsx
/register              Public — Register.tsx

/                      Protected → redirect /dashboard
/dashboard             Protected — Dashboard.tsx
/transpose             Protected — Transpose.tsx
/lessons               Protected — Lessons.tsx
/lessons/:slug         Protected — LessonDetail.tsx
/practice              Protected — Practice.tsx
```

`ProtectedRoute.tsx` wraps all protected routes. Calls `useAuth()` from the Better Auth client. Redirects to `/login` if no active session.

### Key Components

| Component | Responsibility |
|---|---|
| `TransposeForm` | React Hook Form + Zod, instant client result, POST to API, copy Rx button |
| `LessonCard` | Slug, title, status badge (Lucide icons, no emojis) |
| `QuizComponent` | Multiple choice, correct/wrong feedback, fires lesson complete on pass |
| `PracticeSession` | Shuffled queue of concept questions + transposition drills, score on end |
| `ProgressBar` | shadcn Progress, "X of 4 lessons completed" |
| `HistoryList` | Last 5 transpositions in `OD: input → output` monospace format |
| `ProtectedRoute` | Session check, redirect to /login |
| `Navbar` | App navigation with Lucide icons |

### Auth Flow

1. User visits protected route → `ProtectedRoute` calls `useAuth()` → Better Auth checks cookie session against `/api/auth/session` → no session → redirect `/login`.
2. Login form → Better Auth `client.signIn()` → `POST /api/auth/sign-in` → sets `httpOnly` session cookie → redirect `/dashboard`.
3. All API calls include cookie automatically. CORS configured on Render to allow Vercel frontend origin only.

### MDX

Lessons compiled at build time by `vite-plugin-mdx`. No runtime parsing. Lesson content baked into the Vite bundle. Frontmatter contains slug, title, order, and quiz questions array.

MDX frontmatter shape:
```yaml
---
slug: "what-is-cylinder"
title: "What is Cylinder?"
order: 1
quiz:
  - question: "Cylinder in a prescription corrects for..."
    options: ["Nearsightedness", "Astigmatism", "Farsightedness"]
    answer: 1
---
```

---

## LMS Feature Design

### Lessons

4 MDX files in `client/content/lessons/`:
- `01-what-is-cylinder.mdx`
- `02-what-is-axis.mdx`
- `03-why-transposition-matters.mdx`
- `04-when-to-use-each-format.mdx`

Content is real optometry material — no placeholder text.

**Lesson detail flow:**
1. Page load → `POST /api/lessons/:slug/start` (upserts to "started", will not downgrade "completed")
2. MDX content renders inline
3. `QuizComponent` at bottom — single multiple choice question from MDX frontmatter
4. Correct answer → `POST /api/lessons/:slug/complete` → status badge updates

### Practice Mode (`/practice`)

Active recall quiz bank. Always accessible — no lesson unlock gates.

**Session structure:** 10 questions total
- 6 concept questions — pulled from all MDX lesson frontmatter quizzes, shuffled
- 4 transposition drills — randomly generated Rx values (sphere, cylinder, axis within valid clinical ranges)

**Transposition drills:**
- Multiple choice, 3 options
- 1 correct answer (computed by `transpose()`)
- 2 plausible distractors (axis off by 45°, sign errors)
- No free-text entry in MVP
- Generated Rx ranges: sphere −10.00 to +10.00 in 0.25 steps, cylinder −4.00 to −0.25 in 0.25 steps (negative only), axis 1–180 in 1-degree steps

**Question type label** shown per question: "Concept Question" or "Transposition Drill" (Lucide icon, no emoji).

**Session end:** Score screen → `POST /api/practice/attempt` → best score persisted and shown on dashboard.

---

## Dashboard

Single page at `/dashboard`. One API call: `GET /api/dashboard`.

**Three sections:**

1. **Stats row** — three stat cards: lessons completed (X of 4), total transpositions run, best quiz score (X/10). Lucide icons for each stat type.

2. **Two-column body:**
   - Left: Lesson progress list — shadcn `Progress` bar ("X of 4 lessons completed") + per-lesson status labels (Done / Started / —). Lucide icons for section header.
   - Right: Recent transpositions — last 5 rows in monospace `OD: input → output` format.

3. **Quick Transpose** — full `TransposeForm` inline at bottom. Result saves to history on submit.

---

## Transpose Logic

Pure function in both `client/src/lib/transpose.ts` and `server/src/lib/transpose.ts`. Intentionally duplicated — no shared package needed.

```ts
function transpose(sphere: number, cylinder: number, axis: number) {
  const newAxis = (axis + 90) % 180
  return {
    sphere: sphere + cylinder,
    cylinder: cylinder * -1,
    axis: newAxis === 0 ? 180 : newAxis,
  }
}
```

Zod schema (used on both client for form validation and server for POST body validation):
```ts
const TransposeInput = z.object({
  eye: z.enum(["OD", "OS"]),
  inputSphere: z.number(),
  inputCylinder: z.number(),
  inputAxis: z.number().int().min(0).max(180),
})
```

---

## Deployment

### Vercel (client)

- Vite static build output
- SPA fallback: all routes → `index.html`
- Environment variable: `VITE_API_URL=https://<render-service>.onrender.com`
- Auto-deploy on push to `main`

### Render (server)

- Node web service running Express
- Managed PostgreSQL add-on — `DATABASE_URL` injected automatically
- Build command: `prisma migrate deploy && tsc`
- Start command: `node dist/index.js`
- CORS: `CLIENT_ORIGIN` env var set to Vercel domain, no wildcard

### Environment Variables

**server/.env (never committed):**
```
DATABASE_URL=
BETTER_AUTH_SECRET=
CLIENT_ORIGIN=https://<your-app>.vercel.app
```

**client/.env (never committed):**
```
VITE_API_URL=https://<your-api>.onrender.com
```

---

## Build Sequence (Implementation Order)

1. Repo scaffold — monorepo structure, root scripts, docker-compose, .env files
2. Database — Prisma schema, Better Auth model generation, `migrate dev`
3. Auth layer — Better Auth server config, `/api/auth/**` handler, `requireAuth` middleware, login/register pages
4. Transpose feature — `transpose.ts` lib, `TransposeForm`, POST/GET API routes, history
5. LMS — MDX lesson files, lesson list page, lesson detail page, start/complete API routes
6. Practice mode — `PracticeSession` component, question generation, attempt API
7. Dashboard — `GET /api/dashboard`, dashboard page with all three sections
8. Deployment — Vercel config, Render service, environment variables, smoke test

---

## Out of Scope (MVP)

- Admin UI for content management
- AI layer (patient complaint simulator, explanation assistant) — deferred to post-launch
- Email verification
- Password reset flow
- Per-question quiz attempt tracking
- Lesson unlock gates
- Delete/edit transposition history
