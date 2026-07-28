-- Student Academic Profiles
-- Stores rich admissions-relevant data for each student.
-- Used by AI Essay Coach and AI Chance Estimator.

create table if not exists public.student_academic_profiles (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  school_id text not null,

  -- Academic Performance
  gpa_weighted numeric(4,2),
  gpa_unweighted numeric(4,2),
  class_rank integer,
  class_size integer,

  -- Standardized Tests
  sat_total integer,
  sat_math integer,
  sat_ebrw integer,
  act_composite integer,
  ap_courses_taken text[] default '{}',

  -- Intended Direction
  intended_major text,
  career_interests text[] default '{}',
  preferred_college_type text,

  -- Lists stored as JSONB for flexibility
  extracurriculars jsonb default '[]'::jsonb,
  honors_awards jsonb default '[]'::jsonb,
  target_colleges text[] default '{}',

  -- Personal Statement (used by AI Essay Coach)
  personal_statement text,

  -- Profile completion tracking (0–100)
  completion_pct integer not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- One profile per student
  unique (student_id)
);

-- Indexes
create index if not exists student_academic_profiles_student_id_idx
  on public.student_academic_profiles(student_id);

create index if not exists student_academic_profiles_school_id_idx
  on public.student_academic_profiles(school_id);

-- Auto-update updated_at on row change
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists student_academic_profiles_updated_at on public.student_academic_profiles;
create trigger student_academic_profiles_updated_at
  before update on public.student_academic_profiles
  for each row execute function public.touch_updated_at();

-- Row Level Security
alter table public.student_academic_profiles enable row level security;

-- Students can read/write their own profile
create policy "Students manage own academic profile"
  on public.student_academic_profiles
  for all
  using (
    auth.uid() = student_id
  )
  with check (
    auth.uid() = student_id
  );

-- Counselors at the same school can read any student profile
create policy "Counselors read school academic profiles"
  on public.student_academic_profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'counselor'
        and profiles.school_id = student_academic_profiles.school_id
        and profiles.approved = true
    )
  );

-- Teachers at the same school can read student profiles
create policy "Teachers read school academic profiles"
  on public.student_academic_profiles
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'teacher'
        and profiles.school_id = student_academic_profiles.school_id
        and profiles.approved = true
    )
  );
