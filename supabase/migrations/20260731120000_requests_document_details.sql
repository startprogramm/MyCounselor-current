-- Structured detail for transcript/document requests (what document, where
-- it needs to go, by when) so a counselor doesn't have to parse logistics
-- out of a free-text description every time.
alter table public.requests
  add column if not exists document_request_details jsonb;
