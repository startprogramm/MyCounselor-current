-- messages_select_school and messages_insert_self only checked that the sender's
-- school matched the reader's school -- not that the reader/sender was actually one
-- of the two participants encoded in conversation_key ("idA__idB", sorted). That let
-- any authenticated user at a school read (and forge messages into) every private
-- conversation at that school, not just their own.

create or replace function public.is_message_conversation_participant(conversation_key text, uid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select uid::text = split_part(conversation_key, '__', 1)
      or uid::text = split_part(conversation_key, '__', 2);
$$;

grant execute on function public.is_message_conversation_participant(text, uuid) to authenticated;

drop policy if exists messages_select_school on public.messages;
create policy messages_select_participant
on public.messages
for select
to authenticated
using (
  public.is_message_conversation_participant(conversation_key, auth.uid())
);

drop policy if exists messages_insert_self on public.messages;
create policy messages_insert_self
on public.messages
for insert
to authenticated
with check (
  sender_id = auth.uid()
  and sender_role = public.current_user_role()
  and public.is_message_conversation_participant(conversation_key, auth.uid())
);
