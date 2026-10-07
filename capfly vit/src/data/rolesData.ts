export type TargetRole = "Backend Developer" | "Frontend Developer" | "ML Engineer";

export type SkillStatus = "Verified" | "Unverified" | "Missing";

export interface SkillItem {
  id: string;
  name: string;
  category: "Language" | "Framework" | "Database & Storage" | "Infrastructure & Tools" | "Architecture";
  status: SkillStatus;
  reason: string;
  evidence?: string;
}

export interface PillarItem {
  id: string;
  title: string;
  subtitle: string;
  score: number;
  weight: number;
  shortVerdict: string;
  checklist: { label: string; passed: boolean }[];
}

export interface ActionItem {
  id: number;
  title: string;
  detail: string;
  potentialGain: number;
  completed: boolean;
}

export interface RepoItem {
  name: string;
  description: string;
  language: string;
  hasTests: boolean;
  hasCi: boolean;
  lastCommitDaysAgo: number;
  stars: number;
}

export interface ReadinessResult {
  role: TargetRole;
  candidateName: string;
  resumeFileName: string;
  githubUrl: string;
  portfolioUrl: string;
  overallScore: number;
  statusLabel: "Job Ready" | "Almost Ready" | "Needs Work";
  statusDescription: string;
  pillars: PillarItem[];
  skills: SkillItem[];
  nextSteps: ActionItem[];
  repos: RepoItem[];
}

export interface RolePreset {
  candidateName: string;
  resumeFileName: string;
  githubUrl: string;
  portfolioUrl: string;
  sampleResult: ReadinessResult;
}

