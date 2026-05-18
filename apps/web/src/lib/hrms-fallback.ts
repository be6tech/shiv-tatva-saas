import "server-only";
import { employees } from "@/data/employees";
import type { SessionUser } from "@/lib/session-jwt";

const MORNING_SHIFT = {
  id: "morning",
  name: "Morning Shift",
  start: "09:30",
  end: "18:30",
};

function findDirectoryEmployee(identifier: string) {
  const value = identifier.trim();
  return (
    employees.find(
      (e) =>
        e.id.toUpperCase() === value.toUpperCase() ||
        e.email.toLowerCase() === value.toLowerCase()
    ) ?? null
  );
}

function toGatewayEmployee(emp: (typeof employees)[number]) {
  return {
    id: emp.id,
    name: emp.name,
    department: emp.department,
    designation: emp.designation,
    status: emp.status,
    email: emp.email,
    phone: "",
    location: "Hyderabad",
    linkedin: emp.linkedin ?? "",
    joinedAt: emp.joiningDate,
    skills: emp.skills,
    experienceYears: emp.experienceYears,
  };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Serves read-only HRMS data on Vercel when api-gateway is not deployed yet. */
export function hrmsFallbackResponse(
  method: string,
  path: string,
  search: string,
  session: SessionUser
): Response | null {
  const parts = path.split("/").filter(Boolean);
  const root = parts[0];

  if (method === "GET" && root === "employee" && parts[1] === "me") {
    const emp = findDirectoryEmployee(session.sub);
    return json({
      me: { sub: session.sub, role: session.role, org: "Shiv Tatva Solutions Private Limited" },
      employee: emp ? toGatewayEmployee(emp) : null,
    });
  }

  if (method === "GET" && root === "employee" && parts[1] === "profile") {
    const emp = findDirectoryEmployee(session.sub);
    if (!emp) return json({ error: "employee_not_found" }, 404);
    return json({ employee: toGatewayEmployee(emp) });
  }

  if (method === "GET" && root === "admin" && parts[1] === "employees" && parts.length === 2) {
    if (session.role !== "admin") return json({ error: "forbidden" }, 403);
    return json({ employees: employees.map(toGatewayEmployee) });
  }

  if (method === "GET" && root === "attendance" && parts[1] === "today") {
    const emp = findDirectoryEmployee(session.sub);
    const dateKey = new Date().toISOString().slice(0, 10);
    return json({
      day: emp
        ? {
            dateKey,
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            events: [],
          }
        : null,
      shift: MORNING_SHIFT,
      allowed: ["CHECK_IN"],
      status: "Not checked in",
      fallback: true,
    });
  }

  if (method === "GET" && root === "notifications") {
    return json({ items: [] });
  }

  if (method === "GET" && root === "employee") {
    if (parts[1] === "leave" && parts[2] === "mine") return json({ requests: [] });
    if (parts[1] === "tasks" && parts[2] === "mine") return json({ tasks: [] });
    if (parts[1] === "payslips" && parts[2] === "mine") return json({ payslips: [] });
  }

  if (method === "POST" && root === "ai" && parts[1] === "insights") {
    return json({
      ok: true,
      sample_size: 50,
      insights: [
        "Break durations trending higher after 3 PM — suggest smart reminders.",
        "Late arrival spike on Mondays — consider flexible shift policy.",
        "High productivity cluster in Engineering — replicate workflow templates.",
      ],
      fallback: true,
    });
  }

  if (method === "GET" && root === "admin") {
    if (parts[1] === "attendance" && parts[2] === "metrics") {
      return json({ late: 0, overtime: 0, online: 0, total: employees.length });
    }
    if (parts[1] === "leave" && parts[2] === "requests") return json({ requests: [] });
    if (parts[1] === "tasks") return json({ tasks: [] });
    if (parts[1] === "payslips") return json({ payslips: [] });
    if (parts[1] === "leads") return json({ leads: [] });
    if (parts[1] === "live-status") {
      return json({
        rows: employees.map((e) => ({
          employeeId: e.id,
          employeeName: e.name,
          department: e.department,
          status: "Offline",
          lastAt: null,
          shift: MORNING_SHIFT,
        })),
      });
    }
  }

  if (method !== "GET" && method !== "HEAD") {
    return json(
      {
        error: "gateway_required",
        hint:
          "HRMS writes need the api-gateway. On Vercel set API_GATEWAY_URL=https://shivtatva-api-gateway.onrender.com and JWT_SECRET (same as Render), then redeploy.",
      },
      503
    );
  }

  return null;
}
