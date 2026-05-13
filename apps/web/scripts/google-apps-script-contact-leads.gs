/**
 * Google Apps Script — append contact form rows to your Sheet.
 *
 * 1. Open the spreadsheet: https://docs.google.com/spreadsheets/d/1oRK2Gsw1oYDVIoHNkzBf3DXngQNOId6eCrm76fX0KxM/edit
 * 2. Extensions → Apps Script → paste this file → Save.
 * 3. Deploy → New deployment → Select type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone (required for server POST from Next.js; "Google account only" returns 401)
 * 4. Copy the Web app URL (ends with /exec) into apps/web/.env.local:
 *    GOOGLE_CONTACT_SHEET_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 * 5. Redeploy after any code change (Manage deployments → Edit → Version → New version).
 * 6. First run: authorize MailApp when prompted (sends from the Google account that owns the script).
 */

var SPREADSHEET_ID = "1oRK2Gsw1oYDVIoHNkzBf3DXngQNOId6eCrm76fX0KxM";
/** Lead alert inbox (empty string = skip email). */
var NOTIFY_EMAIL = "ganeshbandaru800@gmail.com";

/** Opening /exec in a browser sends GET — avoids "doGet not found" and confirms deployment. */
function doGet() {
  return jsonOut({
    ok: true,
    message: "Contact leads web app is deployed. Submissions use POST with JSON (name, email, message, …).",
  });
}

function doPost(e) {
  try {
    if (!e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: "no_body" });
    }
    var data = JSON.parse(e.postData.contents);
    var name = String(data.name || "").trim();
    var email = String(data.email || "").trim();
    var message = String(data.message || "").trim();
    if (name.length < 2 || email.indexOf("@") === -1 || message.length < 10) {
      return jsonOut({ ok: false, error: "validation" });
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName("Contact");
    if (!sheet) {
      sheet = ss.insertSheet("Contact");
      sheet.appendRow([
        "Timestamp",
        "Name",
        "Email",
        "Company",
        "Phone",
        "Message",
        "Source",
        "Lead ID",
      ]);
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      data.company || "",
      data.phone || "",
      message,
      data.source || "contact",
      data.lead_id || "",
    ]);

    if (NOTIFY_EMAIL) {
      try {
        var lines = [
          "New contact / demo request (Shivtatva)",
          "",
          "Name: " + name,
          "Email: " + email,
          "Company: " + (data.company || "—"),
          "Phone: " + (data.phone || "—"),
          "Source: " + (data.source || "contact"),
          "Lead ID: " + (data.lead_id || "—"),
          "",
          "Message:",
          message,
        ];
        MailApp.sendEmail(
          NOTIFY_EMAIL,
          "Shivtatva lead: " + name,
          lines.join("\n"),
          { replyTo: email }
        );
      } catch (mailErr) {
        // Row is already saved; do not fail the webhook if mail quota/auth fails
      }
    }

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
