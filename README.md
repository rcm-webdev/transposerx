# Transpose Rx

Internal training tool built for ophthalmic technicians at a local eye clinic, combining an instant prescription transposer with a structured lesson library and practice mode.

![Transpose Rx](/public/transposerx.gif)

---

## Key Features

- Instantly converts negative-cylinder prescriptions to positive format using the standard optometry transposition formula
- Per-eye transposition history saved per user, upserted on each submission
- MDX-based lesson library covering cylinder, axis, and transposition concepts
- Quiz and practice mode with personal best score tracking
- Dashboard summarizing lesson progress and recent transposition history
- Session-based authentication with email and password registration

---

## Architecture

```mermaid
graph TD
    subgraph Client["Client (React 19 + Vite)"]
        Pages["Pages: Dashboard / Transpose / Lessons / Practice"]
        MDX["MDX Lesson Content (bundled at build time)"]
        AuthClient["Better Auth Client (session cookies)"]
        APILayer["Typed fetch wrapper + TanStack Query"]
    end

    subgraph Server["Server (Express + TypeScript)"]
        AuthRoute["/api/auth/*"]
        ProtectedRoutes["/api/transpositions, /api/lessons, /api/practice, /api/dashboard"]
        Middleware["requireAuth middleware"]
        PrismaORM["Prisma ORM"]
    end

    subgraph DB["PostgreSQL"]
        Tables["User / Session / Account / TranspositionHistory / LessonProgress / QuizAttempt"]
    end

    Pages --> AuthClient
    Pages --> APILayer
    AuthClient --> AuthRoute
    APILayer --> ProtectedRoutes
    ProtectedRoutes --> Middleware --> PrismaORM --> Tables
    AuthRoute --> PrismaORM
```

---

## Tech Stack

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

---

## Design Decisions

**Session cookies over JWTs**
Better Auth manages sessions in the database, eliminating manual token refresh logic and making session revocation trivial.

**MDX content bundled with the client**
Lesson files live in `client/content/` and are compiled by Vite at build time, keeping the server stateless for content. Adding a new lesson is a file addition rather than a database migration.

**Unique constraint + upsert for transposition history**
Rather than cleaning up old records in application code, a `@@unique([userId, eye])` constraint enforces one record per eye per user at the database level, keeping the history table lean and the logic simple.
