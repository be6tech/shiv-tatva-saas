-- Employee portal login (server-only via service role). Run once in Supabase SQL Editor.
-- Default: ST-EMP-001 / demo (change password after first login)

create table if not exists public.employee_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  employee_id text not null unique,
  email text not null unique,
  password_hash text not null,
  reset_token text,
  reset_token_expires_at timestamptz
);

alter table public.employee_users enable row level security;

-- No public policies: only service role (Next.js API routes) may read/write.

insert into public.employee_users (employee_id, email, password_hash)
values (
  'ST-EMP-001',
  'demo.employee@shivtatva.com',
  'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'
)
on conflict (employee_id) do nothing;
