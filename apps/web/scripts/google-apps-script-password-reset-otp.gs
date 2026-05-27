/**
 * Google Apps Script — send password-reset OTP email in real time.
 *
 * 1. script.google.com → New project → paste this file → Save
 * 2. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 3. Copy /exec URL into apps/web/.env.local and Vercel:
 *    GOOGLE_PASSWORD_RESET_OTP_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 * 4. Authorize MailApp on first run (sends from your Google account).
 */

function doGet() {
  return jsonOut({
    ok: true,
    message: "Password reset OTP mailer. POST JSON: { to, otp, portal }",
  });
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: "no_body" });
    }
    var data = JSON.parse(e.postData.contents);
    var to = String(data.to || "").trim().toLowerCase();
    var otp = String(data.otp || "").replace(/\D/g, "");
    var portal = String(data.portal || "employee").trim();

    if (to.indexOf("@") === -1 || otp.length !== 6) {
      return jsonOut({ ok: false, error: "validation" });
    }

    var subject =
      portal === "admin"
        ? "Shiv Tatva Admin — password reset code"
        : "Shiv Tatva Employee Portal — password reset code";

    var body =
      "Your one-time password reset code is:\n\n" +
      "    " +
      otp +
      "\n\n" +
      "This code expires in 10 minutes.\n\n" +
      "If you did not request this, ignore this email.\n\n" +
      "— Shiv Tatva Solutions";

    MailApp.sendEmail(to, subject, body);

    return jsonOut({ ok: true, sent: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
