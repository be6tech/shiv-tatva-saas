import { PasswordResetOtpForgot } from "@/components/auth/password-reset-otp-forgot";

export default function EmployeeForgotPasswordPage() {
  return (
    <PasswordResetOtpForgot
      portal="employee"
      apiPath="/api/auth/employee/forgot-password"
      backHref="/login/employee"
      resetBasePath="/login/employee/reset"
      identifierLabel="Employee ID or email"
      identifierPlaceholder="Employee ID / Email"
    />
  );
}
