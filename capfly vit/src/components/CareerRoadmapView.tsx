"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Check,
  CheckCircle2,
  Circle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Info,
  X,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Layers,
  ChevronRight,
} from "lucide-react";
import type { ExamResult } from "@/types/exam";
import type { ExtractedProfile } from "@/types/extraction";

interface CareerRoadmapViewProps {
  examResult: ExamResult | null;
  extractedProfile: ExtractedProfile | null;
  onTakeExam?: () => void;
  darkMode?: boolean;
  groqRoadmapSteps?: string[];
  groqSummary?: string;
}

export type NodeStatus = "pending" | "learning" | "finished" | "skipped";

export interface RoadmapSubtopic {
  id: string;
  title: string;
  side: "left" | "right";
  isRecommended?: boolean;
  isAlternative?: boolean;
  description?: string;
}

export interface RoadmapMilestone {
  id: string;
  title: string;
  isKey?: boolean;
  description: string;
  subtopics: RoadmapSubtopic[];
}

export interface CareerTrackData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  milestones: RoadmapMilestone[];
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE-SPECIFIC DETAILED ROADMAPS (roadmap.sh curriculum)
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_ROADMAPS: Record<string, CareerTrackData> = {
  frontend: {
    id: "frontend",
    title: "Frontend Developer",
    subtitle: "Step by step guide to becoming a modern frontend developer in 2026",
    badge: "DEMAND CRITICAL",
    milestones: [
      {
        id: "fe-internet",
        title: "Internet",
        isKey: true,
        description: "Foundational protocols and browser architecture that power the web.",
        subtopics: [
          {
            id: "fe-how-internet",
            title: "How does the internet work?",
            side: "right",
            isRecommended: true,
            description: "Packets, routers, ISP routing, TCP/IP fundamentals.",
          },
          {
            id: "fe-http",
            title: "What is HTTP?",
            side: "right",
            isRecommended: true,
            description: "HTTP/1.1, HTTP/2, HTTP/3, headers, status codes & verbs.",
          },
          {
            id: "fe-domain",
            title: "What is Domain Name?",
            side: "right",
            description: "DNS resolution, TLDs, domain registrars, and root servers.",
          },
          {
            id: "fe-hosting",
            title: "What is hosting?",
            side: "right",
            description: "Static hosting, serverless edge, CDNs, and web servers.",
          },
          {
            id: "fe-dns",
            title: "DNS and how it works?",
            side: "right",
            isRecommended: true,
            description: "A records, CNAME, NS records, DNS caching and propagation.",
          },
          {
            id: "fe-browsers",
            title: "Browsers and how they work?",
            side: "right",
            isRecommended: true,
            description: "DOM tree, CSSOM, Render tree, layout, painting and compositor.",
          },
        ],
      },
      {
        id: "fe-html",
        title: "HTML",
        isKey: true,
        description: "The standard markup language for document structure.",
        subtopics: [
          {
            id: "fe-html-basics",
            title: "HTML Basics & Syntax",
            side: "left",
            isRecommended: true,
            description: "Tags, attributes, page structure, and document hierarchy.",
          },
          {
            id: "fe-semantic-html",
            title: "Semantic HTML",
            side: "left",
            isRecommended: true,
            description: "<article>, <section>, <nav>, <header>, <main>, <footer>.",
          },
          {
            id: "fe-forms",
            title: "Forms and Validations",
            side: "right",
            isRecommended: true,
            description: "Input types, native constraint validation, FormData API.",
          },
          {
            id: "fe-accessibility",
            title: "Accessibility (a11y)",
            side: "right",
            isRecommended: true,
            description: "WCAG guidelines, ARIA attributes, semantic landmarks & focus.",
          },
          {
            id: "fe-seo-basics",
            title: "SEO Basics",
            side: "left",
            description: "Meta tags, Open Graph, schema.org, robots.txt, sitemaps.",
          },
        ],
      },
      {
        id: "fe-css",
        title: "CSS",
        isKey: true,
        description: "Styling the web, responsive layouts, and modern CSS architecture.",
        subtopics: [
          {
            id: "fe-css-basics",
            title: "CSS Selectors & Specificity",
            side: "left",
            isRecommended: true,
            description: "Box model, cascade, inheritance, specificity calculations.",
          },
          {
            id: "fe-flexbox",
            title: "Flexbox Layout",
            side: "left",
            isRecommended: true,
            description: "1D layout model, main axis, cross axis, justify & align.",
          },
          {
            id: "fe-grid",
            title: "CSS Grid",
            side: "right",
            isRecommended: true,
            description: "2D layout model, grid template areas, minmax(), auto-fit.",
          },
          {
            id: "fe-responsive",
            title: "Responsive Design & Media Queries",
            side: "right",
            isRecommended: true,
            description: "Mobile-first layout, viewport meta, container queries.",
          },
          {
            id: "fe-variables",
            title: "CSS Custom Properties (Variables)",
            side: "left",
            description: "Dynamic theming, dark mode toggles, calc() functions.",
          },
        ],
      },
      {
        id: "fe-javascript",
        title: "JavaScript",
        isKey: true,
        description: "Programming language of the web for dynamic behavior and logic.",
        subtopics: [
          {
            id: "fe-js-syntax",
            title: "Syntax & ES6+ Constructs",
            side: "left",
            isRecommended: true,
            description: "Let/const, destructuring, arrow functions, template literals.",
          },
          {
            id: "fe-dom",
            title: "DOM Manipulation & Events",
            side: "left",
            isRecommended: true,
            description: "querySelector, event bubbling, event delegation, mutation.",
          },
          {
            id: "fe-fetch-ajax",
            title: "Fetch API & Async / Await",
            side: "right",
            isRecommended: true,
            description: "Promises, async/await, try/catch, HTTP request handling.",
          },
          {
            id: "fe-event-loop",
            title: "Event Loop & Concurrency",
            side: "right",
            isRecommended: true,
            description: "Call stack, microtasks queue, macrotasks, setTimeout.",
          },
          {
            id: "fe-modules",
            title: "ES Modules (import / export)",
            side: "left",
            description: "Module scope, static vs dynamic imports, tree-shaking.",
          },
        ],
      },
      {
        id: "fe-vcs",
        title: "Version Control",
        isKey: false,
        description: "Tracking changes and collaborating on codebases with Git.",
        subtopics: [
          {
            id: "fe-git",
            title: "Git Basics & CLI",
            side: "left",
            isRecommended: true,
            description: "git init, add, commit, push, pull, branch, checkout.",
          },
          {
            id: "fe-branching",
            title: "Branching & Merge Conflicts",
            side: "left",
            description: "Feature branches, rebase vs merge, resolving conflict diffs.",
          },
        ],
      },
      {
        id: "fe-vcs-hosting",
        title: "VCS Hosting",
        isKey: false,
        description: "Remote cloud platforms for repository hosting and code review.",
        subtopics: [
          {
            id: "fe-github",
            title: "GitHub",
            side: "left",
            isRecommended: true,
            description: "Repositories, Pull Requests, Issues, Actions, GitHub Pages.",
          },
          {
            id: "fe-gitlab",
            title: "GitLab",
            side: "left",
            isAlternative: true,
            description: "Self-hosted repos, pipelines, merge request reviews.",
          },
        ],
      },
      {
        id: "fe-pkg-managers",
        title: "Package Managers",
        isKey: false,
        description: "Installing, sharing, and updating third-party libraries.",
        subtopics: [
          {
            id: "fe-npm",
            title: "npm",
            side: "right",
            isRecommended: true,
            description: "package.json, lockfile, dependencies vs devDependencies.",
          },
          {
            id: "fe-pnpm",
            title: "pnpm",
            side: "right",
            isRecommended: true,
            description: "Fast, disk-efficient package manager with hard links.",
          },
          {
            id: "fe-yarn",
            title: "yarn",
            side: "right",
            isAlternative: true,
            description: "Workspaces, zero-installs, yarn berry.",
          },
          {
            id: "fe-bun",
            title: "Bun",
            side: "right",
            isAlternative: true,
            description: "Ultra-fast all-in-one JavaScript runtime & package manager.",
          },
        ],
      },
      {
        id: "fe-frameworks",
        title: "Pick a Framework",
        isKey: true,
        description: "Component-driven architectures for complex UI applications.",
        subtopics: [
          {
            id: "fe-react",
            title: "React",
            side: "left",
            isRecommended: true,
            description: "JSX, Hooks (useState, useEffect), Virtual DOM, component state.",
          },
          {
            id: "fe-nextjs",
            title: "Next.js (App Router)",
            side: "left",
            isRecommended: true,
            description: "Server Components (RSC), SSR, SSG, nested layouts, API routes.",
          },
          {
            id: "fe-vue",
            title: "Vue.js",
            side: "left",
            isAlternative: true,
            description: "Composition API, Single File Components, Pinia state.",
          },
          {
            id: "fe-svelte",
            title: "Svelte",
            side: "left",
            isAlternative: true,
            description: "Compile-time framework, zero virtual DOM, reactive stores.",
          },
        ],
      },
      {
        id: "fe-modern-css",
        title: "Modern CSS & Tooling",
        isKey: false,
        description: "Utility CSS and design systems for enterprise styling.",
        subtopics: [
          {
            id: "fe-tailwind",
            title: "Tailwind CSS",
            side: "right",
            isRecommended: true,
            description: "Utility-first CSS, JIT engine, theme config, responsive variants.",
          },
          {
            id: "fe-css-modules",
            title: "CSS Modules",
            side: "right",
            description: "Locally scoped class names to prevent style leakage.",
          },
        ],
      },
      {
        id: "fe-build-tools",
        title: "Build Tools",
        isKey: false,
        description: "Bundlers, compilers, and local developer development servers.",
        subtopics: [
          {
            id: "fe-vite",
            title: "Vite",
            side: "left",
            isRecommended: true,
            description: "Lightning-fast ESM dev server and Rollup production bundling.",
          },
          {
            id: "fe-turbopack",
            title: "Turbopack",
            side: "left",
            description: "Rust-powered incremental bundler optimized for Next.js.",
          },
        ],
      },
      {
        id: "fe-testing",
        title: "Testing Apps",
        isKey: true,
        description: "Ensuring code correctness, preventing regressions, and UI testing.",
        subtopics: [
          {
            id: "fe-vitest-jest",
            title: "Vitest / Jest",
            side: "right",
            isRecommended: true,
            description: "Unit testing, test suites, mocks, spies, and coverage reports.",
          },
          {
            id: "fe-rtl",
            title: "React Testing Library",
            side: "right",
            isRecommended: true,
            description: "User-centric component testing using accessibility roles.",
          },
          {
            id: "fe-playwright",
            title: "Playwright (E2E)",
            side: "right",
            isRecommended: true,
            description: "Headless cross-browser end-to-end automation and traces.",
          },
        ],
      },
    ],
  },

  backend: {
    id: "backend",
    title: "Backend Developer",
    subtitle: "Step by step guide to becoming a modern backend developer in 2026",
    badge: "DEMAND CRITICAL",
    milestones: [
      {
        id: "be-internet",
        title: "Internet & Networking",
        isKey: true,
        description: "Core networking protocols and transport layers.",
        subtopics: [
          {
            id: "be-http",
            title: "HTTP / HTTPS & SSL/TLS",
            side: "left",
            isRecommended: true,
            description: "Handshakes, certificates, HTTP methods, headers, status codes.",
          },
          {
            id: "be-dns",
            title: "DNS & IP Addressing",
            side: "left",
            isRecommended: true,
            description: "IPv4 vs IPv6, ports, sockets, DNS resolution loop.",
          },
          {
            id: "be-websockets",
            title: "WebSockets & SSE",
            side: "right",
            isRecommended: true,
            description: "Full-duplex persistent connections and server-sent events.",
          },
          {
            id: "be-tcp",
            title: "TCP/IP vs UDP",
            side: "right",
            description: "Reliable stream transport vs low-latency packet datagrams.",
          },
        ],
      },
      {
        id: "be-os",
        title: "OS & Terminal",
        isKey: false,
        description: "Operating system internals, process execution, and Linux CLI.",
        subtopics: [
          {
            id: "be-linux",
            title: "Linux Command Line Basics",
            side: "left",
            isRecommended: true,
            description: "Bash, grep, curl, ssh, permissions (chmod/chown), pipe streams.",
          },
          {
            id: "be-threads",
            title: "Process & Thread Management",
            side: "right",
            isRecommended: true,
            description: "Concurrency, parallelism, CPU scheduling, thread safety.",
          },
          {
            id: "be-io",
            title: "Memory & I/O Management",
            side: "left",
            description: "RAM, virtual memory, disk I/O, non-blocking asynchronous I/O.",
          },
        ],
      },
      {
        id: "be-language",
        title: "Pick a Backend Language",
        isKey: true,
        description: "Choosing your primary language for server-side business logic.",
        subtopics: [
          {
            id: "be-nodejs",
            title: "Node.js / TypeScript",
            side: "left",
            isRecommended: true,
            description: "V8 engine, libuv event loop, Express / Fastify, strict typing.",
          },
          {
            id: "be-python",
            title: "Python (FastAPI / Django)",
            side: "left",
            isRecommended: true,
            description: "Asyncio, Pydantic data validation, type hints, ORMs.",
          },
          {
            id: "be-go",
            title: "Go (Golang)",
            side: "right",
            isRecommended: true,
            description: "Goroutines, channels, fast compile times, high throughput.",
          },
          {
            id: "be-java",
            title: "Java / Spring Boot",
            side: "right",
            isAlternative: true,
            description: "Enterprise JVM, dependency injection, JPA/Hibernate.",
          },
        ],
      },
      {
        id: "be-rdbms",
        title: "Relational Databases",
        isKey: true,
        description: "Structured data storage with ACID transaction guarantees.",
        subtopics: [
          {
            id: "be-postgres",
            title: "PostgreSQL",
            side: "left",
            isRecommended: true,
            description: "Advanced SQL, JSONB support, indexing (B-Tree, GIN), schemas.",
          },
          {
            id: "be-mysql",
            title: "MySQL",
            side: "left",
            isAlternative: true,
            description: "InnoDB engine, replication, binary logs, relational joins.",
          },
          {
            id: "be-indexes",
            title: "Database Indexing & Query Plans",
            side: "right",
            isRecommended: true,
            description: "EXPLAIN ANALYZE, index selectivity, composite indexes.",
          },
          {
            id: "be-acid",
            title: "ACID & Transactions",
            side: "right",
            isRecommended: true,
            description: "Atomicity, Consistency, Isolation levels, Durability, locks.",
          },
        ],
      },
      {
        id: "be-nosql",
        title: "NoSQL & Caching",
        isKey: true,
        description: "High-throughput unstructured storage and low-latency in-memory cache.",
        subtopics: [
          {
            id: "be-redis",
            title: "Redis In-Memory Store",
            side: "left",
            isRecommended: true,
            description: "Key-value caching, TTL eviction, Pub/Sub, sorted sets, locks.",
          },
          {
            id: "be-mongo",
            title: "MongoDB",
            side: "right",
            isRecommended: true,
            description: "Document model, aggregation pipelines, collections, indexing.",
          },
          {
            id: "be-cache-strat",
            title: "Caching Strategies",
            side: "right",
            isRecommended: true,
            description: "Cache-aside, write-through, cache stampede mitigation.",
          },
        ],
      },
      {
        id: "be-apis",
        title: "APIs & Web Services",
        isKey: true,
        description: "Exposing secure, standardized interfaces for client consumption.",
        subtopics: [
          {
            id: "be-rest",
            title: "RESTful API Design",
            side: "left",
            isRecommended: true,
            description: "Idempotency, resource URLs, content negotiation, pagination.",
          },
          {
            id: "be-auth",
            title: "Authentication & JWT",
            side: "left",
            isRecommended: true,
            description: "Bearer tokens, refresh tokens, bcrypt hashing, OAuth 2.0 / OIDC.",
          },
          {
            id: "be-graphql",
            title: "GraphQL",
            side: "right",
            isAlternative: true,
            description: "Queries, mutations, resolvers, avoiding N+1 with DataLoader.",
          },
          {
            id: "be-grpc",
            title: "gRPC & Protocol Buffers",
            side: "right",
            isAlternative: true,
            description: "HTTP/2 binary microservice RPC communication.",
          },
        ],
      },
      {
        id: "be-containers",
        title: "CI/CD & Containers",
        isKey: true,
        description: "Packaging applications for predictable environments and deployments.",
        subtopics: [
          {
            id: "be-docker",
            title: "Docker & Containerization",
            side: "left",
            isRecommended: true,
            description: "Multi-stage Dockerfile, container layers, environment variables.",
          },
          {
            id: "be-compose",
            title: "Docker Compose",
            side: "left",
            isRecommended: true,
            description: "Orchestrating local API, database, and Redis multi-container setups.",
          },
          {
            id: "be-actions",
            title: "GitHub Actions CI/CD",
            side: "right",
            isRecommended: true,
            description: "Automated linting, test execution on pull request, build deployment.",
          },
        ],
      },
      {
        id: "be-architecture",
        title: "Architecture & Queues",
        isKey: false,
        description: "Decoupled asynchronous processing and horizontal scalability.",
        subtopics: [
          {
            id: "be-queues",
            title: "Message Queues (RabbitMQ / Kafka)",
            side: "right",
            isRecommended: true,
            description: "Producers, consumers, message acknowledgements, event streams.",
          },
          {
            id: "be-microservices",
            title: "Microservices vs Monolith",
            side: "left",
            description: "Modular monoliths, service boundaries, API gateways.",
          },
        ],
      },
    ],
  },

  fullstack: {
    id: "fullstack",
    title: "Full-Stack Engineer",
    subtitle: "Complete pathway bridging client interfaces, server APIs, and databases",
    badge: "DEMAND CRITICAL",
    milestones: [
      {
        id: "fs-frontend",
        title: "Frontend Foundations",
        isKey: true,
        description: "Building responsive, modern, user-friendly client applications.",
        subtopics: [
          {
            id: "fs-html-css",
            title: "HTML5 & Tailwind CSS",
            side: "left",
            isRecommended: true,
            description: "Semantic layouts, responsive utility classes, flexbox/grid.",
          },
          {
            id: "fs-js-ts",
            title: "JavaScript & TypeScript",
            side: "left",
            isRecommended: true,
            description: "ES6+, static type interfaces, async programming.",
          },
          {
            id: "fs-react",
            title: "React & Next.js App Router",
            side: "right",
            isRecommended: true,
            description: "Server components, state management, client hydration.",
          },
        ],
      },
      {
        id: "fs-backend",
        title: "Backend & Server Architecture",
        isKey: true,
        description: "Robust business logic, controllers, and data validation.",
        subtopics: [
          {
            id: "fs-node-api",
            title: "Node.js & Express / Route Handlers",
            side: "left",
            isRecommended: true,
            description: "REST endpoints, middleware, error handling, rate limiting.",
          },
          {
            id: "fs-auth",
            title: "JWT Authentication & Session Security",
            side: "right",
            isRecommended: true,
            description: "HTTP-only cookies, password hashing with bcrypt, role-based access.",
          },
        ],
      },
      {
        id: "fs-data",
        title: "Databases & ORM",
        isKey: true,
        description: "Persisting data with relational integrity and rapid query access.",
        subtopics: [
          {
            id: "fs-postgres",
            title: "PostgreSQL & Prisma ORM",
            side: "left",
            isRecommended: true,
            description: "Schema migrations, relational foreign keys, type-safe queries.",
          },
          {
            id: "fs-redis",
            title: "Redis In-Memory Caching",
            side: "right",
            isRecommended: true,
            description: "API response caching, session store, rate-limiter counters.",
          },
        ],
      },
      {
        id: "fs-devops",
        title: "DevOps & Cloud Deployments",
        isKey: false,
        description: "Shipping applications safely to cloud production environments.",
        subtopics: [
          {
            id: "fs-docker",
            title: "Docker Containerization",
            side: "left",
            isRecommended: true,
            description: "Containerizing frontend, API backend, and local database services.",
          },
          {
            id: "fs-cloud",
            title: "Vercel / AWS Cloud Deployment",
            side: "right",
            isRecommended: true,
            description: "Environment variables, production build pipelines, SSL domains.",
          },
        ],
      },
    ],
  },

  datascience: {
    id: "datascience",
    title: "Data Scientist / ML Engineer",
    subtitle: "Step by step pathway from mathematical foundations to deployed AI models",
    badge: "DEMAND HIGH",
    milestones: [
      {
        id: "ds-math",
        title: "Mathematics & Statistics",
        isKey: true,
        description: "Theoretical underpinnings of machine learning algorithms.",
        subtopics: [
          {
            id: "ds-linear-algebra",
            title: "Linear Algebra (Vectors & Matrices)",
            side: "left",
            isRecommended: true,
            description: "Matrix multiplications, eigenvalues, eigenvectors, dot products.",
          },
          {
            id: "ds-calculus",
            title: "Multivariate Calculus & Gradients",
            side: "left",
            isRecommended: true,
            description: "Partial derivatives, gradient descent, chain rule.",
          },
          {
            id: "ds-stats",
            title: "Probability & Hypothesis Testing",
            side: "right",
            isRecommended: true,
            description: "Bayes theorem, normal distributions, p-values, confidence intervals.",
          },
        ],
      },
      {
        id: "ds-python",
        title: "Python & Data Wrangling",
        isKey: true,
        description: "The core programming stack for tabular and array computations.",
        subtopics: [
          {
            id: "ds-numpy",
            title: "NumPy Array Operations",
            side: "left",
            isRecommended: true,
            description: "N-dimensional arrays, broadcasting, vectorization, indexing.",
          },
          {
            id: "ds-pandas",
            title: "Pandas DataFrames & Cleaning",
            side: "left",
            isRecommended: true,
            description: "Data filtering, groupby, handling nulls, joining datasets.",
          },
          {
            id: "ds-viz",
            title: "Matplotlib & Seaborn Visualizations",
            side: "right",
            isRecommended: true,
            description: "Histograms, scatter plots, correlation heatmaps, box plots.",
          },
        ],
      },
      {
        id: "ds-ml",
        title: "Machine Learning (Scikit-Learn)",
        isKey: true,
        description: "Supervised and unsupervised models on structured datasets.",
        subtopics: [
          {
            id: "ds-regression",
            title: "Regression & Classification",
            side: "left",
            isRecommended: true,
            description: "Linear/logistic regression, decision trees, random forests, XGBoost.",
          },
          {
            id: "ds-eval",
            title: "Model Evaluation & Cross-Validation",
            side: "right",
            isRecommended: true,
            description: "Precision, recall, F1-score, ROC-AUC, K-Fold validation.",
          },
        ],
      },
      {
        id: "ds-deep-learning",
        title: "Deep Learning (PyTorch)",
        isKey: true,
        description: "Neural network architectures for unstructured perception tasks.",
        subtopics: [
          {
            id: "ds-pytorch",
            title: "PyTorch Tensors & Autograd",
            side: "left",
            isRecommended: true,
            description: "Custom training loops, loss functions, Adam optimizer.",
          },
          {
            id: "ds-transformers",
            title: "Transformers & Attention Mechanisms",
            side: "right",
            isRecommended: true,
            description: "Self-attention, Hugging Face transformers, BERT & GPT models.",
          },
        ],
      },
      {
        id: "ds-mlops",
        title: "MLOps & LLM Deployment",
        isKey: false,
        description: "Serving models as reliable production REST endpoints and RAG apps.",
        subtopics: [
          {
            id: "ds-fastapi",
            title: "FastAPI Model Inference Server",
            side: "left",
            isRecommended: true,
            description: "POST /predict endpoint receiving tensors/images, batching.",
          },
          {
            id: "ds-rag",
            title: "RAG & Vector Databases",
            side: "right",
            isRecommended: true,
            description: "Embeddings, cosine similarity, ChromaDB / Pinecone, LangChain.",
          },
        ],
      },
    ],
  },

  cloud: {
    id: "cloud",
    title: "Cloud Architect",
    subtitle: "Design, deploy, and scale highly available distributed cloud infrastructure",
    badge: "DEMAND CRITICAL",
    milestones: [
      {
        id: "cl-linux-net",
        title: "Linux & Cloud Networking",
        isKey: true,
        description: "System administration and VPC network topology.",
        subtopics: [
          {
            id: "cl-linux-admin",
            title: "Linux System Administration",
            side: "left",
            isRecommended: true,
            description: "Systemd services, journalctl, network interfaces, firewall rules.",
          },
          {
            id: "cl-vpc",
            title: "VPC, Subnets & CIDR Blocks",
            side: "right",
            isRecommended: true,
            description: "Public/private subnets, NAT gateways, route tables, internet gateways.",
          },
        ],
      },
      {
        id: "cl-aws",
        title: "AWS Core Cloud Services",
        isKey: true,
        description: "Foundational compute, storage, database, and security primitives.",
        subtopics: [
          {
            id: "cl-ec2-s3",
            title: "AWS EC2, S3 & Load Balancers (ALB)",
            side: "left",
            isRecommended: true,
            description: "Auto-scaling groups, target groups, object storage lifecycle.",
          },
          {
            id: "cl-iam",
            title: "IAM Roles, Policies & Least Privilege",
            side: "right",
            isRecommended: true,
            description: "Role assumption, permission boundaries, resource-based policies.",
          },
        ],
      },
      {
        id: "cl-k8s",
        title: "Containers & Kubernetes",
        isKey: true,
        description: "Container orchestration at scale.",
        subtopics: [
          {
            id: "cl-docker",
            title: "Docker Container Hardening",
            side: "left",
            isRecommended: true,
            description: "Non-root users, minimal Alpine/scratch bases, vulnerability scanning.",
          },
          {
            id: "cl-k8s-core",
            title: "Kubernetes (Pods, Deployments, Ingress)",
            side: "right",
            isRecommended: true,
            description: "Cluster architecture, ConfigMaps, Secrets, Horizontal Pod Autoscaler.",
          },
        ],
      },
      {
        id: "cl-iac",
        title: "Infrastructure as Code (Terraform)",
        isKey: true,
        description: "Declarative cloud provisioning with reproducible state.",
        subtopics: [
          {
            id: "cl-terraform",
            title: "Terraform Modules & Remote State",
            side: "left",
            isRecommended: true,
            description: "S3 remote backend, state locking with DynamoDB, plan/apply lifecycles.",
          },
          {
            id: "cl-monitoring",
            title: "Prometheus & Grafana Observability",
            side: "right",
            isRecommended: true,
            description: "Metrics scraping, alertmanager rules, cluster dashboards.",
          },
        ],
      },
    ],
  },

  cybersecurity: {
    id: "cybersecurity",
    title: "Cybersecurity Analyst",
    subtitle: "Protect systems, networks, and data through defensive analysis and penetration testing",
    badge: "DEMAND HIGH",
    milestones: [
      {
        id: "sec-network",
        title: "Networking & Protocols",
        isKey: true,
        description: "Packet analysis, transport protocols, and perimeter security.",
        subtopics: [
          {
            id: "sec-wireshark",
            title: "Wireshark Packet Analysis",
            side: "left",
            isRecommended: true,
            description: "TCP streams, SYN floods, unencrypted protocol inspection, pcap captures.",
          },
          {
            id: "sec-firewalls",
            title: "Firewalls, IDS / IPS & WAF",
            side: "right",
            isRecommended: true,
            description: "Packet filtering, stateful inspection, Snort signatures, reverse proxies.",
          },
        ],
      },
      {
        id: "sec-soc",
        title: "Security Operations & SIEM",
        isKey: true,
        description: "Log aggregation, threat monitoring, and incident response.",
        subtopics: [
          {
            id: "sec-siem",
            title: "Splunk / ELK Security Logging",
            side: "left",
            isRecommended: true,
            description: "Querying audit logs, correlation searches, anomaly alerts.",
          },
          {
            id: "sec-ir",
            title: "Incident Response & NIST Framework",
            side: "right",
            isRecommended: true,
            description: "Identification, containment, eradication, recovery, lessons learned.",
          },
        ],
      },
      {
        id: "sec-pen-testing",
        title: "Ethical Hacking & Web Security",
        isKey: true,
        description: "Offensive vulnerability assessment and penetration testing.",
        subtopics: [
          {
            id: "sec-owasp",
            title: "OWASP Top 10 Vulnerabilities",
            side: "left",
            isRecommended: true,
            description: "SQL Injection, XSS, CSRF, SSRF, Broken Object Level Auth.",
          },
          {
            id: "sec-burp",
            title: "Burp Suite & Nmap Reconnaissance",
            side: "right",
            isRecommended: true,
            description: "Intercepting HTTP proxies, port scanning, service version banner grabbing.",
          },
        ],
      },
      {
        id: "sec-crypto",
        title: "Cryptography & Identity Access",
        isKey: false,
        description: "Encryption standards, PKI certificates, and zero-trust authentication.",
        subtopics: [
          {
            id: "sec-pki",
            title: "Public Key Infrastructure (PKI) & TLS",
            side: "left",
            isRecommended: true,
            description: "RSA, Elliptic Curves, Certificate Authorities, digital signatures.",
          },
          {
            id: "sec-iam",
            title: "Active Directory & Zero Trust",
            side: "right",
            isRecommended: true,
            description: "Kerberos, LDAP, Principle of Least Privilege, Multi-Factor Auth (MFA).",
          },
        ],
      },
    ],
  },
};

