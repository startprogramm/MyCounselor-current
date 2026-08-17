-- Profile puzzle: persisted essay readiness score, and a narrow,
-- confidentiality-preserving way for a student to see the *status* (not
-- content) of their own recommendation letters.

-- Essay Coach already computes an overallReadinessScore (1-100) per run but
-- never saves it, so the dashboard has nothing stable to read. Cache the
-- latest result on the academic profile row instead of a new table, since
-- it's a 1:1 relationship with student_academic_profiles already.
alter table public.student_academic_profiles
  add column if not exists essay_readiness_score integer,
  add column if not exists essay_readiness_computed_at timestamptz;

-- recommendation_letter_documents is deliberately teacher-only (see
-- 20260805000000_recommendation_letter_documents.sql) -- the letter content
-- is confidential from the applicant. But knowing *whether* a requested
-- recommendation has moved from "drafting" to "final" is not confidential,
-- and a student needs that to see real coverage instead of a guess. This
-- function exposes only request_id + status for the calling student's own
-- recommendation requests, never the letter content itself.
create or replace function public.my_recommendation_letter_statuses()
returns table (request_id bigint, status text)
language sql
security definer
set search_path = public
stable
as $$
  select rld.request_id, rld.status
  from public.recommendation_letter_documents rld
  where rld.student_id = auth.uid();
$$;

grant execute on function public.my_recommendation_letter_statuses() to authenticated;
