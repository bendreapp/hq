# CLAUDE.md — hq (Admin)

Internal admin dashboard for **Bendre**, a privacy-first practice management SaaS for independent therapists in India. Part of a three-repo project (`peach` frontend, `hill` backend, `hq` admin). See the root `../CLAUDE.md` for the full-project overview.

**Stack:** Next.js 16.2.1 (App Router) · React 19 · Tailwind CSS 4 · Supabase SSR · recharts · lucide-react
**Package name:** `hq` · **GitHub:** bendreapp/hq · **Deploy:** Vercel (hq.bendre.app), branch `main`

## ⚠️ Next.js 16 — read the docs first

This is **NOT the Next.js in your training data** (see `AGENTS.md`). Next.js 16.2.1 has breaking changes to APIs, conventions, and file structure. **Before writing any Next.js code, read the relevant guide in `node_modules/next/dist/docs/`** and heed deprecation notices.

## Quick Start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm build
pnpm start
```

## Structure (`src/`)

```
middleware.ts                        → Supabase auth + ADMIN_EMAILS whitelist check; non-admins → /login
app/
├── layout.tsx                       → Root layout (Geist fonts, globals.css)
├── globals.css                      → Dark theme tokens via @theme inline (Tailwind 4)
├── login/page.tsx                   → Email/password login (Supabase)
├── (admin)/                         → Protected route group
│   ├── layout.tsx                   → Sidebar nav + auth check + badges (e.g. expiring-soon count)
│   ├── page.tsx                     → Dashboard (stats, revenue, charts)
│   ├── therapists/{page,[id]/page,PlanActions}.tsx
│   ├── leads/page.tsx · clients/page.tsx · sessions/page.tsx · waitlist/page.tsx
└── api/admin/therapists/[id]/       → suspend, activate-plan, extend-plan route handlers
lib/
├── queries.ts                       → Centralized data layer (adminFetch<T> + getters/mutations)
└── supabase/{client,server}.ts      → @supabase/ssr browser + server clients
```

UI is co-located with pages (no shared `components/` dir yet) using inline Tailwind + custom color tokens.

## Config

- **next.config.ts** — security headers only (X-Frame-Options DENY, nosniff, HSTS, Referrer-Policy).
- **Tailwind 4** — no `tailwind.config` file; theme defined inline in `globals.css` via `@theme inline`. PostCSS via `@tailwindcss/postcss` (`postcss.config.mjs`).
- **tsconfig.json** — `@/*` → `src/*`, strict mode, `react-jsx`.

## Data flow & auth

- **Auth:** Supabase `signInWithPassword`, then `middleware.ts` gates every route outside `/login` on (a) authenticated Supabase session AND (b) email ∈ `ADMIN_EMAILS` (comma-separated, case-insensitive).
- **Queries do NOT hit Supabase directly.** `lib/queries.ts` proxies through the **hill backend** admin endpoints (`/api/v1/admin/*`) at `API_URL`, passing the Supabase access token as `Authorization: Bearer …`. `adminFetch<T>(path, params)` wraps auth + errors.
  - GETs: `getPlatformStats`, `getTherapists`, `getTherapistDetail`, `getLeads`, `getWaitlist`, `getRecentSessions`, `getClientStats`, `getRevenueStats`.
  - Mutations: `activatePlan`, `suspendPlan`, `extendPlan` (also exposed as `api/admin/therapists/[id]/*` route handlers).

## Conventions

- **Dark theme only.** Color tokens in `globals.css`: `--color-bg #0B0F0E`, `--color-surface #131917`, `--color-border #1E2724`, `--color-ink #E8ECE9`, sage accent `--color-sage #6B7E6C`, plus success/warning/error/info. Use tokens (`bg-surface`, `text-ink`, `bg-sage-bg text-sage`) — don't hardcode hex.
- **Icons:** lucide-react. **Charts:** recharts. **Font:** Geist.
- Stat cards, status badges (plan active/pending/suspended/expired), filterable tables, sidebar with alert badges.
- **All dates/times are IST** (Asia/Kolkata).

## Environment (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY            # server-only, optional
API_URL=http://localhost:8095        # or https://hill-goeg.onrender.com
ADMIN_EMAILS=bendrehq@gmail.com,hariprasad.nm@gmail.com
```

## Rules

- **Read `node_modules/next/dist/docs/` before writing Next.js code** (Next 16 breaking changes).
- **Never take shortcuts** — proper implementation, clean architecture. No hacks.
- **Read before writing** — understand existing patterns first.
- **No placeholder/half-broken implementations** — document and skip instead.
