import { PasswordResetOtpReset } from "@/components/auth/password-reset-otp-reset";

export default function EmployeeResetPasswordPage() {
  return (
    <PasswordResetOtpReset
      portal="employee"
      apiPath="/api/auth/employee/reset-password"
      forgotHref="/login/employee/forgot"
      loginHref="/login/employee"
      identifierParam="identifier"
      identifierLabel="Employee ID or email"
      identifierPlaceholder="Employee ID / Email"
    />
  );
}
