-- requests_select_school previously allowed any authenticated user in the
-- school to SELECT every request row (school_id match only) — students
-- could read each other's Personal Support disclosures and counselor
-- responses via a direct API call, and parents had no defined access at
-- all (the parent portal only worked because app-level queries happened
-- to filter it). Replaces it with role-scoped access matching the
-- pattern already used by requests_update_scope / requests_delete_scope,
-- and adds an explicit, RLS-enforced parent policy that excludes
-- Personal Support requests — that category exists specifically so a
-- student can raise something they don't want a parent to see.
drop policy if exists requests_select_school on public.requests;
create policy requests_select_scope
on public.requests
for select
to authenticated
using (
  school_id = public.current_user_school_id()
  and (
    (public.current_user_role() = 'student' and student_id = auth.uid())
    or public.current_user_role() = 'counselor'
    or (public.current_user_role() = 'teacher' and teacher_id = auth.uid())
    or (
      public.current_user_role() = 'parent'
      and category <> 'personal'
      and exists (
        select 1
        from public.profiles parent_profile
        join public.profiles student_profile
          on student_profile.id = requests.student_id
         and student_profile.role = 'student'
         and student_profile.school_id = public.current_user_school_id()
        where parent_profile.id = auth.uid()
          and parent_profile.role = 'parent'
          and lower(trim(student_profile.first_name || ' ' || student_profile.last_name)) = any (
            select lower(trim(name))
            from unnest(coalesce(parent_profile.children_names, '{}'::text[])) as name
          )
      )
    )
  )
);
