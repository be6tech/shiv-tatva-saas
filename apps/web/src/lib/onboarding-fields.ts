/** Required file uploads (multipart field names). */
export const ONBOARDING_FILE_KEYS = [
  "aadharPhoto",
  "panCopy",
  "photo",
  "bankDetailsPhoto",
  "sscMemo",
  "interMemo",
  "graduationCertificates",
  "offerLetter",
] as const;

export type OnboardingFileKey = (typeof ONBOARDING_FILE_KEYS)[number];

/** Optional uploads */
export const ONBOARDING_OPTIONAL_FILE_KEYS = ["policiesDoc"] as const;
export type OnboardingOptionalFileKey = (typeof ONBOARDING_OPTIONAL_FILE_KEYS)[number];

export const ONBOARDING_FILE_LABELS: Record<
  OnboardingFileKey | OnboardingOptionalFileKey,
  { label: string; hint: string }
> = {
  aadharPhoto: { label: "Aadhaar (with photo)", hint: "ID proof — clear photo of Aadhaar card." },
  panCopy: { label: "PAN card copy", hint: "ID proof — PAN scan or photo." },
  photo: { label: "Passport photo", hint: "Recent passport-size photograph." },
  bankDetailsPhoto: { label: "Bank details", hint: "Passbook front page or cancelled cheque." },
  sscMemo: { label: "SSC memo", hint: "10th class marks memo / certificate." },
  interMemo: { label: "Inter memo", hint: "12th / intermediate marks memo." },
  graduationCertificates: {
    label: "Graduation certificates",
    hint: "Degree certificate(s) or provisional certificate.",
  },
  offerLetter: {
    label: "Offer letter",
    hint: "Signed offer letter from Shiv Tatva (PDF or image).",
  },
  policiesDoc: {
    label: "Signed policy pack (optional)",
    hint: "Single PDF with all policy signatures, if HR provided one.",
  },
};

export const ONBOARDING_POLICIES = [
  {
    id: "codeOfConduct",
    label: "Code of conduct",
    desc: "Workplace behaviour, ethics, and confidentiality.",
  },
  {
    id: "dataSecurity",
    label: "IT & data security",
    desc: "Device use, passwords, and client data handling.",
  },
  {
    id: "hrLeave",
    label: "HR & leave policy",
    desc: "Attendance, leave types, and payroll timelines.",
  },
] as const;

export type OnboardingPolicyId = (typeof ONBOARDING_POLICIES)[number]["id"];
