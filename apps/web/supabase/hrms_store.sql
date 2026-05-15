-- HRMS operational data (attendance, leave, payroll, roster, etc.)
-- Used by api-gateway on Render with SUPABASE_SERVICE_ROLE_KEY (server-only).
-- Login passwords remain in admin_users / employee_users.

create table if not exists public.hrms_store (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists hrms_store_updated_at_idx on public.hrms_store (updated_at desc);

alter table public.hrms_store enable row level security;

-- No public policies: only service role (api-gateway / scripts) may read/write.

comment on table public.hrms_store is
  'Single-row JSON snapshot of HRMS state (employees, attendance, leave, tasks, payslips, notifications, leads).';
