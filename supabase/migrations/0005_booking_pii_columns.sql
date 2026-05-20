-- HeyHeyDive — booking PII columns
-- Adds personal-info fields needed for dive trip insurance and on-board manifests:
--   • national_id           identity / passport number (admin-only)
--   • emergency_contact_*   contact for incidents at sea
--   • dive_cert_*           certification level + serial, drives which trips a diver can join
--   • companions            free-form names for additional people in a party booking
--
-- Existing RLS on bookings already restricts all reads to is_admin(); the new
-- columns inherit that protection automatically. The UI masks national_id by
-- default; admins click "顯示全號" to reveal.

alter table public.bookings add column if not exists national_id text;
alter table public.bookings add column if not exists emergency_contact_name text;
alter table public.bookings add column if not exists emergency_contact_phone text;
alter table public.bookings add column if not exists dive_cert_level text;
alter table public.bookings add column if not exists dive_cert_number text;
alter table public.bookings add column if not exists companions text[];
