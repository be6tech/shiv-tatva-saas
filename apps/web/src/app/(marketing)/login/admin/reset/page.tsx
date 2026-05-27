import { PasswordResetOtpReset } from "@/components/auth/password-reset-otp-reset";

export default function AdminResetPasswordPage() {
  return (
    <PasswordResetOtpReset
      portal="admin"
      apiPath="/api/auth/admin/reset-password"
      forgotHref="/login/admin/forgot"
      loginHref="/login/admin"
      identifierParam="email"
      identifierLabel="Admin email"
      identifierPlaceholder="Admin email"
      identifierType="email"
    />
  );
}
