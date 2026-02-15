# Supabase Migration Plan

## Prerequisites (User Action Required)
1. Create a Supabase project at https://supabase.com
2. Get the project URL and anon key from Settings > API
3. Provide these to me so I can set up `.env.local`

## Phase 0: Infrastructure Setup
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create `.env.local` with Supabase credentials
- Create `src/lib/supabase.ts` (browser client)
- Create `src/types/supabase.ts` (type definitions)

## Phase 1: Database Schema (run SQL in Supabase dashboard)
Create tables:
- `schools` — replaces hardcoded `src/data/schools.ts`
- `profiles` — replaces `mycounselor_registered_users` (linked to Supabase Auth)
- `parent_children` — junction table for parent-child links
- `counseling_requests` — replaces `mycounselor_student_requests`
- `request_documents` — file attachments (Supabase Storage)
- `meetings` — replaces `mycounselor_student_meetings`
- `conversations` + `messages` — replaces `mycounselor_student_messages_${userId}`
- `goals` — replaces `mycounselor_student_goals`
- `guidance_resources` — replaces `mycounselor_counselor_resources`

Plus: RLS policies, indexes, triggers, storage buckets

## Phase 2: Auth Rewrite (~1 file, critical)
- Rewrite `src/context/AuthContext.tsx`:
  - `signIn()` → `supabase.auth.signInWithPassword()`
  - `register()` → `supabase.auth.signUp()` + insert profile
  - `logout()` → `supabase.auth.signOut()`
  - All user queries → Supabase `profiles` table
  - Methods become async (return Promises)

## Phase 3: Auth Pages (~5 files)
- Update login page to use real password auth
- Update all signup pages (student, counselor, teacher, parent)
- Handle Supabase auth errors properly

## Phase 4: Layouts + Sidebar (~3 files)
- Student layout: badge counts via Supabase queries
- Counselor layout: badge counts via Supabase queries
- Sidebar: profile image upload → Supabase Storage

## Phase 5: Data Pages (~12 files)
Replace all localStorage reads/writes with Supabase queries:
- Student: dashboard, requests, messages, meetings, guidance
- Counselor: dashboard, students, tasks, meetings, messages, guidance
- Messages: replace 3-second polling with Supabase Realtime subscriptions

## Phase 6: Cleanup
- Remove all localStorage references
- Seed schools table from existing data
- Verify build passes

## Files That Need NO Changes
- All UI components (Badge, Button, Card, Input, etc.)
- Homepage and marketing pages
- Tools pages (AI counselor, major finder)
- Teacher/parent dashboards (mock data, future work)

## Total Scope
- ~4 new files
- ~21 files modified
- 0 UI/UX changes (data layer only)
