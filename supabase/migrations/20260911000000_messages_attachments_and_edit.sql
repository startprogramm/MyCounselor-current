-- Add attachments, edit tracking, and soft-delete fields to public.messages
-- Run this in the Supabase SQL Editor ONCE. It is fully safe and idempotent.

ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS attachments  jsonb        DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS is_edited    boolean      DEFAULT false,
  ADD COLUMN IF NOT EXISTS edited_at    timestamptz  DEFAULT null,
  ADD COLUMN IF NOT EXISTS is_deleted   boolean      DEFAULT false;

-- Ensure the delete policy exists and scopes to sender
-- (messages_delete_sender was already created in initial_schema, this is idempotent)
DROP POLICY IF EXISTS messages_delete_sender ON public.messages;
CREATE POLICY messages_delete_sender
ON public.messages
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Ensure the update policy allows editing and soft-deleting own messages
DROP POLICY IF EXISTS messages_update_sender ON public.messages;
CREATE POLICY messages_update_sender
ON public.messages
FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());
