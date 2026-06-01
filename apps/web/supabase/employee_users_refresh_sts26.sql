-- Optional: employee_users.sql already deletes legacy rows before insert.
-- Run this only if you need a cleanup without re-running the full insert.

delete from public.employee_users
where employee_id like 'BE1999%'
   or employee_id = 'ST-EMP-001';
