-- Employee portal logins (server-only via service role). Run in Supabase SQL Editor.
-- Initial password for all accounts: demo (change after first login via forgot-password)

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

-- scrypt hash for password: demo
-- f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97

insert into public.employee_users (employee_id, email, password_hash)
values
  ('BE19990002', 'kumarhrmbe6@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990003', 'sakichennakesavulu5@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990005', 'uma@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990006', 'venkatasai@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990012', 'naveench9997@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990013', 'faizanali@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990015', 'pavanihr@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990016', 'boddapatisumasuma@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990017', 'kumarswamy@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990021', 'phaneendra@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990022', 'durgaprasad@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990023', 'raghuramkedasu2002@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990027', 'nagaraju@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990028', 'sreekanthp98614@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990030', 'ndrnimmagadda@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990031', 'lavanyabypureddy61@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('BE19990033', 'dileepkumarg557@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97')
on conflict (employee_id) do update set
  email = excluded.email,
  updated_at = now();