export const PRESET_PROFILES: Record<TargetRole, RolePreset> = {
  "Backend Developer": {
    candidateName: "Alex Rivera",
    resumeFileName: "Alex_Rivera_Backend_Resume.pdf",
    githubUrl: "https://github.com/alexrivera-dev",
    portfolioUrl: "https://alexrivera.work",
    sampleResult: {
      role: "Backend Developer",
      candidateName: "Alex Rivera",
      resumeFileName: "Alex_Rivera_Backend_Resume.pdf",
      githubUrl: "https://github.com/alexrivera-dev",
      portfolioUrl: "https://alexrivera.work",
      overallScore: 82,
      statusLabel: "Job Ready",
      statusDescription: "Strong API engineering and database work. You need automated tests to cross the finish line.",
      pillars: [
        {
          id: "proof_of_work",
          title: "Proof of Work",
          subtitle: "Did you build it?",
          score: 88,
          weight: 30,
          shortVerdict: "3 standalone backend systems with real database schemas, not tutorial clones.",
          checklist: [
            { label: "Original database schema design", passed: true },
            { label: "Public deployed API endpoints", passed: true },
            { label: "Authentication & token lifecycle", passed: true },
            { label: "Containerized with Docker", passed: true },
          ],
        },
        {
          id: "role_match",
          title: "Role Match",
          subtitle: "Does it fit the job?",
          score: 85,
          weight: 30,
          shortVerdict: "Direct match for Node/Go REST backend roles. Docker and SQL covered.",
          checklist: [
            { label: "Relational database indexing (PostgreSQL)", passed: true },
            { label: "REST / JSON API contracts", passed: true },
            { label: "Caching layer (Redis)", passed: false },
            { label: "Message queue experience (RabbitMQ/Kafka)", passed: false },
          ],
        },
        {
          id: "code_quality",
          title: "Code Quality",
          subtitle: "Is it tested and clean?",
          score: 72,
          weight: 20,
          shortVerdict: "Clean directory separation, but test coverage is below 35%.",
          checklist: [
            { label: "Unit test suite present", passed: false },
            { label: "Clear error handling middleware", passed: true },
            { label: "Environment variables configured", passed: true },
            { label: "CI workflow on push (GitHub Actions)", passed: true },
          ],
        },
        {
          id: "activity",
          title: "Activity",
          subtitle: "Did you code recently?",
          score: 84,
          weight: 20,
          shortVerdict: "Pushed 41 commits across 4 repositories in the last 60 days.",
          checklist: [
            { label: "Active in the last 14 days", passed: true },
            { label: "Consistent weekend and weekday commits", passed: true },
            { label: "Meaningful multi-line commit messages", passed: false },
            { label: "Merged pull requests", passed: true },
          ],
        },
      ],
      skills: [
        {
          id: "s1",
          name: "Node.js & Express",
          category: "Framework",
          status: "Verified",
          reason: "Found across 3 public repositories with 42 commits and structured controllers.",
          evidence: "Repo: task-flow-api (22 commits)",
        },
        {
          id: "s2",
          name: "PostgreSQL",
          category: "Database & Storage",
          status: "Verified",
          reason: "Found 6 migration files and raw join queries in user-billing-service.",
          evidence: "Repo: user-billing-service /migrations",
        },
        {
          id: "s3",
          name: "Docker & Compose",
          category: "Infrastructure & Tools",
          status: "Verified",
          reason: "Production multi-stage Dockerfile and docker-compose.yml verified in root.",
          evidence: "Repo: task-flow-api /Dockerfile",
        },
        {
          id: "s4",
          name: "Redis",
          category: "Database & Storage",
          status: "Unverified",
          reason: "Claimed on resume under Databases, but zero imports or connection configs found on GitHub.",
          evidence: "No usage found in repository code",
        },
        {
          id: "s5",
          name: "TypeScript",
          category: "Language",
          status: "Verified",
          reason: "Strict tsconfig.json with comprehensive interface typings.",
          evidence: "Repo: task-flow-api (95% TS coverage)",
        },
        {
          id: "s6",
          name: "Automated Testing (Jest / Vitest)",
          category: "Architecture",
          status: "Missing",
          reason: "Required for entry backend jobs. Your main repo has 0 test files.",
          evidence: "No *.test.ts or *.spec.ts found",
        },
        {
          id: "s7",
          name: "Redis Caching Layer",
          category: "Architecture",
          status: "Missing",
          reason: "Backend screenings test latency optimization. No caching layer detected.",
          evidence: "Needed for high-traffic API readiness",
        },
      ],
      nextSteps: [
        {
          id: 1,
          title: "Add a cache to task-flow-api",
          detail: "Spin up Redis in Docker Compose and cache the GET /projects endpoint with a 60-second TTL.",
          potentialGain: 7,
          completed: false,
        },
        {
          id: 2,
          title: "Write automated tests for auth route",
          detail: "Add 5 unit tests with Vitest or Jest covering login, bad passwords, and expired tokens.",
          potentialGain: 6,
          completed: false,
        },
        {
          id: 3,
          title: "Push code weekly on public GitHub",
          detail: "Maintain a steady 3-commit streak every week to show hiring managers active momentum.",
          potentialGain: 5,
          completed: false,
        },
      ],
      repos: [
        {
          name: "task-flow-api",
          description: "RESTful microservice for team task orchestration with JWT auth",
          language: "TypeScript",
          hasTests: false,
          hasCi: true,
          lastCommitDaysAgo: 4,
          stars: 12,
        },
        {
          name: "user-billing-service",
          description: "Postgres schema migrations and Stripe webhook transaction logger",
          language: "Go / SQL",
          hasTests: true,
          hasCi: true,
          lastCommitDaysAgo: 16,
          stars: 6,
        },
        {
          name: "dotfiles-dev-env",
          description: "Zsh, Neovim and Docker workstation configuration",
          language: "Shell",
          hasTests: false,
          hasCi: false,
          lastCommitDaysAgo: 38,
          stars: 2,
        },
      ],
    },
  },

  "Frontend Developer": {
    candidateName: "Maya Lin",
    resumeFileName: "Maya_Lin_Frontend_2026.pdf",
    githubUrl: "https://github.com/mayalin-ui",
    portfolioUrl: "https://mayalin.design",
    sampleResult: {
      role: "Frontend Developer",
      candidateName: "Maya Lin",
      resumeFileName: "Maya_Lin_Frontend_2026.pdf",
      githubUrl: "https://github.com/mayalin-ui",
      portfolioUrl: "https://mayalin.design",
      overallScore: 68,
      statusLabel: "Almost Ready",
      statusDescription: "Strong styling and component layout skills. Needs state management and mobile responsiveness audits.",
      pillars: [
        {
          id: "proof_of_work",
          title: "Proof of Work",
          subtitle: "Did you build it?",
          score: 74,
          weight: 30,
          shortVerdict: "Two deployed web applications with clean design, but single-page scope.",
          checklist: [
            { label: "Live responsive web application", passed: true },
            { label: "Complex form validation with feedback", passed: true },
            { label: "Dynamic API consumption", passed: true },
            { label: "Production deployment with custom domain", passed: false },
          ],
        },
        {
          id: "role_match",
          title: "Role Match",
          subtitle: "Does it fit the job?",
          score: 70,
          weight: 30,
          shortVerdict: "Good React & Tailwind base. Missing global state management and accessibility audit.",
          checklist: [
            { label: "Modern React with Hooks", passed: true },
            { label: "Tailwind CSS responsive design", passed: true },
            { label: "Global state management (Zustand/Redux)", passed: false },
            { label: "Web accessibility (a11y ARIA attributes)", passed: false },
          ],
        },
        {
          id: "code_quality",
          title: "Code Quality",
          subtitle: "Is it tested and clean?",
          score: 62,
          weight: 20,
          shortVerdict: "Reusable UI components, but zero component tests (Playwright or Testing Library).",
          checklist: [
            { label: "Component separation and props interface", passed: true },
            { label: "React Testing Library / Vitest tests", passed: false },
            { label: "Lighthouse Performance score > 90", passed: true },
            { label: "Zero console errors on interaction", passed: true },
          ],
        },
        {
          id: "activity",
          title: "Activity",
          subtitle: "Did you code recently?",
          score: 65,
          weight: 20,
          shortVerdict: "Last pushed 19 days ago. Git history shows large bulk commits.",
          checklist: [
            { label: "Active in the last 30 days", passed: true },
            { label: "Atomic commit messages", passed: false },
            { label: "GitHub contribution streak active", passed: false },
            { label: "Open source contributions", passed: false },
          ],
        },
      ],
      skills: [
        {
          id: "f1",
          name: "React 19 & Next.js",
          category: "Framework",
          status: "Verified",
          reason: "Found in portfolio-v3 and habit-tracker repo with App Router structure.",
          evidence: "Repo: habit-tracker (App router, Server components)",
        },
        {
          id: "f2",
          name: "Tailwind CSS",
          category: "Framework",
          status: "Verified",
          reason: "Extensive custom theme configuration and responsive utility usage.",
          evidence: "Repo: habit-tracker /tailwind.config.ts",
        },
        {
          id: "f3",
          name: "TypeScript",
          category: "Language",
          status: "Verified",
          reason: "Strict type definitions for API responses and component props.",
          evidence: "Repo: habit-tracker /types",
        },
        {
          id: "f4",
          name: "State Management (Zustand / Redux)",
          category: "Architecture",
          status: "Unverified",
          reason: "Listed on resume under Frontend Core, but code relies solely on useState prop drilling.",
          evidence: "No store files or slice definitions found",
        },
        {
          id: "f5",
          name: "Component Testing (Vitest / RTL)",
          category: "Architecture",
          status: "Missing",
          reason: "Frontend hiring managers look for UI test confidence. 0 test files found.",
          evidence: "Required for senior and junior screening",
        },
        {
          id: "f6",
          name: "Accessibility (WCAG / ARIA)",
          category: "Architecture",
          status: "Missing",
          reason: "Buttons and interactive modals lack aria-labels and keyboard navigation traps.",
          evidence: "Found multiple naked button elements",
        },
      ],
      nextSteps: [
        {
          id: 1,
          title: "Add Zustand store to habit-tracker",
          detail: "Replace prop drilling with a lightweight Zustand store for active habits and user filters.",
          potentialGain: 8,
          completed: false,
        },
        {
          id: 2,
          title: "Add 4 component tests with React Testing Library",
          detail: "Test form validation triggers and render assertions when submitting a new habit item.",
          potentialGain: 9,
          completed: false,
        },
        {
          id: 3,
          title: "Audit and fix keyboard accessibility",
          detail: "Ensure dialogs close on Escape key and every interactive icon has a visible focus ring.",
          potentialGain: 7,
          completed: false,
        },
      ],
      repos: [
        {
          name: "habit-tracker",
          description: "Personal wellness dashboard with dark mode and streak calculations",
          language: "TypeScript",
          hasTests: false,
          hasCi: false,
          lastCommitDaysAgo: 19,
          stars: 8,
        },
        {
          name: "portfolio-v3",
          description: "Minimalist designer portfolio built with Next.js and smooth Framer transitions",
          language: "TypeScript",
          hasTests: false,
          hasCi: true,
          lastCommitDaysAgo: 24,
          stars: 15,
        },
      ],
    },
  },

  "ML Engineer": {
    candidateName: "Samir Khan",
    resumeFileName: "Samir_Khan_ML_AI.pdf",
    githubUrl: "https://github.com/samirkhan-ai",
    portfolioUrl: "https://samirkhan.dev",
    sampleResult: {
      role: "ML Engineer",
      candidateName: "Samir Khan",
      resumeFileName: "Samir_Khan_ML_AI.pdf",
      githubUrl: "https://github.com/samirkhan-ai",
      portfolioUrl: "https://samirkhan.dev",
      overallScore: 54,
      statusLabel: "Needs Work",
      statusDescription: "Good theoretical model exploration in Jupyter notebooks. Lacks model serving APIs, Docker, and CI/CD pipelines.",
      pillars: [
        {
          id: "proof_of_work",
          title: "Proof of Work",
          subtitle: "Did you build it?",
          score: 55,
          weight: 30,
          shortVerdict: "Mainly unversioned Jupyter notebooks. No production FastAPI model server found.",
          checklist: [
            { label: "Original dataset curation or preprocessing", passed: true },
            { label: "Packaged model weights with inference script", passed: true },
            { label: "Production REST endpoint (FastAPI/Flask)", passed: false },
            { label: "Containerized deployment with GPU/CPU benchmark", passed: false },
          ],
        },
        {
          id: "role_match",
          title: "Role Match",
          subtitle: "Does it fit the job?",
          score: 58,
          weight: 30,
          shortVerdict: "PyTorch and Scikit-Learn present. Missing data pipeline tools and model registry.",
          checklist: [
            { label: "Deep learning framework (PyTorch / JAX)", passed: true },
            { label: "Evaluation metrics (F1, precision-recall curve)", passed: true },
            { label: "Model serving / inference optimization (ONNX)", passed: false },
            { label: "MLOps tracking (MLflow / Weights & Biases)", passed: false },
          ],
        },
        {
          id: "code_quality",
          title: "Code Quality",
          subtitle: "Is it tested and clean?",
          score: 48,
          weight: 20,
          shortVerdict: "Monolithic notebook files without modular Python packages or pytest verification.",
          checklist: [
            { label: "Modular package structure (src/ folder)", passed: false },
            { label: "Unit tests for data sanitization", passed: false },
            { label: "Clean requirements.txt / pyproject.toml", passed: true },
            { label: "Reproducibility seed locked in code", passed: true },
          ],
        },
        {
          id: "activity",
          title: "Activity",
          subtitle: "Did you code recently?",
          score: 52,
          weight: 20,
          shortVerdict: "Sparse commits over the last 90 days. Repo updated in two large dumps.",
          checklist: [
            { label: "Active within the past 14 days", passed: false },
            { label: "Continuous commit log with branch PRs", passed: false },
            { label: "Documentation with reproducible setup steps", passed: true },
            { label: "Clean repository licensing", passed: true },
          ],
        },
      ],
      skills: [
        {
          id: "m1",
          name: "PyTorch & NumPy",
          category: "Framework",
          status: "Verified",
          reason: "Found in vision-classifier notebook with custom train loop and cross-entropy loss.",
          evidence: "Repo: vision-classifier /train.py",
        },
        {
          id: "m2",
          name: "Scikit-Learn & Pandas",
          category: "Framework",
          status: "Verified",
          reason: "Data preprocessing pipeline and classification reports verified in customer-churn.",
          evidence: "Repo: customer-churn-model",
        },
        {
          id: "m3",
          name: "FastAPI / Model Serving",
          category: "Infrastructure & Tools",
          status: "Unverified",
          reason: "Claimed on resume as 'FastAPI model backend', but zero app.py or routes found on GitHub.",
          evidence: "Notebook only; no HTTP endpoint found",
        },
        {
          id: "m4",
          name: "Docker Containerization",
          category: "Infrastructure & Tools",
          status: "Missing",
          reason: "ML Engineer roles require containerizing model inference to guarantee reproducibility.",
          evidence: "No Dockerfile found in any repository",
        },
        {
          id: "m5",
          name: "Model Evaluation & Drift Monitoring",
          category: "Architecture",
          status: "Missing",
          reason: "No automated evaluation scripts or pipeline metrics logged for edge cases.",
          evidence: "Needed to demonstrate production maturity",
        },
      ],
      nextSteps: [
        {
          id: 1,
          title: "Wrap vision-classifier in a FastAPI endpoint",
          detail: "Convert the notebook inference code into a clean main.py with POST /predict receiving an image file.",
          potentialGain: 12,
          completed: false,
        },
        {
          id: 2,
          title: "Add a minimal Dockerfile for model serving",
          detail: "Write a lightweight python:3.11-slim Dockerfile, test it locally, and push it to GitHub.",
          potentialGain: 9,
          completed: false,
        },
        {
          id: 3,
          title: "Add pytest for preprocessing functions",
          detail: "Write 3 unit tests verifying input image normalization and tensor dimension guards.",
          potentialGain: 8,
          completed: false,
        },
      ],
      repos: [
        {
          name: "vision-classifier",
          description: "Transfer learning on ResNet-50 for plant leaf disease detection",
          language: "Python / Jupyter",
          hasTests: false,
          hasCi: false,
          lastCommitDaysAgo: 42,
          stars: 4,
        },
        {
          name: "customer-churn-model",
          description: "Baseline XGBoost model predicting telecom subscriber churn",
          language: "Python",
          hasTests: false,
          hasCi: false,
          lastCommitDaysAgo: 58,
          stars: 3,
        },
      ],
    },
  },
};

export function generateCustomAssessment(
  role: TargetRole,
  candidateName: string,
  githubUrl: string,
  portfolioUrl: string,
  resumeFileName: string
): ReadinessResult {
  const base = PRESET_PROFILES[role].sampleResult;
  // Create a customized copy
  return {
    ...base,
    candidateName: candidateName || "Student Candidate",
    resumeFileName: resumeFileName || "Resume.pdf",
    githubUrl: githubUrl || "https://github.com/candidate",
    portfolioUrl: portfolioUrl || "https://candidate.dev",
    pillars: base.pillars.map((p) => ({
      ...p,
      checklist: p.checklist.map((c) => ({ ...c })),
    })),
    skills: base.skills.map((s) => ({ ...s })),
    nextSteps: base.nextSteps.map((n) => ({ ...n })),
    repos: base.repos.map((r) => ({ ...r })),
  };
}
