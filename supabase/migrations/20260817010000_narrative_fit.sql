-- Caches the AI narrative-fit read (throughline + per-piece verdicts) so
-- the dashboard has something stable to render without re-running Gemini
-- on every load. Recomputed only when the student explicitly asks for it.
alter table public.student_academic_profiles
  add column if not exists narrative_fit jsonb;