export const CareerRoadmapView: React.FC<CareerRoadmapViewProps> = ({
  extractedProfile,
  onTakeExam,
  darkMode = false,
  groqRoadmapSteps,
  groqSummary,
}) => {
  const dk = darkMode;

  // Resolve user's preferred track based on Step 1 profile
  const initialTrackKey = useMemo(() => {
    const rawRole = (extractedProfile?.profile.targetRole || "").toLowerCase();
    if (rawRole.includes("front")) return "frontend";
    if (rawRole.includes("back")) return "backend";
    if (rawRole.includes("full") || rawRole.includes("stack") || rawRole.includes("sde"))
      return "fullstack";
    if (rawRole.includes("data") || rawRole.includes("machine") || rawRole.includes("ml"))
      return "datascience";
    if (rawRole.includes("cloud")) return "cloud";
    if (rawRole.includes("cyber") || rawRole.includes("sec")) return "cybersecurity";
    return "frontend"; // default fallback
  }, [extractedProfile]);

  const [selectedRoleKey, setSelectedRoleKey] = useState<string>(initialTrackKey);

  // Active track object
  const activeTrack = ROLE_ROADMAPS[selectedRoleKey] || ROLE_ROADMAPS.frontend;

  // State storage for topic completion states: "pending" | "learning" | "finished" | "skipped"
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, NodeStatus>>({});
  const [activePopoverNode, setActivePopoverNode] = useState<{
    id: string;
    title: string;
    description: string;
  } | null>(null);

  // Load progress from localStorage on mount or track switch
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`careerlens_roadmap_${selectedRoleKey}`);
        if (saved) {
          setNodeStatuses(JSON.parse(saved));
        } else {
          setNodeStatuses({});
        }
      } catch {
        // Fallback
      }
    }
  }, [selectedRoleKey]);

  // Persist status updates to localStorage
  const updateNodeStatus = (nodeId: string, status: NodeStatus) => {
    setNodeStatuses((prev) => {
      const next = { ...prev, [nodeId]: status };
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(`careerlens_roadmap_${selectedRoleKey}`, JSON.stringify(next));
        } catch {
          // Ignore
        }
      }
      return next;
    });
    setActivePopoverNode(null);
  };

  // Reset all progress for current track
  const handleResetTrackProgress = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`careerlens_roadmap_${selectedRoleKey}`);
      } catch {
        // Ignore
      }
    }
    setNodeStatuses({});
  };

  // Calculate stats & progress percentages across all nodes in the active track
  const { totalNodes, finishedCount, learningCount, skippedCount, progressPercentage } =
    useMemo(() => {
      let count = 0;
      let finished = 0;
      let learning = 0;
      let skipped = 0;

      activeTrack.milestones.forEach((m) => {
        count++; // Milestone node itself
        const mStatus = nodeStatuses[m.id];
        if (mStatus === "finished") finished++;
        else if (mStatus === "learning") learning++;
        else if (mStatus === "skipped") skipped++;

        m.subtopics.forEach((sub) => {
          count++;
          const subStatus = nodeStatuses[sub.id];
          if (subStatus === "finished") finished++;
          else if (subStatus === "learning") learning++;
          else if (subStatus === "skipped") skipped++;
        });
      });

      const effectiveDone = finished + skipped;
      const pct = count > 0 ? Math.round((effectiveDone / count) * 100) : 0;

      return {
        totalNodes: count,
        finishedCount: finished,
        learningCount: learning,
        skippedCount: skipped,
        progressPercentage: pct,
      };
    }, [activeTrack, nodeStatuses]);

  // Dynamic progress stage label matching roadmap.sh
  const progressStage = useMemo(() => {
    if (progressPercentage >= 90) return { label: "Complete", color: "text-emerald-700 font-bold" };
    if (progressPercentage >= 60) return { label: "Almost There", color: "text-blue-700 font-bold" };
    if (progressPercentage >= 25) return { label: "Halfway", color: "text-amber-700 font-bold" };
    return { label: `Getting Started (${progressPercentage}%)`, color: "text-[#B8532F] font-bold" };
  }, [progressPercentage]);

  // Helper to render card styling based on node status (Learning = Violet, Finish = Strike-out, Skip = Green Strike-out)
  const getNodeStyling = (
    nodeId: string,
    isKeyMilestone: boolean = false,
    hasVioletBorder: boolean = false
  ) => {
    const status = nodeStatuses[nodeId] || "pending";

    if (status === "learning") {
      // TURNS VIOLET as requested
      return {
        cardClass:
          "bg-[#E9D5FF] text-[#581C87] border-2 border-[#7C3AED] shadow-[2px_2px_0px_#7C3AED] font-semibold",
        badge: (
          <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
            ✓
          </span>
        ),
      };
    }

    if (status === "finished") {
      // STRIKE OUT as requested
      return {
        cardClass:
          "bg-[#F4F4F5] text-[#71717A] border-2 border-[#A1A1AA] line-through decoration-2 decoration-[#24201D] shadow-[2px_2px_0px_#D4D4D8]",
        badge: (
          <span className="w-4 h-4 rounded-full bg-[#71717A] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
            ✓
          </span>
        ),
      };
    }

    if (status === "skipped") {
      // GREEN STRIKE OUT as requested (exactly matching roadmap.sh image)
      return {
        cardClass:
          "bg-[#D1FAE5] text-[#065F46] border-2 border-[#059669] line-through decoration-2 decoration-[#059669] shadow-[2px_2px_0px_#A7F3D0]",
        badge: (
          <span className="w-4 h-4 rounded-full bg-[#059669] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
            ✓
          </span>
        ),
      };
    }

    // Default pending states
    if (isKeyMilestone) {
      return {
        cardClass:
          "bg-[#FEF08A] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] font-bold hover:bg-[#FDE047]",
        badge: null,
      };
    }

    if (hasVioletBorder) {
      return {
        cardClass:
          "bg-[#FFFFFF] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] font-medium hover:border-[#7C3AED]",
        badge: (
          <span className="w-3.5 h-3.5 rounded-full border border-[#7C3AED] text-[#7C3AED] flex items-center justify-center text-[9px] shrink-0">
            ●
          </span>
        ),
      };
    }

    return {
      cardClass:
        "bg-[#FFFFFF] text-[#18181B] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] font-medium hover:bg-[#FAF8F5]",
      badge: null,
    };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-300">
      {/* ─── Groq LLM 3-Step Action Plan (if backend generated) ────────── */}
      {groqRoadmapSteps && groqRoadmapSteps.length > 0 && (
        <div className="paper-card p-5 sm:p-6 bg-[#FFFFFF] border-2 border-[#D6CEBE] rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#EFECE6]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F3E8FF] text-[#7C3AED] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#24201D]">
                    Groq LLM 3-Step Action Plan
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F3E8FF] text-[#7C3AED] border border-[#DDD6FE] font-bold">
                    llama-3.3-70b-versatile
                  </span>
                </div>
                <p className="text-xs text-[#6E6659] mt-0.5">
                  Direct action items to eliminate your highest-priority readiness gaps
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-medium text-[#2E6B47] bg-[#EDF7F0] border border-[#A3D9B1] px-2.5 py-1 rounded-full self-start sm:self-center">
              ✓ AI Prioritized
            </span>
          </div>

          {groqSummary && (
            <p className="text-xs sm:text-sm text-[#4A4036] bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E8E2D5] italic">
              &ldquo;{groqSummary}&rdquo;
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
            {groqRoadmapSteps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#D8B4FE] bg-[#FAF5FF] flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold text-[#6B21A8] bg-[#E9D5FF] px-2 py-0.5 rounded-full">
                    Action {idx + 1}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-[#7C3AED]" />
                </div>
                <p className="text-xs font-semibold text-[#24201D] leading-relaxed">
                  {step.replace(/^\d+\.\s*/, "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Top Role Track Selector Tabs ─────────────────────────────────── */}
      <div className="paper-card p-4 sm:p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D7] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              <h2 className="text-sm sm:text-base font-bold text-[#24201D]">
                Select Target Career Track
              </h2>
            </div>
            <p className="text-xs text-[#6E6659]">
              The interactive roadmap will load the exact curriculum tailored to the selected role.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-[#8A7E6C]">
              Active: <strong className="text-[#24201D]">{activeTrack.title}</strong>
            </span>
          </div>
        </div>

        {/* Track Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {Object.values(ROLE_ROADMAPS).map((track) => {
            const isSelected = track.id === selectedRoleKey;
            return (
              <button
                key={track.id}
                type="button"
                onClick={() => setSelectedRoleKey(track.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? "bg-[#24201D] text-[#FAF8F5] shadow-xs scale-102"
                    : "bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#6E6659] hover:text-[#24201D] border border-[#D6CEBE]"
                }`}
              >
                <span>{track.title}</span>
                {isSelected && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Roadmap.sh Title & Interactive Progress Bar ──────────────────── */}
      <div className="paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#24201D]">
              {activeTrack.title} Roadmap
            </h1>
            <p className="text-xs text-[#6E6659] mt-0.5">{activeTrack.subtitle}</p>
          </div>

          <button
            type="button"
            onClick={handleResetTrackProgress}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-mono text-[#6E6659] hover:text-[#991B1B] bg-[#FAF8F5] hover:bg-[#FEE2E2] px-3 py-1.5 rounded-xl border border-[#D6CEBE] transition-colors cursor-pointer"
            title="Reset progress on this track"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Progress</span>
          </button>
        </div>

        {/* 4-Stage Progress Bar (roadmap.sh exact style) */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className={progressStage.color}>{progressStage.label}</span>
            <span className="text-[#8A7E6C]">
              {finishedCount + skippedCount} of {totalNodes} topics completed ({progressPercentage}%)
            </span>
          </div>

          <div className="w-full bg-[#E5E5E5] h-3 rounded-full overflow-hidden flex">
            {/* Finished slice */}
            <div
              className="bg-[#24201D] h-full transition-all duration-300"
              style={{ width: `${(finishedCount / totalNodes) * 100}%` }}
              title={`${finishedCount} Finished`}
            />
            {/* Learning slice (Violet) */}
            <div
              className="bg-[#7C3AED] h-full transition-all duration-300"
              style={{ width: `${(learningCount / totalNodes) * 100}%` }}
              title={`${learningCount} In Progress`}
            />
            {/* Skipped slice (Green) */}
            <div
              className="bg-[#059669] h-full transition-all duration-300"
              style={{ width: `${(skippedCount / totalNodes) * 100}%` }}
              title={`${skippedCount} Skipped`}
            />
          </div>

          {/* Quick Counter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] font-mono">
            <span className="inline-flex items-center gap-1 text-[#24201D]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#24201D]" />
              <strong>{finishedCount}</strong> Finished (Strike-out)
            </span>
            <span className="inline-flex items-center gap-1 text-[#7C3AED]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
              <strong>{learningCount}</strong> Learning (Violet)
            </span>
            <span className="inline-flex items-center gap-1 text-[#059669]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
              <strong>{skippedCount}</strong> Skipped (Green Strike-out)
            </span>
          </div>
        </div>

        {/* Legend Box matching Image 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] text-xs text-[#5A5144]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>Personal Recommendation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#059669] text-white flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>Alternative Option</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-[#E5E5E5] text-[#52525B] flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>Order not strict on roadmap</span>
          </div>
        </div>
      </div>

      {/* ─── Interactive Roadmap Tree Graph Canvas ─────────────────────────── */}
      <div className="paper-card p-6 sm:p-10 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm relative overflow-hidden">
        {/* Instruction Banner */}
        <div className="text-center pb-8 border-b border-dashed border-[#D6CEBE]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#D6CEBE] text-xs font-mono text-[#6E6659]">
            <Info className="w-3.5 h-3.5 text-[#24201D]" />
            Click any node to mark: 🟣 Learning (Violet) • ⬛ Finish (Strike-out) • 🟩 Skip (Green Strike-out)
          </span>
        </div>

        {/* Tree Container with Central Vertical Spine Line */}
        <div className="relative max-w-3xl mx-auto pt-8">
          {/* Vertical central dotted guide line */}
          <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-[2px] border-l-2 border-dotted border-[#18181B] pointer-events-none z-0" />

          {/* Render Milestones sequentially down the tree */}
          <div className="space-y-12 relative z-10">
            {activeTrack.milestones.map((milestone) => {
              const mStyle = getNodeStyling(milestone.id, milestone.isKey);
              const leftSubtopics = milestone.subtopics.filter((s) => s.side === "left");
              const rightSubtopics = milestone.subtopics.filter((s) => s.side !== "left");

              return (
                <div key={milestone.id} className="relative flex flex-col items-center">
                  {/* Central Milestone Box */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() =>
                        setActivePopoverNode({
                          id: milestone.id,
                          title: milestone.title,
                          description: milestone.description,
                        })
                      }
                      className={`px-6 py-2.5 rounded-lg text-sm transition-all cursor-pointer flex items-center justify-center gap-2 select-none min-w-[190px] sm:min-w-[220px] ${mStyle.cardClass}`}
                    >
                      <span>{milestone.title}</span>
                      {mStyle.badge}
                    </button>
                  </div>

                  {/* Lateral Subtopic Branches (Left & Right) */}
                  {(leftSubtopics.length > 0 || rightSubtopics.length > 0) && (
                    <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-12 mt-4 pt-1">
                      {/* Left Branches Column */}
                      <div className="flex flex-col items-center sm:items-end space-y-3">
                        {leftSubtopics.map((sub) => {
                          const subStyle = getNodeStyling(
                            sub.id,
                            false,
                            sub.isRecommended
                          );

                          return (
                            <div
                              key={sub.id}
                              className="relative flex items-center justify-end w-full max-w-[280px]"
                            >
                              {/* Horizontal dotted connector to spine */}
                              <div className="hidden sm:block absolute right-[-24px] w-[24px] border-t-2 border-dotted border-[#18181B] pointer-events-none" />

                              <button
                                type="button"
                                onClick={() =>
                                  setActivePopoverNode({
                                    id: sub.id,
                                    title: sub.title,
                                    description: sub.description || "",
                                  })
                                }
                                className={`w-full px-3.5 py-2 rounded-lg text-xs text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${subStyle.cardClass}`}
                              >
                                <span className="leading-snug">{sub.title}</span>
                                {subStyle.badge}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Right Branches Column */}
                      <div className="flex flex-col items-center sm:items-start space-y-3">
                        {rightSubtopics.map((sub) => {
                          const subStyle = getNodeStyling(
                            sub.id,
                            false,
                            sub.isRecommended
                          );

                          return (
                            <div
                              key={sub.id}
                              className="relative flex items-center justify-start w-full max-w-[280px]"
                            >
                              {/* Horizontal dotted connector to spine */}
                              <div className="hidden sm:block absolute left-[-24px] w-[24px] border-t-2 border-dotted border-[#18181B] pointer-events-none" />

                              <button
                                type="button"
                                onClick={() =>
                                  setActivePopoverNode({
                                    id: sub.id,
                                    title: sub.title,
                                    description: sub.description || "",
                                  })
                                }
                                className={`w-full px-3.5 py-2 rounded-lg text-xs text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${subStyle.cardClass}`}
                              >
                                <span className="leading-snug">{sub.title}</span>
                                {subStyle.badge}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Node Interactive Status Modal / Popover ──────────────────────── */}
      {activePopoverNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="paper-card p-6 bg-[#FAF8F5] border-2 border-[#18181B] rounded-2xl shadow-xl max-w-md w-full space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#D6CEBE] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#7C3AED]">
                  Interactive Topic Action
                </span>
                <h3 className="text-base font-extrabold text-[#18181B] mt-0.5">
                  {activePopoverNode.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePopoverNode(null)}
                className="p-1 rounded-lg text-[#8A7E6C] hover:text-[#24201D] hover:bg-[#E8E2D7] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Topic Description */}
            {activePopoverNode.description && (
              <p className="text-xs text-[#5A5144] leading-relaxed bg-[#FFFFFF] p-3 rounded-xl border border-[#D6CEBE]">
                {activePopoverNode.description}
              </p>
            )}

            {/* Current Status Indicator */}
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#8A7E6C]">Current State:</span>
              <span className="font-bold text-[#24201D] uppercase">
                {nodeStatuses[activePopoverNode.id] || "Pending (Not Started)"}
              </span>
            </div>

            {/* 3 Core Action Buttons requested by user */}
            <div className="space-y-2 pt-1">
              {/* 1. Learning (Turns Violet) */}
              <button
                type="button"
                onClick={() => updateNodeStatus(activePopoverNode.id, "learning")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#E9D5FF] hover:bg-[#DDD6FE] text-[#581C87] border-2 border-[#7C3AED] text-xs font-bold transition-all shadow-[2px_2px_0px_#7C3AED] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" />
                  <span>Mark as Learning</span>
                </div>
                <span className="font-mono text-[10px] uppercase font-semibold text-[#7C3AED]">
                  Turns Violet 🟣
                </span>
              </button>

              {/* 2. Finish (Strike-out) */}
              <button
                type="button"
                onClick={() => updateNodeStatus(activePopoverNode.id, "finished")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#F4F4F5] hover:bg-[#E4E4E7] text-[#24201D] border-2 border-[#71717A] text-xs font-bold transition-all shadow-[2px_2px_0px_#71717A] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#24201D]" />
                  <span>Mark as Finished</span>
                </div>
                <span className="font-mono text-[10px] uppercase font-semibold text-[#52525B]">
                  Strike-out ⬛
                </span>
              </button>

              {/* 3. Skip (Green Strike-out) */}
              <button
                type="button"
                onClick={() => updateNodeStatus(activePopoverNode.id, "skipped")}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#D1FAE5] hover:bg-[#A7F3D0] text-[#065F46] border-2 border-[#059669] text-xs font-bold transition-all shadow-[2px_2px_0px_#059669] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                  <span>Mark as Skip</span>
                </div>
                <span className="font-mono text-[10px] uppercase font-semibold text-[#059669]">
                  Green Strike-out 🟩
                </span>
              </button>
            </div>

            {/* Reset option */}
            <div className="pt-2 border-t border-[#D6CEBE] flex items-center justify-between">
              <button
                type="button"
                onClick={() => updateNodeStatus(activePopoverNode.id, "pending")}
                className="text-xs font-mono text-[#8A7E6C] hover:text-[#24201D] underline cursor-pointer"
              >
                Reset to Default Pending
              </button>

              <button
                type="button"
                onClick={() => setActivePopoverNode(null)}
                className="px-3.5 py-1.5 rounded-xl bg-[#24201D] text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Bottom CTA Banner ────────────────────────────────────────────── */}
      <div className="paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[#24201D]">
            Validate your roadmap knowledge with our Protected Assessment
          </h4>
          <p className="text-xs text-[#6E6659] mt-0.5">
            Take the timed anti-cheat coding and DSA exam to objectively test what you have learned.
          </p>
        </div>

        {onTakeExam && (
          <button
            type="button"
            onClick={onTakeExam}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#24201D] hover:bg-[#3D3732] active:bg-[#181513] text-[#FAF8F5] font-semibold text-sm shadow-sm transition-all hover:translate-y-[-1px] cursor-pointer shrink-0"
          >
            <span>Take Protected DSA Exam →</span>
          </button>
        )}
      </div>
    </div>
  );
};
