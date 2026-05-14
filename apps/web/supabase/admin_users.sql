-- Admin login credentials (server-only via service role). Run once in Supabase SQL Editor.
-- Default admin: admin@shivtatva.com / @Shivtatva123 (change password after first login)

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  email text not null unique,
  password_hash text not null,
  reset_token text,
  reset_token_expires_at timestamptz
);

alter table public.admin_users enable row level security;

-- No public policies: only service role (Next.js API routes) may read/write.

insert into public.admin_users (email, password_hash)
values (
  'admin@shivtatva.com',
  'f4298c5a7302c99350dec80533fbbc33:4203c7fd62d2a7c4099fac45933be7f3fe6ce6e24d985d965abc6454a9fabadb58a00d6247b3d5830f0aa8cd2609e2c994a4e581d23384ea98dd173e729b2ddd'
)
on conflict (email) do nothing;
