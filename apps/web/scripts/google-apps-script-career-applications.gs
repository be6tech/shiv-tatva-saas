/**
 * Google Apps Script — append /careers applications to the **Careers** sheet tab.
 *
 * 1. In the spreadsheet, add a tab named **Careers** (or let the script create it).
 * 2. Extensions → Apps Script → new project or separate file → paste → Save.
 * 3. Deploy → Web app → Execute as: Me → Who has access: **Anyone** → copy /exec URL.
 * 4. apps/web/.env.local: GOOGLE_CAREERS_SHEET_WEBAPP_URL=https://script.google.com/macros/s/.../exec
 * 5. Redeploy after code changes.
 */

var SPREADSHEET_ID = "1oRK2Gsw1oYDVIoHNkzBf3DXngQNOId6eCrm76fX0KxM";
var SHEET_NAME = "Careers";
var NOTIFY_EMAIL = "ganeshbandaru800@gmail.com";

function doGet() {
  return jsonOut({
    ok: true,
    message: "Careers web app is deployed. POST JSON: name, email, role, message, …",
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
    var role = String(data.role || "").trim();
    var message = String(data.message || "").trim();
    if (name.length < 2 || email.indexOf("@") === -1 || role.length < 2 || message.length < 10) {
      return jsonOut({ ok: false, error: "validation" });
    }

    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp",
        "Name",
        "Email",
        "Phone",
        "Role",
        "Portfolio",
        "Message",
        "Application ID",
      ]);
    }

    sheet.appendRow([
      new Date(),
      name,
      email,
      data.phone || "",
      role,
      data.portfolio || "",
      message,
      data.application_id || "",
    ]);

    if (NOTIFY_EMAIL) {
      try {
        var lines = [
          "New careers application (Shivtatva)",
          "",
          "Name: " + name,
          "Email: " + email,
          "Phone: " + (data.phone || "—"),
          "Role: " + role,
          "Portfolio: " + (data.portfolio || "—"),
          "Application ID: " + (data.application_id || "—"),
          "",
          "Message:",
          message,
        ];
        MailApp.sendEmail(
          NOTIFY_EMAIL,
          "Shivtatva careers: " + name + " — " + role,
          lines.join("\n"),
          { replyTo: email }
        );
      } catch (mailErr) {}
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
