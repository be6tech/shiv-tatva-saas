import { PasswordResetOtpForgot } from "@/components/auth/password-reset-otp-forgot";

export default function AdminForgotPasswordPage() {
  return (
    <PasswordResetOtpForgot
      portal="admin"
      apiPath="/api/auth/admin/forgot-password"
      backHref="/login/admin"
      resetBasePath="/login/admin/reset"
      identifierLabel="Admin email"
      identifierPlaceholder="Admin email"
      identifierType="email"
    />
  );
}
