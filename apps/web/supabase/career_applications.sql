-- Run in Supabase → SQL Editor (once) for marketing /careers applications.
-- Separate from public.contact_leads (contact / demo form).

create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text,
  role text not null,
  portfolio text,
  message text not null,
  application_id text
);

alter table public.career_applications enable row level security;

drop policy if exists "Allow anonymous career inserts" on public.career_applications;
create policy "Allow anonymous career inserts"
  on public.career_applications
  for insert
  to anon
  with check (true);

grant usage on schema public to anon;
grant insert on table public.career_applications to anon;
