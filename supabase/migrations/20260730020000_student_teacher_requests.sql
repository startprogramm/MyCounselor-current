-- Allow students to submit a request directly to a specific teacher (e.g. a
-- recommendation letter request), instead of only being able to reach counselors.

alter table public.requests
  add column if not exists teacher_name text;

drop policy if exists requests_insert_scope on public.requests;
create policy requests_insert_scope
on public.requests
for insert
to authenticated
with check (
  school_id = public.current_user_school_id()
  and (
    (
      public.current_user_role() = 'student'
      and student_id = auth.uid()
      and (
        teacher_id is null
        or exists (
          select 1
          from public.profiles t
          where t.id = teacher_id
            and t.role = 'teacher'
            and t.school_id = public.current_user_school_id()
        )
      )
    )
    or public.current_user_role() = 'counselor'
    or (
      public.current_user_role() = 'teacher'
      and teacher_id = auth.uid()
      and exists (
        select 1
        from public.profiles s
        where s.id = student_id
          and s.role = 'student'
          and s.school_id = public.current_user_school_id()
      )
      and (
        counselor_id is null
        or exists (
          select 1
          from public.profiles c
          where c.id = counselor_id
            and c.role = 'counselor'
            and c.school_id = public.current_user_school_id()
        )
      )
    )
  )
);
