"""
Import Employee_Master_List.xlsx → HRMS employees (attendance directory).

Usage:
  python scripts/import-employee-master-list.py
  python scripts/import-employee-master-list.py "C:\\path\\to\\Employee_Master_List.xlsx"
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:
    print("pip install openpyxl", file=sys.stderr)
    raise

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_XLSX = Path(r"c:\Users\durga\Downloads\Employee_Master_List.xlsx")
SEED_JS = ROOT / "services" / "api-gateway" / "src" / "employees-seed.js"
DB_JSON = ROOT / "services" / "api-gateway" / "data" / "db.json"

ID_PREFIX_RE = re.compile(r"^(STS26[A-Z]{3}\d{3})\b", re.I)
EMAIL_RE = re.compile(r"[\w.+-]+@[\w.-]+\.\w+", re.I)


def title_name(s: str) -> str:
    s = (s or "").strip()
    if not s:
        return "Unknown"
    return " ".join(w.capitalize() if w.islower() else w for w in s.split())


def role_from_id(emp_id: str) -> str:
    m = re.match(r"^STS26([A-Z]{3})\d{3}$", emp_id.upper())
    return m.group(1) if m else "ASE"


def designation_for(emp_id: str, name: str) -> str:
    role = role_from_id(emp_id)
    if role == "HRM":
        return "HRM"
    if role == "BDE":
        return "BDE"
    if role == "BOE":
        return "BACK OFFICE EXECUTIVE"
    if role == "ASE" and emp_id.upper().endswith("001") and name.lower() == "admin":
        return "ADMIN"
    return "ASSOCIATE TRAINEE"


# Excel rows where name/email were pasted into the ID column
ROW_FIXES: dict[str, dict[str, str]] = {
    "STS26ASE019": {"name": "Pushkar", "email": "pushkarsai2288@gmail.com"},
    "STS26ASE020": {"name": "Rambabu"},
    "STS26ASE022": {"name": "J. Prasad"},
}


def dept_for(des: str) -> str:
    d = des.upper()
    if "ADMIN" in d or "HRM" in d or "HR" in d or "BACK OFFICE" in d:
        return "HR"
    if "BDE" in d:
        return "Business Development"
    if "TRAINEE" in d:
        return "Learning & Development"
    return "Engineering"


def status_for(des: str) -> str:
    d = des.upper()
    if "HRM" in d:
        return "HR Manager"
    if "ADMIN" in d:
        return "Active"
    return "Active"


def exp_for(des: str) -> int:
    d = des.upper()
    if "TRAINEE" in d:
        return 0
    if "BDE" in d:
        return 2
    if "HRM" in d:
        return 8
    return 1


def skills_for(des: str) -> list[str]:
    d = des.upper()
    if "ADMIN" in d:
        return ["HR operations", "Talent management", "HRMS"]
    if "BDE" in d:
        return ["Business development", "Client outreach", "CRM"]
    if "HRM" in d or "HR" in d or "BACK OFFICE" in d:
        return ["HR operations", "Talent management", "HRMS"]
    if "TRAINEE" in d:
        return ["On-the-job training", "Fundamentals", "Team collaboration"]
    return ["Software development", "Collaboration", "Code quality"]


def parse_row(row: tuple) -> dict | None:
    if not row or len(row) < 2:
        return None
    raw_id = str(row[1] or "").strip()
    if not raw_id:
        return None

    name = title_name(str(row[2] or "").strip()) if len(row) > 2 and row[2] else ""
    email = str(row[3] or "").strip() if len(row) > 3 and row[3] else ""

    m = ID_PREFIX_RE.match(raw_id)
    emp_id = m.group(1).upper() if m else raw_id.split()[0].upper()
    tail = raw_id[m.end() :].strip() if m else " ".join(raw_id.split()[1:])

    em = EMAIL_RE.search(tail) or EMAIL_RE.search(raw_id)
    if em:
        email = email or em.group(0)
        before = tail[: em.start()].strip()
        if before and not name:
            name = title_name(before)

    if not name and tail and not EMAIL_RE.search(tail):
        name = title_name(tail)

    if emp_id.upper().endswith("001") and not name:
        name = "Admin"

    fixes = ROW_FIXES.get(emp_id, {})
    if fixes.get("name"):
        name = fixes["name"]
    if fixes.get("email"):
        email = fixes["email"]

    if not name or name == "Unknown":
        return None

    des = designation_for(emp_id, name)

    return {
        "id": emp_id,
        "name": name,
        "department": dept_for(des),
        "designation": des,
        "status": status_for(des),
        "email": email,
        "phone": "",
        "location": "Hyderabad",
        "joinedAt": "2024-06-01",
        "skills": skills_for(des),
        "experienceYears": exp_for(des),
    }


def load_from_xlsx(path: Path) -> list[dict]:
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    rows = list(ws.iter_rows(values_only=True))
    wb.close()
    out: list[dict] = []
    seen: set[str] = set()
    for row in rows[1:]:
        emp = parse_row(row)
        if not emp or emp["id"] in seen:
            continue
        seen.add(emp["id"])
        out.append(emp)
    return out


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def write_seed_js(employees: list[dict], target: Path) -> None:
    lines = [
        "/** HRMS employee directory — imported from Employee_Master_List.xlsx */",
        "export const employeesSeed = [",
    ]
    for e in employees:
        lines.append("  {")
        lines.append(f"    id: {js_string(e['id'])},")
        lines.append(f"    name: {js_string(e['name'])},")
        lines.append(f"    department: {js_string(e['department'])},")
        lines.append(f"    designation: {js_string(e['designation'])},")
        lines.append(f"    status: {js_string(e['status'])},")
        lines.append(f"    email: {js_string(e['email'])},")
        lines.append(f"    phone: {js_string(e['phone'])},")
        lines.append(f"    location: {js_string(e['location'])},")
        lines.append(f"    joinedAt: {js_string(e['joinedAt'])},")
        lines.append(f"    skills: {json.dumps(e['skills'], ensure_ascii=False)},")
        lines.append(f"    experienceYears: {e['experienceYears']},")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    lines.append("export const employeeShiftSeed = Object.fromEntries(")
    lines.append("  employeesSeed.map((e) => [e.id, \"morning\"])")
    lines.append(");")
    lines.append("")
    target.write_text("\n".join(lines), encoding="utf-8")


def patch_db_json(employees: list[dict]) -> None:
    data = json.loads(DB_JSON.read_text(encoding="utf-8"))
    data["employees"] = employees
    data["attendance"] = {}
    data["employeeShift"] = {e["id"]: "morning" for e in employees}
    DB_JSON.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main() -> None:
    xlsx = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    if not xlsx.is_file():
        print(f"Missing file: {xlsx}", file=sys.stderr)
        sys.exit(1)

    employees = load_from_xlsx(xlsx)
    if not employees:
        print("No employees parsed.", file=sys.stderr)
        sys.exit(1)

    write_seed_js(employees, SEED_JS)
    patch_db_json(employees)
    print(f"Imported {len(employees)} employees from {xlsx.name}")
    print(f"  -> {SEED_JS.relative_to(ROOT)}")
    print(f"  -> {DB_JSON.relative_to(ROOT)} (attendance cleared)")


if __name__ == "__main__":
    main()
