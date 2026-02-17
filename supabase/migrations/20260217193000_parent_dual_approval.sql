alter table public.profiles
  add column if not exists student_confirmed boolean not null default false;

create or replace function public.parent_links_current_student(parent_children_names text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles s
    join unnest(coalesce(parent_children_names, '{}'::text[])) as linked_name on true
    where s.id = auth.uid()
      and s.role = 'student'
      and lower(trim(linked_name)) = lower(trim(s.first_name || ' ' || s.last_name))
  );
$$;

grant execute on function public.parent_links_current_student(text[]) to authenticated;

drop policy if exists profiles_update_self_or_counselor on public.profiles;
create policy profiles_update_self_or_counselor
on public.profiles
for update
to authenticated
using (
  id = auth.uid()
  or (
    public.current_user_role() = 'counselor'
    and school_id = public.current_user_school_id()
  )
  or (
    public.current_user_role() = 'student'
    and role = 'parent'
    and approved = false
    and school_id = public.current_user_school_id()
    and public.parent_links_current_student(children_names)
  )
)
with check (
  id = auth.uid()
  or (
    public.current_user_role() = 'counselor'
    and school_id = public.current_user_school_id()
  )
  or (
    public.current_user_role() = 'student'
    and role = 'parent'
    and approved = false
    and student_confirmed = true
    and school_id = public.current_user_school_id()
    and public.parent_links_current_student(children_names)
  )
);

drop policy if exists profiles_delete_counselor_school on public.profiles;
create policy profiles_delete_counselor_school
on public.profiles
for delete
to authenticated
using (
  (
    public.current_user_role() = 'counselor'
    and school_id = public.current_user_school_id()
  )
  or (
    public.current_user_role() = 'student'
    and role = 'parent'
    and approved = false
    and student_confirmed = false
    and school_id = public.current_user_school_id()
    and public.parent_links_current_student(children_names)
  )
);
