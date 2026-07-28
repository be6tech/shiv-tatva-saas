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

-- Re-import safe: remove legacy + previous STS26 rows, then upsert roster
delete from public.employee_users
where employee_id like 'BE1999%'
   or employee_id = 'ST-EMP-001'
   or employee_id like 'STS26%';

insert into public.employee_users (employee_id, email, password_hash)
values
  ('STS26HRM002', 'mighttians97@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE003', 'sakichennakesavulu5@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE004', 'karedlaprasad13@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE005', 'mareedukumarswamy@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE006', 'ndrnimmagadda@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE007', 'raghuramkedasu2002@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26BDE008', 'naveench9997@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26BDE009', 'sreekanthp98614@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26BDE010', 'boddapatisumasuma@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26BDE011', 'lavanyabypureddy61@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE012', 'sunilkumarmelapu418@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE013', 'bhaskark874@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE014', 'dileepkumarg557@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE015', 'phaneendra@be6technologies.in', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26BOE016', 'pallavigandrothu007@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE017', 'eluriprasanthi2016@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE018', 'ayyappareddychalla7@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE019', 'pushkarpushkarsai2288@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE020', 'rambabugorli1@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26BDE021', 'gowrisudabattula836@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE022', 'varaprasadjujjuri@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26ASE025', 'sivanaiduganta@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97'),
  ('STS26BDE028', 'soumyagoud600@gmail.com', 'f4298c5a7302c99350dec80533fbbc33:d188636c159647671ad1a90842ab9b2400feb8591f2dfe4e33ae83407ced02b8c11edfa847f7526d3128cc119e745d42351248104d8beb7aea4e0d0952b1cf97')
on conflict (employee_id) do update set
  email = excluded.email,
  password_hash = excluded.password_hash,
  updated_at = now();
