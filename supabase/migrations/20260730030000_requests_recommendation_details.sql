-- Structured "brag sheet" style detail for recommendation-letter requests, so
-- the teacher has what they actually need to write a strong, specific letter
-- (modeled on Common App's teacher brag sheet questionnaire).
alter table public.requests
  add column if not exists recommendation_details jsonb;
