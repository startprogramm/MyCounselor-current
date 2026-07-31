# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```
npm run dev          # start dev server on port 4028 (not 3000)
npm run build         # production build
npm run lint          # next lint
npm run lint:fix       # next lint --fix
npm run format         # prettier --write "src/**/*.{ts,tsx,css,md,json}"
npm run type-check      # tsc --noEmit
npm run bulk:create-students  # scripts/bulk-create-students.mjs — bulk-creates student accounts, reads .env
```

There is no test suite in this repo (no test runner configured, no `test` script) — don't assume Jest/Vitest exist.

`npm run build` compiles with `Skipping validation of types` / `Skipping linting` in production builds — always run `type-check` and `lint` separately before relying on `build` to catch errors.

## Architecture

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind, backed directly by Supabase (Postgres + Auth + Row Level Security). There is no ORM or server-side data layer beyond a handful of Next.js API routes — pages call `supabase-js` directly from client components.

### Multi-role structure

Four roles — `student`, `counselor`, `teacher`, `parent` — each with their own route tree (`src/app/{role}/`), own `layout.tsx` (auth guard + sidebar nav + badge-count polling), and own dashboard. `src/lib/role-routes.ts` centralizes the dashboard/messages route lookup per role — use it instead of hardcoding `/​{role}/dashboard` paths. Everything is scoped by `school_id` (multi-tenant), enforced via RLS, not just app-level filtering.

Counselors approve new accounts (first counselor at a school auto-approves). Parents link to a student by matching `children_names` against the student's full name, and require a two-step handshake: parent registers → student confirms (`student_confirmed`) → counselor approves. This is enforced in Postgres via `parent_links_current_student()` and RLS policies, not just UI logic — see `supabase/migrations/20260217193000_parent_dual_approval.sql`.

### Auth pattern

`src/context/AuthContext.tsx` hydrates the user's profile from `localStorage` synchronously on mount (so `user.id` is available on first paint), then verifies the Supabase session in the background and refreshes from the `profiles` table. Most data-fetching pages mirror this same three-step pattern: read `localStorage` cache (`src/lib/client-cache.ts`, keyed per-user via `makeUserCacheKey`) → paint instantly → fetch from Supabase → `startVisibilityAwarePolling` (`src/lib/polling.ts`, pauses when the tab is hidden) instead of Supabase Realtime subscriptions. When adding a new data-driven page, follow this existing pattern rather than introducing a new one.

### Database & migrations

Schema lives in `supabase/migrations/*.sql`, applied in filename (timestamp) order. **Creating a migration file does not apply it** — this repo has no linked Supabase CLI project by default (no `supabase/config.toml`), so migrations must be manually run in the Supabase SQL Editor or applied via an explicitly-linked CLI/MCP connection. `supabase-schema.sql` at the repo root is a legacy "paste this into the SQL Editor" convenience snapshot — it has historically fallen out of sync with the real migrations directory, so don't treat it as authoritative; check `supabase/migrations/` instead.

RLS is the real enforcement layer for every table. Policies lean on security-definer helper functions — `current_user_role()`, `current_user_school_id()`, `parent_links_current_student()` — rather than repeating role/school checks inline. `src/lib/database.types.ts` is a hand-maintained mirror of the schema (not auto-generated) — update it whenever a migration changes table shape.

`PLAN.md` is a historical, already-completed migration plan (localStorage → Supabase). It documents past work, not an active roadmap.

### Requests / attachments gotcha

The `requests` table has a `documents` JSONB column used for counselor-to-student file attachments (`src/app/counselor/tasks/page.tsx`). Files are read client-side as base64 data URLs and stored **inline in that column** — there is no Supabase Storage bucket for attachments. Uploads are capped client-side (2MB/file, 6 files/request in `counselor/tasks/page.tsx`), but that still allows a several-MB JSON payload per row. Most list/dashboard views across roles now explicitly `select()` only the columns they render (excluding `documents`) to avoid re-downloading attachment blobs on every poll — `student/requests/page.tsx` and `counselor/tasks/page.tsx` are the two exceptions, since they render attachments inline and genuinely need that column. Keep this in mind before adding `select('*')` on `requests` anywhere.

### AI features

Three Next.js API routes under `src/app/api/` all call **Gemini** (`gemini-3.6-flash`, see `GEMINI_MODEL` in `src/lib/gemini.ts`) via the `@google/genai` SDK — no other model/provider is used anywhere in the app:
- `ai-counselor` — streaming chat completion (general counselor-persona assistant)
- `ai-essay-coach` — single completion, returns structured JSON feedback on a student's essay (enforced via `responseSchema`, not regex-extracted from prose)
- `ai-chance-estimator` — single completion, returns structured JSON admissions-chance analysis using the student's `student_academic_profiles` row (also via `responseSchema`)

All three return a 503 if `GEMINI_API_KEY` is unset (checked via `getGeminiClient()` in `src/lib/gemini.ts`). None of them implement rate limiting, retry/backoff, or per-user throttling — a request storm hits Gemini's account-level rate limits directly with a generic error surfaced to the user.

All three routes pull real student data server-side via `getStudentSnapshot()` (`src/lib/student-context.ts`) — given a `studentId`, it fetches the student's `profiles` row, `student_academic_profiles` row, and active (incomplete) `goals`, using the shared `getSupabaseAdmin()` helper (`src/lib/supabase-admin.ts`, service-role client). Routes look the student up server-side by ID rather than trusting a client-supplied profile blob, so the AI always reasons over current data and a tampered request body can't feed it fake academic stats. Follow this same service-role pattern (`getSupabaseAdmin()`) for any future server-side route that needs to bypass RLS.

### Environment variables

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`. No `.env`/`.env.local` is committed (gitignored) — these are configured directly in the Vercel project's environment variables.

### Orphaned prototype routes — and one that isn't

`next.config.mjs` has `redirects()`: `/` → `/homepage` (permanent: false). That means **`src/app/homepage/` is the real, live marketing homepage** — the one built at the actual root, `src/app/page.tsx`, is unreachable (any visit to `/` redirects away before it ever renders). Check `next.config.mjs` for redirects before judging a route reachable/unreachable — a plain `href` grep across components misses framework-level redirects like this one.

`student-portal-dashboard/`, `counselor-command-center/`, `appointment-scheduling-system/`, `resource-discovery-center/`, and `secure-communication-hub/` genuinely are dead — no `href` references anywhere outside their own subtrees, and no redirect rule points at them either. They look like the original scaffolded/generated demo pages (this project uses `@dhiwise/component-tagger`) that were superseded by the hand-built, Supabase-backed pages under `src/app/{role}/`, but were never deleted. Don't assume these are live or spend time keeping them in sync with schema/behavior changes — but do verify reachability (component `href`s *and* `next.config.mjs` redirects) before calling any page dead.

### Deployment

Hosted on Vercel, project name **`mycounselor`**, production domain **`www.mycounselor.uz`**. There are other similarly-named Vercel projects under the same account (`my_counselor`, `my-counselor`) that are stale/duplicate — `mycounselor` (with the custom domain) is the one actually in use. There is no git-integration auto-deploy configured; deploys are manual (`vercel deploy --prod` or via the dashboard).
