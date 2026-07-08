# Portfolio x OS

A personal site and private life-OS in one Next.js app: a public portfolio (blog, projects, media) and an authenticated dashboard for day-to-day tracking.

**Public site** → `souranilsen.com`  
**Private OS** → `os.souranilsen.com`

## Overview

| Surface | Routes | Auth |
|---------|--------|------|
| **Public portfolio** | `/`, `/blog`, `/projects`, `/media`, `/contact` | None |
| **Private OS** | `/`, `/journal`, `/gym`, `/study`, `/projects`, `/finance`, `/extracurricular` | Supabase |

Middleware rewrites requests by subdomain:

- `domain.com/*` → `/public/*`
- `os.domain.com/*` → `/os/*`

Unauthenticated users on the OS subdomain are redirected to `/login`.

## OS Modules

- **Dashboard** — tasks, calendar events
- **Journal** — entries and photos
- **Gym** — weekly split, exercise/set logging (kg, reps, RPE), consistency tracker, AI cycle reports via email
- **Study Nexus** — semester tracker + domain workspaces (ML, DSA, Web Dev) with topics, subtopics, and projects
- **Projects** — portfolio project tracker (separate from public MDX projects)
- **Finance** — income/expense entries
- **Extracurricular** — E-Cell / org tracking

## Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS
- **Content:** MDX (`next-mdx-remote`, `gray-matter`) for public blog & projects
- **Backend:** Supabase (Postgres, Auth, RLS)
- **AI / Email:** Google Gemini, Resend (gym cycle reports)

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project

### Install

```bash
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — gym AI features
GEMINI_API_KEY=your_gemini_key
RESEND_API_KEY=your_resend_key

# Optional — contact form recipient
CONTACT_TO_EMAIL=your@email.com
```

### Database

Apply migrations in order from `supabase/migrations/`:

```bash
# Using Supabase CLI, or run each .sql file in the Supabase SQL editor
supabase db push
```

Seed migrations (`008`, `009`) require at least one user in `auth.users`.

### Run locally

```bash
npm run dev
```

| URL | What you get |
|-----|----------------|
| [http://localhost:3000](http://localhost:3000) | Public portfolio (`/public`) |
| [http://os.localhost:3000](http://os.localhost:3000) | Private OS (`/os`) — requires login |

> Add `127.0.0.1 os.localhost` to `/etc/hosts` if `os.localhost` does not resolve.

### Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run start    # start production server
npm run lint     # ESLint
```

## Project Structure

```
src/
├── app/
│   ├── public/          # Portfolio pages (rewritten from root domain)
│   ├── os/              # Private dashboard (rewritten from os. subdomain)
│   ├── api/             # API routes (e.g. gym report)
│   └── login/           # Auth
├── components/          # Shared UI + gym components
├── lib/
│   ├── actions/         # Server actions (Supabase CRUD)
│   └── supabase/        # Supabase clients + middleware helpers
content/
├── blog/                # MDX blog posts
└── projects/            # MDX project case studies
supabase/
└── migrations/          # Database schema + seeds
```

## Deployment

Built for [Vercel](https://vercel.com). Set the same env vars in the project settings.

DNS:

- `souranilsen.com` → Vercel
- `os.souranilsen.com` → Vercel (same project)

Auth cookies are scoped to `os.souranilsen.com` in production.

## License

Private — personal project.
