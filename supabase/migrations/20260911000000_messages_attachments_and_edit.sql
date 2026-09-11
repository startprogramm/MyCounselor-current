-- Add attachments, edit tracking, and soft-delete fields to public.messages
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS edited_at timestamptz DEFAULT null,
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false;
