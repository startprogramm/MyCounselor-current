-- Extends the recommendation-letter workspace (20260805000000) to a second
-- author role: a student can route a recommendation request to a counselor
-- instead of a teacher (see newRecipientType in student/requests/page.tsx),
-- but until now only teachers got the drafting workspace -- counselors fell
-- back to the plain response textarea. Same confidentiality posture as the
-- teacher-only policy: still no student/parent branch.

alter table public.recommendation_letter_documents
  alter column teacher_id drop not null;

alter table public.recommendation_letter_documents
  add column if not exists counselor_id uuid references public.profiles(id) on delete cascade;

alter table public.recommendation_letter_documents
  drop constraint if exists recommendation_letter_documents_author_check;
alter table public.recommendation_letter_documents
  add constraint recommendation_letter_documents_author_check
  check (num_nonnulls(teacher_id, counselor_id) = 1);

create index if not exists idx_recommendation_letter_documents_counselor
  on public.recommendation_letter_documents (school_id, counselor_id);

drop policy if exists recommendation_letter_documents_counselor_only on public.recommendation_letter_documents;
create policy recommendation_letter_documents_counselor_only
on public.recommendation_letter_documents
for all
to authenticated
using (
  school_id = public.current_user_school_id()
  and public.current_user_role() = 'counselor'
  and counselor_id = auth.uid()
)
with check (
  school_id = public.current_user_school_id()
  and public.current_user_role() = 'counselor'
  and counselor_id = auth.uid()
);
