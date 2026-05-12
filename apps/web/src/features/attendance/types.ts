export type AttendanceEventType =
  | "CHECK_IN"
  | "LUNCH_IN"
  | "LUNCH_OUT"
  | "BREAK_IN"
  | "BREAK_OUT"
  | "CHECK_OUT";

export type AttendanceStatus =
  | "Working"
  | "On Lunch"
  | "On Break"
  | "Offline"
  | "Checked Out";

export type AttendanceEvent = {
  type: AttendanceEventType;
  at: string; // ISO timestamp
};

export type AttendanceDay = {
  dateKey: string; // YYYY-MM-DD
  employeeId: string;
  employeeName: string;
  department: string;
  events: AttendanceEvent[];
};

