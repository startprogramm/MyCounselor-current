-- Let students direct a recommendation-letter request straight at their
-- counselor (not just a teacher). Also validates counselor_id the same way
-- teacher_id is already validated for students, so a student can't set an
-- arbitrary/cross-school counselor_id on insert.

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
