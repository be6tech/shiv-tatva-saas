import { PageShell } from "@/components/marketing/page-shell";
import {
  marketingSurface,
  marketingInset,
  marketingBody,
  marketingStrong,
} from "@/components/marketing/marketing-styles";
import { BE6_MODERN_TECH_URL } from "@/lib/site-urls";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  BadgeCheck,
  Briefcase,
  Presentation,
  Sparkles,
  UserPlus,
  Coffee,
  Terminal,
  Cloud,
  Brain,
  Atom,
  Palette,
} from "lucide-react";

const courses: {
  title: string;
  icon: LucideIcon;
  tech: string[];
  duration: string;
  internship: boolean;
  certification: boolean;
}[] = [
  {
    title: "Java Full Stack",
    icon: Coffee,
    tech: ["Java", "Spring Boot", "React", "PostgreSQL"],
    duration: "12–16 weeks",
    internship: true,
    certification: true,
  },
  {
    title: "Python",
    icon: Terminal,
    tech: ["Python", "FastAPI", "SQL", "Automation"],
    duration: "10–12 weeks",
    internship: true,
    certification: true,
  },
  {
    title: "AWS",
    icon: Cloud,
    tech: ["AWS", "Docker", "Kubernetes", "DevOps"],
    duration: "8–10 weeks",
    internship: false,
    certification: true,
  },
  {
    title: "AI/ML",
    icon: Brain,
    tech: ["TensorFlow", "LangChain", "LLMs", "Analytics"],
    duration: "10–14 weeks",
    internship: true,
    certification: true,
  },
  {
    title: "React.js",
    icon: Atom,
    tech: ["React", "Next.js", "TypeScript", "Tailwind"],
    duration: "8–10 weeks",
    internship: true,
    certification: true,
  },
  {
    title: "UI/UX",
    icon: Palette,
    tech: ["Design Systems", "Figma", "UX Research"],
    duration: "6–8 weeks",
    internship: false,
    certification: true,
  },
];

export default function LearningPage() {
  return (
    <PageShell
      title="Learning"
      subtitle={
        <>
          Training overview on this site; the full BE6 program lives at{" "}
          <a
            href={BE6_MODERN_TECH_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-orange-600 underline-offset-2 hover:underline dark:text-orange-400"
          >
            be6moderntech.com
          </a>
          —courses, roadmap, placement, and applications.
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          {[
            { title: "Onboarding", icon: UserPlus, desc: "How new learners join programs at BE6 / Shiv Tatva.", anchor: "onboarding" },
            { title: "Courses", icon: GraduationCap, desc: "Modern curriculum aligned to enterprise stacks.", anchor: "courses" },
            { title: "Internship Programs", icon: Briefcase, desc: "Hands-on projects & mentorship.", anchor: "internships" },
            { title: "Certifications", icon: BadgeCheck, desc: "Completion certificates & skill validation.", anchor: "certifications" },
            { title: "Workshops", icon: Presentation, desc: "Short-format sessions for teams and colleges.", anchor: "workshops" },
          ].map((b) => (
            <a key={b.title} href={`#${b.anchor}`} className={cn(marketingSurface, "block p-6 transition hover:border-orange-200/70 dark:hover:border-orange-500/30")}>
              <div className="flex items-center gap-3">
                <div className={cn(marketingInset, "flex h-11 w-11 shrink-0 items-center justify-center border-0 p-0")}>
                  <b.icon className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" />
                </div>
                <div className={cn("text-base font-semibold", marketingStrong)}>{b.title}</div>
              </div>
              <p className={cn("mt-3 text-sm", marketingBody)}>{b.desc}</p>
            </a>
          ))}

          <div className={cn(marketingSurface, "p-6")}>
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Sparkles className="h-4 w-4 text-[#ea580c] dark:text-[#f97316]" />
              No payments
            </div>
            <p className={cn("mt-2 text-sm", marketingBody)}>
              For brochures, modules, and enrollment, visit{" "}
              <a
                href={BE6_MODERN_TECH_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-orange-600 underline-offset-2 hover:underline dark:text-orange-400"
              >
                be6moderntech.com
              </a>
              . Use Contact here for Shiv Tatva enterprise or partnership questions.
            </p>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <section id="onboarding" className={cn(marketingSurface, "scroll-mt-24 p-6 sm:p-8")}>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" />
              <h2 className={cn("text-xl font-semibold", marketingStrong)}>Learner onboarding</h2>
            </div>
            <p className={cn("mt-3 text-sm", marketingBody)}>
              A clear path from application to your first day in the program — orientation, tools access,
              and mentor connect.
            </p>
            <ol className="mt-6 space-y-4">
              {[
                {
                  title: "Apply & confirm seat",
                  desc: "Submit interest via be6moderntech.com or partner colleges; receive welcome email.",
                },
                {
                  title: "Orientation session",
                  desc: "Program roadmap, expectations, and communication channels (Slack / email).",
                },
                {
                  title: "Tooling & accounts",
                  desc: "GitHub, LMS, and project repo access with setup checklist.",
                },
                {
                  title: "Mentor assignment",
                  desc: "Weekly syncs, code reviews, and internship task board.",
                },
                {
                  title: "Certification track",
                  desc: "Milestones, assessments, and certificate on successful completion.",
                },
              ].map((item, i) => (
                <li key={item.title} className={cn(marketingInset, "flex gap-3 p-4")}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 text-xs font-bold text-orange-800 dark:text-orange-200">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <div className={cn("font-medium", marketingStrong)}>{item.title}</div>
                    <p className={cn("mt-1 text-sm", marketingBody)}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div id="courses" className="grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <div key={c.title} className={cn(marketingSurface, "p-6")}>
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      marketingInset,
                      "flex h-10 w-10 shrink-0 items-center justify-center border-0 p-0"
                    )}
                  >
                    <c.icon className="h-5 w-5 text-[#ea580c] dark:text-[#f97316]" aria-hidden />
                  </div>
                  <div className={cn("text-base font-semibold", marketingStrong)}>{c.title}</div>
                </div>
                <div className={cn("mt-2 text-sm", marketingBody)}>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Technologies:</span> {c.tech.join(" • ")}
                </div>
                <div className={cn("mt-2 text-sm", marketingBody)}>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Duration:</span> {c.duration}
                </div>
                <div className={cn("mt-2 text-sm", marketingBody)}>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Internship Support:</span>{" "}
                  {c.internship ? "Available" : "Optional"}
                </div>
                <div className={cn("mt-2 text-sm", marketingBody)}>
                  <span className="font-medium text-slate-800 dark:text-slate-200">Certification:</span>{" "}
                  {c.certification ? "Available" : "N/A"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
