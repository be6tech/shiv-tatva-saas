"""One-off: read EMPLOYEE DETAILS.xlsx from Desktop and print TS employee objects."""
import json
import re
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("pip install openpyxl", file=sys.stderr)
    raise

XLSX = r"c:\Users\durga\OneDrive\Desktop\EMPLOYEE DETAILS.xlsx"


def title_name(s: str) -> str:
    s = (s or "").strip()
    if not s:
        return "Unknown"
    return " ".join(w.capitalize() for w in s.split())


def dept_for(des: str) -> str:
    d = (des or "").strip().upper()
    if "HRM" in d or d == "HR":
        return "HR"
    if "DEVELOPER" in d:
        return "Engineering"
    if "BDE" in d:
        return "Business Development"
    if "TRAINEE" in d:
        return "Learning & Development"
    return "Operations"


def status_for(des: str) -> str:
    d = (des or "").strip().upper()
    if "HRM" in d:
        return "HR Manager"
    if d == "HR":
        return "Active"
    if "TEAM LEAD" in d:
        return "Team Lead"
    if "SENIOR" in d and "DEVELOPER" in d:
        return "Senior Developer"
    if "UI" in d or "UX" in d:
        return "UI/UX Designer"
    return "Active"


def exp_for(des: str) -> int:
    d = (des or "").strip().upper()
    if "TRAINEE" in d:
        return 0
    if "DEVELOPER" in d:
        return 2
    if "BDE" in d:
        return 2
    if "HRM" in d:
        return 8
    if d == "HR":
        return 3
    return 1


def skills_for(des: str) -> list[str]:
    d = (des or "").strip().upper()
    if "DEVELOPER" in d:
        return ["Software development", "Collaboration", "Code quality"]
    if "BDE" in d:
        return ["Business development", "Client outreach", "CRM"]
    if "HRM" in d or d == "HR":
        return ["HR operations", "Talent management", "HRMS"]
    if "TRAINEE" in d:
        return ["On-the-job training", "Fundamentals", "Team collaboration"]
    return ["Professional skills"]


def load_employees() -> list[dict]:
    wb = openpyxl.load_workbook(XLSX, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    out: list[dict] = []
    for row in rows[1:]:
        if not row or all(c is None or str(c).strip() == "" for c in row):
            continue
        rid = str(row[0]).strip()
        name = title_name(str(row[1]))
        des = str(row[2] or "").strip()
        email = str(row[3] or "").strip()
        if not rid or not name:
            continue
        st = status_for(des)
        ex = exp_for(des)
        skills = skills_for(des)
        bio = f"{name} serves as {des} at Shiv Tatva Solutions, contributing to delivery and team growth."
        out.append(
            {
                "id": rid,
                "name": name,
                "designation": des,
                "department": dept_for(des),
                "skills": skills,
                "experienceYears": ex,
                "email": email,
                "status": st,
                "joiningDate": "2024-06-01",
                "bio": bio,
                "projects": [],
                "certifications": [],
            }
        )
    return out


def write_employees_ts(target: Path) -> None:
    out = load_employees()
    header = '''/**
 * Employee directory for marketing `/employee-details`.
 * Rows imported from `EMPLOYEE DETAILS.xlsx` (Employee ID, Name, Designation, Email ID).
 * Re-import: `python scripts/import-employees-xlsx.py write`
 */
export type WorkStatus =
  | "Active"
  | "Team Lead"
  | "Senior Developer"
  | "HR Manager"
  | "UI/UX Designer";

export type Employee = {
  id: string;
  name: string;
  designation: string;
  department: string;
  skills: string[];
  experienceYears: number;
  email: string;
  linkedin?: string;
  status: WorkStatus;
  joiningDate: string; // YYYY-MM-DD
  bio: string;
  projects: string[];
  certifications: string[];
};

export const employees: Employee[] = [
'''
    chunks: list[str] = []
    for e in out:
        chunks.append(
            "  {\n"
            + f'    id: {json.dumps(e["id"])},\n'
            + f'    name: {json.dumps(e["name"])},\n'
            + f'    designation: {json.dumps(e["designation"])},\n'
            + f'    department: {json.dumps(e["department"])},\n'
            + f'    skills: {json.dumps(e["skills"], ensure_ascii=False)},\n'
            + f'    experienceYears: {e["experienceYears"]},\n'
            + f'    email: {json.dumps(e["email"])},\n'
            + f'    status: {json.dumps(e["status"])},\n'
            + f'    joiningDate: {json.dumps(e["joiningDate"])},\n'
            + f'    bio: {json.dumps(e["bio"], ensure_ascii=False)},\n'
            + f'    projects: {json.dumps(e["projects"])},\n'
            + f'    certifications: {json.dumps(e["certifications"])},\n'
            + "  }"
        )
    target.write_text(header + ",\n".join(chunks) + "\n];\n", encoding="utf-8")


def main() -> None:
    if len(sys.argv) > 1 and sys.argv[1] == "write":
        root = Path(__file__).resolve().parents[1]
        write_employees_ts(root / "apps" / "web" / "src" / "data" / "employees.ts")
        print("Wrote apps/web/src/data/employees.ts")
    else:
        print(json.dumps(load_employees(), indent=2))


if __name__ == "__main__":
    main()
