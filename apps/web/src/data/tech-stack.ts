export type TechCategory =
  | "Frontend"
  | "Backend"
  | "Databases"
  | "Cloud & DevOps"
  | "AI & Automation"
  | "Security";

export type TechItem = {
  name: string;
  category: TechCategory;
  description: string;
  proficiency: number; // 0-100
};

export const techStack: TechItem[] = [
  // Frontend
  {
    name: "React.js",
    category: "Frontend",
    description: "Component-driven UI with fast iteration and strong ecosystem.",
    proficiency: 92,
  },
  {
    name: "Next.js",
    category: "Frontend",
    description: "App Router, SSR/ISR, and enterprise-grade performance patterns.",
    proficiency: 90,
  },
  {
    name: "Tailwind CSS",
    category: "Frontend",
    description: "Design-system velocity with consistent tokens and utilities.",
    proficiency: 88,
  },
  {
    name: "TypeScript",
    category: "Frontend",
    description: "Safer refactors and scalable codebases with type-driven DX.",
    proficiency: 86,
  },
  {
    name: "Framer Motion",
    category: "Frontend",
    description: "Premium motion design: micro-interactions and transitions.",
    proficiency: 82,
  },
  {
    name: "shadcn/ui",
    category: "Frontend",
    description: "Composable UI primitives for consistent enterprise experiences.",
    proficiency: 78,
  },
  {
    name: "Redux Toolkit",
    category: "Frontend",
    description: "Predictable state with modern patterns and less boilerplate.",
    proficiency: 76,
  },

  // Backend
  {
    name: "Spring Boot",
    category: "Backend",
    description: "Enterprise Java APIs with security, validation, and resilience.",
    proficiency: 84,
  },
  {
    name: "Node.js",
    category: "Backend",
    description: "Realtime services and integrations with robust tooling.",
    proficiency: 86,
  },
  {
    name: "Express.js",
    category: "Backend",
    description: "Lean APIs with middleware for auth, logging, and routing.",
    proficiency: 82,
  },
  {
    name: "Python",
    category: "Backend",
    description: "Automation, analytics pipelines, and AI-ready services.",
    proficiency: 84,
  },
  {
    name: "FastAPI",
    category: "Backend",
    description: "High-performance Python APIs with typed schemas.",
    proficiency: 80,
  },

  // Databases
  {
    name: "PostgreSQL",
    category: "Databases",
    description: "Relational backbone for HRMS, payroll, and compliance data.",
    proficiency: 86,
  },
  {
    name: "MongoDB",
    category: "Databases",
    description: "Flexible documents for logs, events, and content modules.",
    proficiency: 78,
  },
  {
    name: "MySQL",
    category: "Databases",
    description: "Proven relational storage for legacy integrations.",
    proficiency: 74,
  },
  {
    name: "Redis",
    category: "Databases",
    description: "Caching, queues, rate-limits, and realtime presence.",
    proficiency: 80,
  },

  // Cloud & DevOps
  {
    name: "AWS",
    category: "Cloud & DevOps",
    description: "Secure cloud primitives for enterprise workloads.",
    proficiency: 82,
  },
  {
    name: "Docker",
    category: "Cloud & DevOps",
    description: "Reproducible environments and container-first delivery.",
    proficiency: 86,
  },
  {
    name: "Kubernetes",
    category: "Cloud & DevOps",
    description: "Scalable orchestration with zero-downtime deployment patterns.",
    proficiency: 76,
  },
  {
    name: "Vercel",
    category: "Cloud & DevOps",
    description: "Edge-ready hosting for the marketing site and dashboards.",
    proficiency: 74,
  },
  {
    name: "Nginx",
    category: "Cloud & DevOps",
    description: "Reverse proxy, TLS termination, and routing gateways.",
    proficiency: 72,
  },
  {
    name: "GitHub Actions",
    category: "Cloud & DevOps",
    description: "CI/CD pipelines with tests, builds, and deployment workflows.",
    proficiency: 78,
  },

  // AI & Automation
  {
    name: "OpenAI API",
    category: "AI & Automation",
    description: "Assistants, summarization, and automation workflows.",
    proficiency: 72,
  },
  {
    name: "TensorFlow",
    category: "AI & Automation",
    description: "Model training for predictive analytics and classification.",
    proficiency: 62,
  },
  {
    name: "LangChain",
    category: "AI & Automation",
    description: "RAG pipelines and tool-based orchestration for enterprise AI.",
    proficiency: 66,
  },
  {
    name: "AI Analytics",
    category: "AI & Automation",
    description: "Anomaly detection, trend insights, and executive reporting.",
    proficiency: 70,
  },
  {
    name: "Automation Workflows",
    category: "AI & Automation",
    description: "Approvals, routing, and trigger-based productivity flows.",
    proficiency: 78,
  },

  // Security
  {
    name: "JWT Authentication",
    category: "Security",
    description: "Stateless auth for web + API services with rotation support.",
    proficiency: 84,
  },
  {
    name: "OAuth 2.0",
    category: "Security",
    description: "Enterprise identity integrations and delegated access.",
    proficiency: 76,
  },
  {
    name: "Role-Based Access",
    category: "Security",
    description: "Granular permissions aligned to org structure and policy.",
    proficiency: 80,
  },
  {
    name: "HTTPS Encryption",
    category: "Security",
    description: "TLS-first design with secure transport and best practices.",
    proficiency: 86,
  },
  {
    name: "MFA Authentication",
    category: "Security",
    description: "Optional second factor for sensitive admin operations.",
    proficiency: 72,
  },
];

