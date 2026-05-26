"use client";

import * as React from "react";
import {
  Briefcase,
  CheckCircle2,
  FileText,
  GraduationCap,
  IdCard,
  Loader2,
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
  type OnboardingFileKey,
  type OnboardingPolicyId,
} from "@/lib/onboarding-fields";

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
    <section className="rounded-xl border border-border/70 bg-slate-50/40 p-4 dark:border-white/10 dark:bg-white/[0.03]">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
        <Icon className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
        {title}
      </h3>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

function FileRow({
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
    <div className="rounded-lg border border-border/60 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <label htmlFor={id} className="text-sm font-medium text-slate-900 dark:text-white">
            {label}
            {required ? <span className="text-[#ea580c]"> *</span> : null}
          </label>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{hint}</p>
        </div>
        {file ? (
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden />
        ) : null}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-[#ea580c]/50 dark:border-white/20 dark:bg-white/5 dark:text-slate-200"
        >
          <Upload className="h-3.5 w-3.5" />
          {file ? "Replace" : "Upload"}
        </label>
        <input
          id={id}
          type="file"
          className="sr-only"
          accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <span className="truncate text-xs text-slate-500" title={file.name}>
            {file.name}
          </span>
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

  const setFile = (key: OnboardingFileKey, file: File | null) => {
    setFiles((prev) => ({ ...prev, [key]: file }));
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
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok) {
        if (data.error === "file_too_large") {
          setError("Each file must be under 1 MB. Use PDF or compressed images.");
        } else if (data.error === "not_configured") {
          setError("Upload is not configured yet. Email HR with your documents.");
        } else if (data.error === "experience_required") {
          setError("Previous company details are required for experienced candidates.");
        } else if (data.error === "policies_required") {
          setError("Acknowledge all company policies before submitting.");
        } else {
          setError("Could not submit. Check all fields and try again.");
        }
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
    <div className="mt-4 max-h-[min(70vh,640px)] space-y-4 overflow-y-auto pr-1" role="tabpanel">
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

      <Section title="Complete documents" icon={FileText}>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Required for HR: signed offer letter and policy acknowledgements. ID proofs (Aadhaar & PAN)
          are in the next section.
        </p>
        <FileRow
          id="onb-offer"
          {...ONBOARDING_FILE_LABELS.offerLetter}
          file={files.offerLetter}
          onPick={(f) => setFile("offerLetter", f)}
        />
        <div className="rounded-lg border border-border/60 bg-white/60 p-3 dark:border-white/10 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
            <ScrollText className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
            Policy acknowledgements <span className="text-[#ea580c]">*</span>
          </div>
          <ul className="mt-3 space-y-2.5">
            {ONBOARDING_POLICIES.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer gap-2.5">
                  <input
                    type="checkbox"
                    checked={policyAck[p.id]}
                    onChange={() => setPolicyAck((prev) => ({ ...prev, [p.id]: !prev[p.id] }))}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#ea580c]"
                  />
                  <span>
                    <span className="text-sm text-slate-900 dark:text-white">{p.label}</span>
                    <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-400">
                      {p.desc}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
        <FileRow
          id="onb-policies-doc"
          {...ONBOARDING_FILE_LABELS.policiesDoc}
          required={false}
          file={policiesDoc}
          onPick={setPoliciesDoc}
        />
      </Section>

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
        <FileRow
          id="onb-aadhar"
          {...ONBOARDING_FILE_LABELS.aadharPhoto}
          file={files.aadharPhoto}
          onPick={(f) => setFile("aadharPhoto", f)}
        />
        <FileRow
          id="onb-pan"
          {...ONBOARDING_FILE_LABELS.panCopy}
          file={files.panCopy}
          onPick={(f) => setFile("panCopy", f)}
        />
        <FileRow
          id="onb-photo"
          {...ONBOARDING_FILE_LABELS.photo}
          file={files.photo}
          onPick={(f) => setFile("photo", f)}
        />
        <FileRow
          id="onb-bank"
          {...ONBOARDING_FILE_LABELS.bankDetailsPhoto}
          file={files.bankDetailsPhoto}
          onPick={(f) => setFile("bankDetailsPhoto", f)}
        />
      </Section>

      <Section title="Education documents" icon={GraduationCap}>
        <FileRow
          id="onb-ssc"
          {...ONBOARDING_FILE_LABELS.sscMemo}
          file={files.sscMemo}
          onPick={(f) => setFile("sscMemo", f)}
        />
        <FileRow
          id="onb-inter"
          {...ONBOARDING_FILE_LABELS.interMemo}
          file={files.interMemo}
          onPick={(f) => setFile("interMemo", f)}
        />
        <FileRow
          id="onb-grad"
          {...ONBOARDING_FILE_LABELS.graduationCertificates}
          file={files.graduationCertificates}
          onPick={(f) => setFile("graduationCertificates", f)}
        />
      </Section>

      <Section title="Work experience" icon={Briefcase}>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Do you have previous work experience?
        </p>
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
              <span className="capitalize text-slate-800 dark:text-slate-200">{v}</span>
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

      {error ? (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => void onSubmit()}
        disabled={loading}
        className={cn(
          "sticky bottom-0 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#fb923c] px-4 py-3 text-sm font-semibold text-white shadow-lg",
          loading && "opacity-70"
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Submitting…" : "Submit onboarding"}
      </button>

      <p className="pb-1 text-center text-xs text-slate-500">
        Help:{" "}
        <a
          href={`mailto:${SITE_CONTACT_EMAIL}?subject=Onboarding%20help`}
          className="font-medium text-[#ea580c] hover:underline dark:text-[#f97316]"
        >
          {SITE_CONTACT_EMAIL}
        </a>
      </p>
    </div>
  );
}
