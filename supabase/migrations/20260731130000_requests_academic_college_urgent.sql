-- Structured detail for academic support and college planning requests
-- (what kind of help, subject/colleges), plus a general-purpose urgency
-- flag so time-sensitive requests (mainly personal support) can surface
-- ahead of routine ones instead of sitting in create-order.
alter table public.requests
  add column if not exists academic_support_details jsonb,
  add column if not exists college_planning_details jsonb,
  add column if not exists is_urgent boolean not null default false;
