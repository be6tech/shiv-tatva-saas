export type AuthErrorCode =
  | "invalid_credentials"
  | "not_configured"
  | "service_unavailable"
  | "invalid_json"
  | "validation"
  | "server_error";

export function loginErrorMessage(code: string | undefined, portal: "admin" | "employee"): string {
  switch (code) {
    case "invalid_credentials":
      return portal === "admin"
        ? "Invalid email or password."
        : "Invalid employee ID, email, or password.";
    case "not_configured":
      return "Sign-in service is not configured. Contact your administrator.";
    case "service_unavailable":
      return "Sign-in service is temporarily unavailable. Please try again shortly.";
    case "invalid_json":
    case "validation":
      return "Please check your entries and try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
}
