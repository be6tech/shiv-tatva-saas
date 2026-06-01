-- Remove legacy BE1999… roster from Live Status / Admin HRMS (Supabase tables).
-- Cascades: attendance, shifts, leave, tasks, payslips for those employee_ids.
-- Then run: node services/api-gateway/scripts/seed-hrms-tables.mjs

delete from public.hrms_employees
where id like 'BE1999%'
   or id = 'ST-EMP-001';
