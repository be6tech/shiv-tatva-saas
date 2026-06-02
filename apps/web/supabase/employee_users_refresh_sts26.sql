-- Optional cleanup before employee_users.sql (that file also deletes STS26% + BE1999%).

delete from public.employee_users
where employee_id like 'BE1999%'
   or employee_id = 'ST-EMP-001'
   or employee_id like 'STS26%';
