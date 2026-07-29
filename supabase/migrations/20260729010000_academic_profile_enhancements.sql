-- Professional-grade academic profile enhancements.
--
-- Grade-aware qualification history (Presidential School Gulistan runs a
-- compressed Cambridge Pathway: Grade 9 = IGCSE, Grade 10 = AS Level,
-- Grade 11 = A Level). Each stage is its own JSONB array of
-- { subjectCode, subjectName, grade, status: 'predicted' | 'final' }.
alter table public.student_academic_profiles
  add column if not exists igcse_subjects jsonb default '[]'::jsonb;

alter table public.student_academic_profiles
  add column if not exists as_level_subjects jsonb default '[]'::jsonb;

-- a_level_courses already exists (subject/code only) — this migration doesn't
-- change its column, only how the app populates it (adds grade + status).

-- English proficiency (IELTS / TOEFL / PTE / Duolingo) — required by nearly
-- every English-taught university for international applicants.
alter table public.student_academic_profiles
  add column if not exists english_test_type text;

alter table public.student_academic_profiles
  add column if not exists english_test_score text;

alter table public.student_academic_profiles
  add column if not exists english_test_date text;

-- Target countries/regions, separate from specific target colleges — the
-- application system (US / UK-UCAS / Canada / Europe) shapes what advice
-- and deadlines are even relevant.
alter table public.student_academic_profiles
  add column if not exists target_countries text[] default '{}';

-- Richer per-college application intent (Early Decision / Early Action /
-- Regular / Rolling), replacing the flat target_colleges text list going
-- forward. target_colleges is left in place, unused, rather than dropped.
alter table public.student_academic_profiles
  add column if not exists college_list jsonb default '[]'::jsonb;

-- Personal/holistic context — mirrors the Common App "Additional
-- Information" section and first-generation status, both real factors in
-- holistic review that a transcript alone can't show.
alter table public.student_academic_profiles
  add column if not exists first_generation boolean;

alter table public.student_academic_profiles
  add column if not exists financial_aid_need text;

alter table public.student_academic_profiles
  add column if not exists additional_context text;
