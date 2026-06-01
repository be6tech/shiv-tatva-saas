"use client";

import * as React from "react";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  IdCard,
  Loader2,
  Mail,
  ScrollText,
  Upload,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { marketingInput } from "@/components/marketing/marketing-styles";
import { SITE_CONTACT_EMAIL } from "@/lib/site-contact";
import {
  ONBOARDING_FILE_KEYS,
  ONBOARDING_FILE_LABELS,
  ONBOARDING_POLICIES,
  ONBOARDING_MAX_FILE_BYTES,
  ONBOARDING_MAX_TOTAL_BYTES,
  formatBytes,
  type OnboardingFileKey,
  type OnboardingPolicyId,
} from "@/lib/onboarding-fields";
import {
  onboardingSubmitErrorMessage,
  type OnboardingSubmitErrorPayload,
} from "@/lib/onboarding-submit-errors";

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-white/70 p-4 shadow-sm shadow-slate-900/[0.03] dark:border-white/10 dark:bg-white/[0.04]">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <Icon className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function FileCard({
  id,
  label,
  hint,
  required = true,
  file,
  onPick,
}: {
  id: string;
  label: string;
  hint: string;
  required?: boolean;
  file: File | null;
  onPick: (f: File | null) => void;
}) {
  return (
    <div className="group rounded-2xl border border-border/60 bg-white/60 p-3 transition hover:border-[#ea580c]/30 hover:bg-white/80 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-[#f97316]/30">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <label htmlFor={id} className="text-sm font-semibold text-slate-900 dark:text-white">
            {label}
            {required ? <span className="text-[#ea580c]"> *</span> : null}
          </label>
          <p className="mt-0.5 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{hint}</p>
        </div>
        <div className="flex items-center gap-2">
          {file ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Added
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
              Pending
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
            file
              ? "border-slate-200 bg-white text-slate-700 hover:border-[#ea580c]/40 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
              : "border-dashed border-slate-300 bg-white text-slate-700 hover:border-[#ea580c]/50 dark:border-white/20 dark:bg-white/5 dark:text-slate-200"
          )}
        >
          <Upload className="h-3.5 w-3.5" />
          {file ? "Replace file" : "Upload file"}
        </label>
        <input
          id={id}
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <span className="max-w-[220px] truncate text-xs text-slate-500" title={file.name}>
              {file.name}
            </span>
            <button
              type="button"
              onClick={() => onPick(null)}
              className="text-xs font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline dark:text-slate-300 dark:hover:text-white"
            >
              Remove
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

const initialFiles = (): Record<OnboardingFileKey, File | null> =>
  Object.fromEntries(ONBOARDING_FILE_KEYS.map((k) => [k, null])) as Record<OnboardingFileKey, File | null>;

type OnboardingDocumentsPanelProps = {
  onGoToEmployeeLogin: () => void;
};

export function OnboardingDocumentsPanel({ onGoToEmployeeLogin }: OnboardingDocumentsPanelProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [fatherName, setFatherName] = React.useState("");
  const [motherName, setMotherName] = React.useState("");
  const [age, setAge] = React.useState("");
  const [parentsPhone, setParentsPhone] = React.useState("");
  const [aadharNumber, setAadharNumber] = React.useState("");
  const [isExperienced, setIsExperienced] = React.useState<"yes" | "no" | "">("");
  const [previousCompanyDetails, setPreviousCompanyDetails] = React.useState("");
  const [files, setFiles] = React.useState(initialFiles);
  const [policiesDoc, setPoliciesDoc] = React.useState<File | null>(null);
  const [policyAck, setPolicyAck] = React.useState<Record<OnboardingPolicyId, boolean>>({
    codeOfConduct: false,
    dataSecurity: false,
    hrLeave: false,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const steps = [
    { id: "personal", label: "Personal", icon: User },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "id", label: "ID proofs", icon: IdCard },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Briefcase },
  ] as const;
  type StepId = (typeof steps)[number]["id"];
  const [stepIndex, setStepIndex] = React.useState(0);
  const step = steps[stepIndex]!;

  const pickFile = (key: OnboardingFileKey | "policiesDoc", file: File | null, onPick: (f: File | null) => void) => {
    if (file && file.size > ONBOARDING_MAX_FILE_BYTES) {
      setError(
        `${file.name} is too large (max ${formatBytes(ONBOARDING_MAX_FILE_BYTES)} per file). Compress and try again.`
      );
      return;
    }
    setError(null);
    onPick(file);
  };

  const setFile = (key: OnboardingFileKey, file: File | null) => {
    pickFile(key, file, (f) => setFiles((prev) => ({ ...prev, [key]: f })));
  };

  const requiredUploadsCount = ONBOARDING_FILE_KEYS.length;
  const uploadedCount = ONBOARDING_FILE_KEYS.reduce((acc, k) => (files[k] ? acc + 1 : acc), 0);
  const policiesOk = policyAck.codeOfConduct && policyAck.dataSecurity && policyAck.hrLeave;
  const completionPct = Math.round(((uploadedCount + (policiesOk ? 1 : 0)) / (requiredUploadsCount + 1)) * 100);

  const validateStep = (id: StepId): string | null => {
    if (id === "personal") {
      if (!name.trim() || phone.trim().length < 10 || !email.includes("@")) {
        return "Enter your name, phone number, and email.";
      }
      if (!gender || !fatherName.trim() || !motherName.trim()) {
        return "Complete all personal details (gender, father & mother name).";
      }
      const ageNum = Number.parseInt(age, 10);
      if (!Number.isFinite(ageNum) || ageNum < 18) return "Enter a valid age (18+).";
      if (parentsPhone.trim().length < 10) return "Enter parents phone number.";
      return null;
    }
    if (id === "documents") {
      if (!files.offerLetter) return `Upload: ${ONBOARDING_FILE_LABELS.offerLetter.label}`;
      if (!policiesOk) return "Acknowledge all company policies before continuing.";
      return null;
    }
    if (id === "id") {
      if (aadharNumber.replace(/\s/g, "").length < 12) return "Enter a valid 12-digit Aadhaar number.";
      if (!files.aadharPhoto) return `Upload: ${ONBOARDING_FILE_LABELS.aadharPhoto.label}`;
      if (!files.panCopy) return `Upload: ${ONBOARDING_FILE_LABELS.panCopy.label}`;
      if (!files.photo) return `Upload: ${ONBOARDING_FILE_LABELS.photo.label}`;
      if (!files.bankDetailsPhoto) return `Upload: ${ONBOARDING_FILE_LABELS.bankDetailsPhoto.label}`;
      return null;
    }
    if (id === "education") {
      if (!files.sscMemo) return `Upload: ${ONBOARDING_FILE_LABELS.sscMemo.label}`;
      if (!files.interMemo) return `Upload: ${ONBOARDING_FILE_LABELS.interMemo.label}`;
      if (!files.graduationCertificates) return `Upload: ${ONBOARDING_FILE_LABELS.graduationCertificates.label}`;
      return null;
    }
    if (id === "experience") {
      if (!isExperienced) return "Select Yes or No for previous work experience.";
      if (isExperienced === "yes" && previousCompanyDetails.trim().length < 10) {
        return "Enter previous company details (experience candidates).";
      }
      return null;
    }
    return null;
  };

  const goNext = () => {
    const msg = validateStep(step.id);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setStepIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStepIndex((i) => Math.max(i - 1, 0));
  };

  const onSubmit = async () => {
    setError(null);
    setSuccess(false);

    if (!name.trim() || phone.trim().length < 10 || !email.includes("@")) {
      setError("Enter your name, phone number, and email.");
      return;
    }
    if (!gender || !fatherName.trim() || !motherName.trim()) {
      setError("Complete all personal details (gender, father & mother name).");
      return;
    }
    const ageNum = Number.parseInt(age, 10);
    if (!Number.isFinite(ageNum) || ageNum < 18) {
      setError("Enter a valid age (18+).");
      return;
    }
    if (parentsPhone.trim().length < 10) {
      setError("Enter parents phone number.");
      return;
    }
    if (aadharNumber.replace(/\s/g, "").length < 12) {
      setError("Enter a valid 12-digit Aadhaar number.");
      return;
    }
    if (!isExperienced) {
      setError("Select Yes or No for previous work experience.");
      return;
    }
    if (isExperienced === "yes" && previousCompanyDetails.trim().length < 10) {
      setError("Enter previous company details (experience candidates).");
      return;
    }

    for (const key of ONBOARDING_FILE_KEYS) {
      if (!files[key]) {
        setError(`Upload: ${ONBOARDING_FILE_LABELS[key].label}`);
        return;
      }
    }
    if (!policyAck.codeOfConduct || !policyAck.dataSecurity || !policyAck.hrLeave) {
      setError("Acknowledge all company policies before submitting.");
      return;
    }

    let totalBytes = 0;
    for (const key of ONBOARDING_FILE_KEYS) {
      const f = files[key]!;
      if (f.size > ONBOARDING_MAX_FILE_BYTES) {
        setError(
          `${ONBOARDING_FILE_LABELS[key].label} is too large (max ${formatBytes(ONBOARDING_MAX_FILE_BYTES)}).`
        );
        return;
      }
      totalBytes += f.size;
    }
    if (policiesDoc) {
      if (policiesDoc.size > ONBOARDING_MAX_FILE_BYTES) {
        setError(
          `${ONBOARDING_FILE_LABELS.policiesDoc.label} is too large (max ${formatBytes(ONBOARDING_MAX_FILE_BYTES)}).`
        );
        return;
      }
      totalBytes += policiesDoc.size;
    }
    if (totalBytes > ONBOARDING_MAX_TOTAL_BYTES) {
      setError(
        `Total upload size is ${formatBytes(totalBytes)}. Maximum is ${formatBytes(ONBOARDING_MAX_TOTAL_BYTES)} — compress PDFs/photos and try again.`
      );
      return;
    }

    const form = new FormData();
    form.set("name", name.trim());
    form.set("phone", phone.trim());
    form.set("email", email.trim());
    form.set("gender", gender);
    form.set("fatherName", fatherName.trim());
    form.set("motherName", motherName.trim());
    form.set("age", age);
    form.set("parentsPhone", parentsPhone.trim());
    form.set("aadharNumber", aadharNumber.replace(/\s/g, ""));
    form.set("isExperienced", isExperienced);
    form.set("previousCompanyDetails", previousCompanyDetails.trim());
    for (const key of ONBOARDING_FILE_KEYS) {
      form.set(key, files[key]!);
    }
    if (policiesDoc) form.set("policiesDoc", policiesDoc);
    for (const p of ONBOARDING_POLICIES) {
      form.set(`policy_${p.id}`, policyAck[p.id] ? "true" : "false");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/onboarding/documents", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as OnboardingSubmitErrorPayload & { ok?: boolean };
      if (!res.ok) {
        setError(onboardingSubmitErrorMessage(data));
        return;
      }
      setSuccess(true);
      setFiles(initialFiles());
      setPoliciesDoc(null);
      setPolicyAck({ codeOfConduct: false, dataSecurity: false, hrLeave: false });
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="mt-4 space-y-4" role="tabpanel">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Onboarding submitted
          </div>
          <p className="mt-2">
            HR will verify your ID proofs, offer letter, policy acknowledgements, and other
            documents. After approval, sign in from the Employee tab.
          </p>
        </div>
        <button
          type="button"
          onClick={onGoToEmployeeLogin}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white"
        >
          Go to Employee login
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4" role="tabpanel">
      <div className="rounded-2xl border border-border/70 bg-slate-50/60 p-4 dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-slate-900 dark:text-white">Employee onboarding</div>
            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Upload required documents and submit to HR. PDF or photos — max{" "}
              <span className="font-semibold">{formatBytes(ONBOARDING_MAX_FILE_BYTES)}</span> per file,{" "}
              <span className="font-semibold">{formatBytes(ONBOARDING_MAX_TOTAL_BYTES)}</span> total.
            </div>
          </div>
          <div className="rounded-xl border border-border/70 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            Progress: {completionPct}% • Uploads {uploadedCount}/{requiredUploadsCount} • Policies{" "}
            {policiesOk ? "Done" : "Pending"}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        <div className="rounded-2xl border border-border/70 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Step {stepIndex + 1} of {steps.length}: {step.label}
            </div>
            <a
              href={`mailto:${SITE_CONTACT_EMAIL}?subject=Onboarding%20help`}
              className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10"
            >
              <Mail className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
              Need help?
            </a>
          </div>

          <div className="mt-2 grid grid-cols-5 gap-2">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (loading) return;
                    const msg = i > stepIndex ? validateStep(step.id) : null;
                    if (msg) {
                      setError(msg);
                      return;
                    }
                    setError(null);
                    setStepIndex(i);
                  }}
                  className={cn(
                    "flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-semibold transition",
                    active
                      ? "border-[#ea580c]/30 bg-[#ea580c]/10 text-[#9a3412] dark:border-[#f97316]/30 dark:bg-[#f97316]/15 dark:text-[#fdba74]"
                      : done
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200"
                        : "border-border/70 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {step.id === "personal" ? (
          <Section title="Personal details" icon={User}>
            <div className="grid gap-3 sm:grid-cols-2">
          <input
            className={cn(marketingInput, "sm:col-span-2")}
            placeholder="Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
          <input
            className={marketingInput}
            placeholder="Phone number *"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
          <input
            className={marketingInput}
            placeholder="Email *"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <select
            className={marketingInput}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            aria-label="Gender"
          >
            <option value="">Gender *</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            className={marketingInput}
            placeholder="Age *"
            type="number"
            min={18}
            max={70}
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <input
            className={marketingInput}
            placeholder="Father name *"
            value={fatherName}
            onChange={(e) => setFatherName(e.target.value)}
          />
          <input
            className={marketingInput}
            placeholder="Mother name *"
            value={motherName}
            onChange={(e) => setMotherName(e.target.value)}
          />
          <input
            className={cn(marketingInput, "sm:col-span-2")}
            placeholder="Parents phone number *"
            type="tel"
            value={parentsPhone}
            onChange={(e) => setParentsPhone(e.target.value)}
          />
            </div>
          </Section>
        ) : null}

        {step.id === "documents" ? (
            <Section title="Complete documents" icon={FileText}>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Required for HR: signed offer letter and policy acknowledgements. ID proofs (Aadhaar & PAN) are in the
                next section.
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                <FileCard
                  id="onb-offer"
                  {...ONBOARDING_FILE_LABELS.offerLetter}
                  file={files.offerLetter}
                  onPick={(f) => setFile("offerLetter", f)}
                />
                <FileCard
                  id="onb-policies-doc"
                  {...ONBOARDING_FILE_LABELS.policiesDoc}
                  required={false}
                  file={policiesDoc}
                  onPick={(f) => pickFile("policiesDoc", f, setPoliciesDoc)}
                />
              </div>
              <div className="rounded-2xl border border-border/60 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.03]">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
                    <ScrollText className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
                    Policy acknowledgements <span className="text-[#ea580c]">*</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-[11px] font-semibold",
                      policiesOk
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"
                    )}
                  >
                    {policiesOk ? "Done" : "Pending"}
                  </span>
                </div>
                <ul className="mt-3 space-y-2.5">
                  {ONBOARDING_POLICIES.map((p) => (
                    <li key={p.id}>
                      <label className="flex cursor-pointer gap-2.5 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={policyAck[p.id]}
                          onChange={() => setPolicyAck((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#ea580c]"
                        />
                        <span>
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.label}</span>
                          <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-400">{p.desc}</span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>
        ) : null}

        {step.id === "id" ? (
            <Section title="ID proofs, photo & bank" icon={IdCard}>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ID proofs: upload Aadhaar (with photo) and PAN copy.
              </p>
              <input
                className={marketingInput}
                placeholder="Aadhaar number (12 digits) *"
                inputMode="numeric"
                maxLength={14}
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value.replace(/[^\d\s]/g, ""))}
              />
              <div className="grid gap-3 lg:grid-cols-2">
                <FileCard
                  id="onb-aadhar"
                  {...ONBOARDING_FILE_LABELS.aadharPhoto}
                  file={files.aadharPhoto}
                  onPick={(f) => setFile("aadharPhoto", f)}
                />
                <FileCard
                  id="onb-pan"
                  {...ONBOARDING_FILE_LABELS.panCopy}
                  file={files.panCopy}
                  onPick={(f) => setFile("panCopy", f)}
                />
                <FileCard
                  id="onb-photo"
                  {...ONBOARDING_FILE_LABELS.photo}
                  file={files.photo}
                  onPick={(f) => setFile("photo", f)}
                />
                <FileCard
                  id="onb-bank"
                  {...ONBOARDING_FILE_LABELS.bankDetailsPhoto}
                  file={files.bankDetailsPhoto}
                  onPick={(f) => setFile("bankDetailsPhoto", f)}
                />
              </div>
            </Section>
        ) : null}

        {step.id === "education" ? (
            <Section title="Education documents" icon={GraduationCap}>
              <div className="grid gap-3 lg:grid-cols-2">
                <FileCard
                  id="onb-ssc"
                  {...ONBOARDING_FILE_LABELS.sscMemo}
                  file={files.sscMemo}
                  onPick={(f) => setFile("sscMemo", f)}
                />
                <FileCard
                  id="onb-inter"
                  {...ONBOARDING_FILE_LABELS.interMemo}
                  file={files.interMemo}
                  onPick={(f) => setFile("interMemo", f)}
                />
                <FileCard
                  id="onb-grad"
                  {...ONBOARDING_FILE_LABELS.graduationCertificates}
                  file={files.graduationCertificates}
                  onPick={(f) => setFile("graduationCertificates", f)}
                />
              </div>
            </Section>
        ) : null}

        {step.id === "experience" ? (
            <Section title="Work experience" icon={Briefcase}>
              <p className="text-xs text-slate-600 dark:text-slate-400">Do you have previous work experience?</p>
              <div className="flex gap-4">
                {(["yes", "no"] as const).map((v) => (
                  <label key={v} className="inline-flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="experience"
                      checked={isExperienced === v}
                      onChange={() => setIsExperienced(v)}
                      className="text-[#ea580c] focus:ring-[#ea580c]"
                    />
                    <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">{v}</span>
                  </label>
                ))}
              </div>
              {isExperienced === "yes" ? (
                <textarea
                  className={cn(marketingInput, "min-h-[88px] resize-y")}
                  placeholder="Previous company details * (company name, role, dates, reason for leaving)"
                  value={previousCompanyDetails}
                  onChange={(e) => setPreviousCompanyDetails(e.target.value)}
                />
              ) : (
                <p className="text-xs text-slate-500">Freshers can select No — previous company not required.</p>
              )}
            </Section>
        ) : null}

        {error ? (
          <p className="text-sm font-semibold text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={loading || stepIndex === 0}
            className={cn(
              "inline-flex items-center justify-center rounded-2xl border border-border/70 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10",
              stepIndex === 0 && "cursor-not-allowed"
            )}
          >
            Back
          </button>

          {stepIndex < steps.length - 1 ? (
            <button
              type="button"
              onClick={goNext}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ea580c]/10 dark:from-[#f97316] dark:to-amber-400"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void onSubmit()}
              disabled={loading}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ea580c]/10 dark:from-[#f97316] dark:to-amber-400",
                loading && "opacity-70"
              )}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Submitting…" : "Submit onboarding"}
            </button>
          )}
        </div>

        <p className="pb-1 text-center text-xs text-slate-500">
          Help:{" "}
          <a
            href={`mailto:${SITE_CONTACT_EMAIL}?subject=Onboarding%20help`}
            className="font-semibold text-[#ea580c] hover:underline dark:text-[#f97316]"
          >
            {SITE_CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </div>
  );
}
