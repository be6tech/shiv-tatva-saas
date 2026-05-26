-- New-hire onboarding submissions from /login?tab=onboarding
-- Run in Supabase SQL Editor (re-run safe: uses IF NOT EXISTS / additive alters)

create table if not exists public.hrms_onboarding_submissions (
  id text primary key,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  personal jsonb not null default '{}'::jsonb,
  files jsonb not null default '{}'::jsonb,
  status text not null default 'submitted',
  created_at timestamptz not null default now()
);

create index if not exists hrms_onboarding_submissions_email_idx
  on public.hrms_onboarding_submissions (email);

create index if not exists hrms_onboarding_submissions_created_idx
  on public.hrms_onboarding_submissions (created_at desc);

-- Legacy table (older builds) — optional drop after migrating data
-- drop table if exists public.hrms_onboarding_documents;
