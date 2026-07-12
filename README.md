# Ruth — Document Yourself

Ruth is a full-stack, AI-powered digital diary. You write rough, unfiltered notes;
Ruth turns them into a beautifully written journal entry — without inventing
events, exaggerating, or dropping details you actually wrote. Every page is
private by default; you choose exactly which pages to share, with whom, and
with what permission level, and you can revoke access at any time.

This is a real, runnable monorepo — not a mockup. Every screen is wired to a
real API endpoint and a real Postgres schema. The two things you must supply
yourself are **credentials** (a database, an OpenAI key, a Cloudinary account,
an SMTP sender) and **`npm install`**, since this environment has no network
access to fetch packages. Everything else — auth, journal CRUD, the AI writer,
photo uploads, sharing/permissions, search, calendar, memories, notifications,
settings, data export — is fully implemented.

---

## Tech stack

| Layer      | Choice |
|------------|--------|
| Frontend   | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, React Query, React Hook Form, Zod |
| Backend    | Node.js, Express, TypeScript, Prisma ORM |
| Database   | PostgreSQL |
| Auth       | JWT access tokens + httpOnly refresh-token cookie, bcrypt password hashing |
| Storage    | Cloudinary (image upload, compression, transformation) |
| AI         | OpenAI (chat completions for the writer, embeddings for semantic search) |
| Email      | Nodemailer over SMTP (verification, password reset, share notifications) |

## Project structure

```
ruth/
├── backend/                 Express API (MVC-ish: routes → controllers → services)
│   ├── prisma/schema.prisma Full DB schema (Users, Journals, Photos, Shares, etc.)
│   ├── prisma/seed.ts       Demo user + sample entries
│   └── src/
│       ├── config/          env, db (Prisma client), Cloudinary
│       ├── middleware/      auth, validation, rate limiting, error handling, uploads
│       ├── controllers/     one per resource (auth, journal, photo, share, ai, ...)
│       ├── services/        ai.service.ts (the AI writer), email, cloudinary, tokens
│       ├── routes/          one per resource + index.ts mounting them
│       ├── validators/      Zod request schemas
│       └── utils/           jwt, password hashing, logger, response helpers
├── frontend/                 Next.js App Router app
│   └── src/
│       ├── app/              routes: landing, (auth), (dashboard), shared/[token], ...
│       ├── components/       ui/, illustrations/, journal/, layout/, calendar/, share/
│       ├── hooks/             React Query hooks (useJournals, useAI, useShare)
│       ├── context/           AuthContext (session + silent refresh)
│       └── lib/                axios client with auto token refresh, Zod form schemas
├── shared/types.ts            Wire-format type contracts shared by both sides
├── deployment/                vercel.json (frontend), render.yaml (backend)
└── docker-compose.yml         Local Postgres for development
```

---

## Getting started

### 1. Prerequisites
- Node.js 18+
- A PostgreSQL database — either run `docker compose up -d` for a local one, or use a hosted one (Supabase's Postgres works well and is what the spec targets for production)
- (Optional but recommended) An OpenAI API key — without one, the AI writer falls back to a simple paragraph-formatter and search falls back to keyword-only, so the app still runs end-to-end
- (Optional) A Cloudinary account for photo uploads — without one, photo upload calls will fail; everything else works
- (Optional) SMTP credentials — without them, verification/reset emails are logged to the console instead of sent

### 2. Install dependencies
```bash
cd ruth
npm install --workspaces
```

### 3. Configure environment variables
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```
Fill in `backend/.env` with your database URL, JWT secrets (any long random
string), and whichever of OpenAI/Cloudinary/SMTP you have. `frontend/.env.local`
just needs `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api/v1`).

### 4. Set up the database
```bash
cd backend
npm run prisma:migrate    # creates tables from schema.prisma
npm run seed               # optional: adds a demo user + sample entries
```
Demo login after seeding: `demo@ruth.app` / `Password123!`

### 5. Run it
```bash
# terminal 1
npm run dev:backend        # http://localhost:4000

# terminal 2
npm run dev:frontend       # http://localhost:3000
```

---

## What's fully implemented

- **Auth**: signup, login, email verification, forgot/reset password, JWT access + refresh-cookie sessions, rate-limited auth endpoints, bcrypt hashing
- **Profiles**: display name, bio, profile photo upload, journal/photo/shared counts
- **Journals**: create/edit/delete, autosave, mood/location/weather/tags, favorite + private/shareable toggles, rich text (bold/italic/underline/lists)
- **AI Writer**: all 4 modes (Keep Original, Diary Style, Storytelling, Minimal), enforces "never invent, never exaggerate, never drop details, first person" via the system prompt, returns an optional title/quote/reflection/gratitude, and proposes photo placement across paragraphs
- **Photos**: drag-and-drop multi-upload, Cloudinary compression/transformation, drag-to-reorder, delete
- **Sharing**: share by username, by email, or via a generated private link; five permission levels; owner can revoke anytime; recipients get a notification or email
- **Memories**: automatic "N years ago today" surfacing on the home page
- **Search**: keyword search across title/content/tags, filters by mood/location/date, optional AI semantic ranking (falls back to keyword matching without an OpenAI key)
- **Calendar**: month view with mood indicators, click a day to open that entry
- **Gallery**: grid / timeline / favorites views
- **Notifications**: shared-journal and access-revoked notifications, mark read
- **Settings**: language, reminder toggles, JSON data export, account deletion
- **Security**: Helmet, CORS, rate limiting, Zod validation on every mutating route, parameterized queries via Prisma (no raw SQL injection surface), httpOnly cookies

## What's intentionally scaffolded, not built

The brief itself marks these as forward-looking ("future ready" / "future"),
so they're represented in the schema/UI but not fully implemented:

- **Video upload, voice recording, AI voice narration** — not started
- **Dark mode** — a `darkMode` field already exists on `Settings`; the UI shows it as "Coming soon"
- **Offline mode, PDF export, Year-in-Review / Monthly Insights / Emotion Analytics** — not started

These are natural next milestones once the core product is live and you want
to prioritize them.

## Deployment

- **Frontend → Vercel**: `deployment/vercel.json` is a starting point; connect the `frontend/` directory as the project root and set `NEXT_PUBLIC_API_URL` to your deployed backend URL.
- **Backend → Render**: `deployment/render.yaml` is a blueprint — import it in the Render dashboard and fill in the secrets it lists (`DATABASE_URL`, Cloudinary, OpenAI, SMTP).
- **Database → Supabase Postgres** (or any Postgres): point `DATABASE_URL` at it and run `npm run prisma:deploy` as part of your deploy step (already wired into `render.yaml`'s start command).

## Notes on scope

A handful of pragmatic choices were made to keep this a coherent, working
system rather than an unfinished sprawl:
- Rich text is a lightweight `contentEditable` editor (bold/italic/underline/lists) rather than a heavyweight framework like TipTap — it's real and functional, just intentionally minimal.
- Semantic search computes embeddings on the fly rather than pre-storing them in a vector column; fine at demo scale, worth revisiting (e.g. `pgvector`) before it's handling thousands of entries per user.
- AI photo placement returns paragraph indices rather than physically interleaving `<img>` tags into the HTML — the frontend currently renders photos as a grid below the text; wiring the suggested placement into the rendered content is a small, well-scoped follow-up.
