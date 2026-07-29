-- A Level / AS Level courses for the Cambridge International curriculum.
-- Stored separately from ap_courses_taken (US AP/IB), which stays optional
-- for schools that use that system instead.

alter table public.student_academic_profiles
  add column if not exists a_level_courses jsonb default '[]'::jsonb;
