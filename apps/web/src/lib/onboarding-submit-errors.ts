import { ONBOARDING_FILE_LABELS, type OnboardingFileKey } from "@/lib/onboarding-fields";
import { formatBytes, ONBOARDING_MAX_FILE_BYTES, ONBOARDING_MAX_TOTAL_BYTES } from "@/lib/onboarding-upload-limits";

export type OnboardingSubmitErrorPayload = {
  error?: string;
  field?: string;
  status?: number;
  detail?: string;
};

export function onboardingSubmitErrorMessage(payload: OnboardingSubmitErrorPayload): string {
  const { error, field, detail } = payload;

  if (error === "file_too_large") {
    return `Each file must be under ${formatBytes(ONBOARDING_MAX_FILE_BYTES)}. Compress PDFs or images.`;
  }
  if (error === "payload_too_large") {
    return `Total upload size must be under ${formatBytes(ONBOARDING_MAX_TOTAL_BYTES)}. Use smaller PDFs or photos.`;
  }
  if (error === "not_configured") {
    return "Upload is not configured yet. Email HR with your documents.";
  }
  if (error === "experience_required") {
    return "Previous company details are required for experienced candidates.";
  }
  if (error === "policies_required") {
    return "Acknowledge all company policies before submitting.";
  }
  if (error === "aadhar_required") {
    return "Enter a valid 12-digit Aadhaar number.";
  }
  if (error === "validation") {
    return "Check personal details (name, phone, email, age, parents phone).";
  }
  if (error === "documents_required" && field) {
    const key = field as OnboardingFileKey;
    const label = ONBOARDING_FILE_LABELS[key]?.label ?? field;
    return `Missing upload: ${label}. Go back and attach the file again.`;
  }
  if (error === "invalid_form") {
    return "Upload request was invalid. Try again in Chrome/Edge and disable VPN if enabled.";
  }
  if (error === "invalid_file") {
    return "One of the files could not be read. Re-upload and try again.";
  }
  if (error === "supabase") {
    const d = (detail ?? "").toLowerCase();
    if (d.includes("hrms_onboarding_submissions") && (d.includes("does not exist") || d.includes("relation"))) {
      return "Onboarding storage is not set up on the server. Ask HR to run the Supabase SQL script.";
    }
    if (d.includes("payload") || d.includes("too large") || d.includes("entity too large")) {
      return `Files are too large for the server. Keep each file under ${formatBytes(ONBOARDING_MAX_FILE_BYTES)} and total under ${formatBytes(ONBOARDING_MAX_TOTAL_BYTES)}.`;
    }
    return "Could not save to HR records. Try smaller files or email HR with your documents.";
  }

  return "Could not submit. Check all fields and try again.";
}
