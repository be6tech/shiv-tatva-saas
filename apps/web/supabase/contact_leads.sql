-- Run in Supabase → SQL Editor (once) to store marketing contact form rows.
-- Table: public.contact_leads

create table if not exists public.contact_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  phone text,
  message text not null,
  source text not null default 'contact',
  lead_id text
);

alter table public.contact_leads enable row level security;

-- Allow inserts from the browser using the publishable (anon) API key.
drop policy if exists "Allow anonymous inserts" on public.contact_leads;
create policy "Allow anonymous inserts"
  on public.contact_leads
  for insert
  to anon
  with check (true);

grant usage on schema public to anon;
grant insert on table public.contact_leads to anon;
