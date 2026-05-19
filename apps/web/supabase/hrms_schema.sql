-- HRMS relational schema (admin + employee portals)
-- Run in Supabase SQL Editor after admin_users.sql and employee_users.sql.
-- api-gateway reads/writes these tables when SUPABASE_* env vars are set.
-- Login credentials stay in admin_users / employee_users.

-- ---------------------------------------------------------------------------
-- Employees (roster) — Admin: Employees | links to employee_users.employee_id
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_employees (
  id text primary key,
  name text not null,
  department text not null default '',
  designation text not null default '',
  status text not null default 'Active',
  email text not null default '',
  phone text not null default '',
  location text not null default '',
  joined_at date,
  skills jsonb not null default '[]'::jsonb,
  experience_years numeric not null default 0,
  shift_id text,
  bio text not null default '',
  linkedin text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hrms_employees_department_idx on public.hrms_employees (department);
create index if not exists hrms_employees_status_idx on public.hrms_employees (status);

-- ---------------------------------------------------------------------------
-- Attendance — Employee: check-in/out, lunch, breaks | Admin: monitor all
-- One row per employee per calendar day; events stored as JSON array.
-- Event types: CHECK_IN, CHECK_OUT, LUNCH_IN, LUNCH_OUT, BREAK_IN, BREAK_OUT
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_attendance (
  date_key text not null,
  employee_id text not null references public.hrms_employees (id) on delete cascade,
  events jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  check_in_at timestamptz,
  check_out_at timestamptz,
  lunch_in_at timestamptz,
  lunch_out_at timestamptz,
  break_in_at timestamptz,
  break_out_at timestamptz,
  check_in_at_local text,
  check_out_at_local text,
  lunch_in_at_local text,
  lunch_out_at_local text,
  break_in_at_local text,
  break_out_at_local text,
  timezone text not null default 'Asia/Kolkata',
  lunch_sessions jsonb not null default '[]'::jsonb,
  break_sessions jsonb not null default '[]'::jsonb,
  net_work_minutes integer not null default 0,
  remaining_work_minutes integer not null default 540,
  work_target_minutes integer not null default 540,
  expected_check_out_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (date_key, employee_id)
);

create index if not exists hrms_attendance_employee_idx on public.hrms_attendance (employee_id);
create index if not exists hrms_attendance_date_idx on public.hrms_attendance (date_key desc);

-- ---------------------------------------------------------------------------
-- Employee shift assignment (per employee)
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_employee_shifts (
  employee_id text primary key references public.hrms_employees (id) on delete cascade,
  shift_id text not null default 'morning',
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Leave requests — Employee: apply | Admin: Leave Management
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_leave_requests (
  id text primary key,
  employee_id text not null references public.hrms_employees (id) on delete cascade,
  employee_name text not null default '',
  department text not null default '',
  type text not null,
  from_date date not null,
  to_date date not null,
  duration_days integer not null default 1,
  reason text not null default '',
  status text not null default 'Pending',
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hrms_leave_requests_employee_idx on public.hrms_leave_requests (employee_id);
create index if not exists hrms_leave_requests_status_idx on public.hrms_leave_requests (status);
create index if not exists hrms_leave_requests_created_idx on public.hrms_leave_requests (created_at desc);

-- ---------------------------------------------------------------------------
-- Tasks — Employee: my tasks | Admin: Tasks
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_tasks (
  id text primary key,
  title text not null,
  description text not null default '',
  assignee_id text not null references public.hrms_employees (id) on delete cascade,
  assignee_name text not null default '',
  department text not null default '',
  priority text not null default 'Medium',
  status text not null default 'Todo',
  due_date date,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hrms_tasks_assignee_idx on public.hrms_tasks (assignee_id);
create index if not exists hrms_tasks_status_idx on public.hrms_tasks (status);

-- ---------------------------------------------------------------------------
-- Payroll / payslips — Employee: Pay Slips | Admin: Payroll
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_payslips (
  id text primary key,
  employee_id text not null references public.hrms_employees (id) on delete cascade,
  employee_name text not null default '',
  department text not null default '',
  designation text not null default '',
  month text not null,
  currency text not null default 'INR',
  basic numeric not null default 0,
  hra numeric not null default 0,
  allowances numeric not null default 0,
  bonus numeric not null default 0,
  pf numeric not null default 0,
  esi numeric not null default 0,
  tds numeric not null default 0,
  other_deductions numeric not null default 0,
  earnings numeric not null default 0,
  deductions numeric not null default 0,
  net_pay numeric not null default 0,
  status text not null default 'Generated',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (employee_id, month)
);

create index if not exists hrms_payslips_month_idx on public.hrms_payslips (month desc);

-- ---------------------------------------------------------------------------
-- Leads — Admin: Leads (HRMS enquiries from gateway / demos)
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_leads (
  id text primary key,
  name text not null,
  email text not null,
  company text not null default '',
  phone text not null default '',
  message text not null default '',
  source text not null default '',
  status text not null default 'New',
  created_at timestamptz not null default now()
);

create index if not exists hrms_leads_created_idx on public.hrms_leads (created_at desc);
create index if not exists hrms_leads_status_idx on public.hrms_leads (status);

-- ---------------------------------------------------------------------------
-- Notifications — Admin + employee in-app alerts
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_notifications (
  id text primary key,
  scope text not null check (scope in ('admin', 'employee')),
  recipient_id text,
  severity text not null default 'info',
  category text not null default 'system',
  title text not null default '',
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists hrms_notifications_scope_idx on public.hrms_notifications (scope, created_at desc);
create index if not exists hrms_notifications_recipient_idx on public.hrms_notifications (recipient_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Org settings — Admin: Settings
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_org_settings (
  id text primary key default 'org',
  settings jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.hrms_org_settings (id, settings)
values (
  'org',
  '{
    "companyName": "Shiv Tatva Solutions Private Limited",
    "supportEmail": "info@shivtatva.tech",
    "supportPhone": "+91 90000 00000",
    "locationText": "Cohort Coworking Space, 1st Floor, Kondapur, Hyderabad",
    "workHoursPerDay": 9,
    "lateThresholdMinutes": 10,
    "anomalySpikeRatio": 0.4
  }'::jsonb
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Attendance anomaly flags (dedupe daily alerts)
-- ---------------------------------------------------------------------------
create table if not exists public.hrms_anomaly_flags (
  flag_key text primary key,
  emitted boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- RLS: service role only (same as admin_users / hrms_store)
-- ---------------------------------------------------------------------------
alter table public.hrms_employees enable row level security;
alter table public.hrms_attendance enable row level security;
alter table public.hrms_employee_shifts enable row level security;
alter table public.hrms_leave_requests enable row level security;
alter table public.hrms_tasks enable row level security;
alter table public.hrms_payslips enable row level security;
alter table public.hrms_leads enable row level security;
alter table public.hrms_notifications enable row level security;
alter table public.hrms_org_settings enable row level security;
alter table public.hrms_anomaly_flags enable row level security;

comment on table public.hrms_employees is 'Employee roster; Admin Employees module.';
comment on table public.hrms_attendance is 'Daily attendance with check-in/out, lunch, and break events.';
comment on table public.hrms_leave_requests is 'Leave applications; Employee apply, Admin approve/reject.';
comment on table public.hrms_tasks is 'Work tasks assigned to employees.';
comment on table public.hrms_payslips is 'Monthly payroll / payslips.';
comment on table public.hrms_leads is 'Sales/demo leads for Admin Leads module.';
