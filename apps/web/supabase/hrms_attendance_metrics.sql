-- Run after hrms_schema.sql — stores check-in time and remaining net work on each row.

alter table public.hrms_attendance
  add column if not exists check_in_at timestamptz,
  add column if not exists check_out_at timestamptz,
  add column if not exists net_work_minutes integer not null default 0,
  add column if not exists remaining_work_minutes integer not null default 540,
  add column if not exists work_target_minutes integer not null default 540,
  add column if not exists expected_check_out_at timestamptz;

comment on column public.hrms_attendance.check_in_at is 'First CHECK_IN time for the day';
comment on column public.hrms_attendance.remaining_work_minutes is 'Minutes of net work left to reach daily target (default 9h)';
