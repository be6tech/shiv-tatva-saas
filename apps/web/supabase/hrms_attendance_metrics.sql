-- Run after hrms_schema.sql — stores check-in time and remaining net work on each row.

alter table public.hrms_attendance
  add column if not exists check_in_at timestamptz,
  add column if not exists check_out_at timestamptz,
  add column if not exists lunch_in_at timestamptz,
  add column if not exists lunch_out_at timestamptz,
  add column if not exists break_in_at timestamptz,
  add column if not exists break_out_at timestamptz,
  add column if not exists lunch_sessions jsonb not null default '[]'::jsonb,
  add column if not exists break_sessions jsonb not null default '[]'::jsonb,
  add column if not exists net_work_minutes integer not null default 0,
  add column if not exists remaining_work_minutes integer not null default 540,
  add column if not exists work_target_minutes integer not null default 540,
  add column if not exists expected_check_out_at timestamptz;

comment on column public.hrms_attendance.check_in_at is 'First CHECK_IN time for the day';
comment on column public.hrms_attendance.lunch_in_at is 'First LUNCH_IN time';
comment on column public.hrms_attendance.lunch_out_at is 'First LUNCH_OUT time';
comment on column public.hrms_attendance.break_in_at is 'First BREAK_IN time';
comment on column public.hrms_attendance.break_out_at is 'First BREAK_OUT time';
comment on column public.hrms_attendance.remaining_work_minutes is 'Minutes of net work left to reach daily target (default 9h)';
