/**
 * Smoke test: POST /api/onboarding/documents with minimal valid payload.
 * Run: node scripts/test-onboarding-submit.mjs [baseUrl]
 */
const base = process.argv[2]?.replace(/\/$/, "") || "http://localhost:3000";

const pngBytes = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
);

function file(name) {
  return new File([pngBytes], name, { type: "image/png" });
}

const form = new FormData();
form.set("name", "Onboarding Test");
form.set("phone", "9876543210");
form.set("email", `onboarding.test+${Date.now()}@example.com`);
form.set("gender", "Male");
form.set("fatherName", "Test Father");
form.set("motherName", "Test Mother");
form.set("age", "25");
form.set("parentsPhone", "9876543211");
form.set("aadharNumber", "123456789012");
form.set("isExperienced", "no");
form.set("previousCompanyDetails", "");

for (const key of [
  "aadharPhoto",
  "panCopy",
  "photo",
  "bankDetailsPhoto",
  "sscMemo",
  "interMemo",
  "graduationCertificates",
  "offerLetter",
]) {
  form.set(key, file(`${key}.png`));
}

for (const id of ["codeOfConduct", "dataSecurity", "hrLeave"]) {
  form.set(`policy_${id}`, "true");
}

const res = await fetch(`${base}/api/onboarding/documents`, { method: "POST", body: form });
const text = await res.text();
let data;
try {
  data = JSON.parse(text);
} catch {
  data = { raw: text.slice(0, 300) };
}

console.log("Status:", res.status);
console.log("Body:", JSON.stringify(data, null, 2));
process.exit(res.ok ? 0 : 1);
