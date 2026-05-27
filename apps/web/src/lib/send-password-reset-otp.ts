import "server-only";

export type SendOtpResult = {
  sent: boolean;
  channel?: "resend" | "google";
  devOtp?: string;
  error?: string;
};

function otpEmailContent(otp: string, portal: "admin" | "employee") {
  const subject =
    portal === "admin"
      ? "Shiv Tatva Admin — password reset code"
      : "Shiv Tatva Employee Portal — password reset code";

  const text = [
    `Your one-time password reset code is: ${otp}`,
    "",
    "This code expires in 10 minutes.",
    "If you did not request this, ignore this email.",
    "",
    "— Shiv Tatva Solutions",
  ].join("\n");

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:480px;line-height:1.5">
      <p>Your one-time password reset code is:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0">${otp}</p>
      <p style="color:#555;font-size:14px">This code expires in <strong>10 minutes</strong>.</p>
      <p style="color:#555;font-size:14px">If you did not request this, ignore this email.</p>
      <p style="margin-top:24px;font-size:13px">— Shiv Tatva Solutions</p>
    </div>
  `.trim();

  return { subject, text, html };
}

async function sendViaResend(
  to: string,
  otp: string,
  portal: "admin" | "employee"
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return { ok: false, error: "resend_not_configured" };

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    process.env.PASSWORD_RESET_FROM_EMAIL?.trim();
  if (!from) {
    return { ok: false, error: "resend_from_missing" };
  }

  const { subject, text, html } = otpEmailContent(otp, portal);

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
    });
    if (res.ok) return { ok: true };
    const detail = await res.text().catch(() => "");
    return { ok: false, error: `resend_${res.status}:${detail.slice(0, 200)}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "resend_network" };
  }
}

async function sendViaGoogleWebapp(
  to: string,
  otp: string,
  portal: "admin" | "employee"
): Promise<{ ok: boolean; error?: string }> {
  const webapp = process.env.GOOGLE_PASSWORD_RESET_OTP_WEBAPP_URL?.trim();
  if (!webapp) return { ok: false, error: "google_not_configured" };

  try {
    const res = await fetch(webapp, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, otp, portal }),
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && data.ok) return { ok: true };
    return { ok: false, error: data.error ?? `google_${res.status}` };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "google_network" };
  }
}

/**
 * Sends OTP to the user's email. Tries Resend, then Google Apps Script web app.
 * Dev OTP on screen only if both fail and NODE_ENV=development (or OTP_DEV_EXPOSE=true).
 */
export async function sendPasswordResetOtpEmail(
  to: string,
  otp: string,
  portal: "admin" | "employee"
): Promise<SendOtpResult> {
  const resend = await sendViaResend(to, otp, portal);
  if (resend.ok) return { sent: true, channel: "resend" };

  const google = await sendViaGoogleWebapp(to, otp, portal);
  if (google.ok) return { sent: true, channel: "google" };

  const exposeDev =
    process.env.NODE_ENV === "development" || process.env.OTP_DEV_EXPOSE === "true";
  if (exposeDev) {
    return {
      sent: false,
      devOtp: otp,
      error: [resend.error, google.error].filter(Boolean).join("; "),
    };
  }

  return {
    sent: false,
    error: [resend.error, google.error].filter(Boolean).join("; ") || "email_not_configured",
  };
}
