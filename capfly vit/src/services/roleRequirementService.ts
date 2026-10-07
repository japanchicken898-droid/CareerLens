/**
 * Role Requirement Service (Step 5)
 *
 * Provides role requirements from TWO sources:
 *   SOURCE A: Job Description text (parsed dynamically)
 *   SOURCE B: Configured role baseline (for known roles)
 *
 * All requirements are normalized using the existing skillNormalizer.
 * No hard-coded skill lists per student.
 */

import { normalizeSkillName } from "@/utils/skillNormalizer";
import type { RoleRequirement, RequirementImportance } from "@/types/skillGap";

// ── Baseline role requirements (configurable, extensible) ─────────
// These are the canonical known-role baselines. They are NOT student results.
// They represent what the industry generally expects for each role.
// Source: "role_baseline"

type BaselineRole = {
  required: string[];
  preferred: string[];
};

const ROLE_BASELINES: Record<string, BaselineRole> = {
  "backend developer": {
    required: ["Node.js", "Python", "REST APIs", "SQL", "PostgreSQL", "Git", "Docker"],
    preferred: ["Redis", "Kubernetes", "AWS", "CI/CD", "GraphQL", "TypeScript"],
  },
  "frontend developer": {
    required: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Git"],
    preferred: ["Next.js", "Tailwind CSS", "Redux", "Webpack", "Vitest", "Cypress", "Storybook"],
  },
  "full stack developer": {
    required: ["JavaScript", "TypeScript", "React", "Node.js", "REST APIs", "SQL", "Git"],
    preferred: ["Next.js", "PostgreSQL", "Docker", "Redis", "AWS", "Tailwind CSS", "CI/CD"],
  },
  "ml engineer": {
    required: ["Python", "Machine Learning", "PyTorch", "NumPy", "Pandas", "Git", "SQL"],
    preferred: ["TensorFlow", "scikit-learn", "MLOps", "Docker", "AWS", "Apache Spark", "FastAPI"],
  },
  "data scientist": {
    required: ["Python", "Machine Learning", "NumPy", "Pandas", "SQL", "Data Analysis"],
    preferred: ["TensorFlow", "PyTorch", "Apache Spark", "Tableau", "Power BI", "scikit-learn"],
  },
  "data engineer": {
    required: ["Python", "SQL", "Apache Spark", "Apache Kafka", "Apache Airflow", "Git"],
    preferred: ["AWS", "GCP", "Kubernetes", "Docker", "dbt", "PostgreSQL"],
  },
  "devops engineer": {
    required: ["Docker", "Kubernetes", "CI/CD", "Linux", "Git", "AWS", "Terraform"],
    preferred: ["Ansible", "Jenkins", "Nginx", "Prometheus", "Grafana", "Bash"],
  },
  "sde-1": {
    required: ["Data Structures", "Algorithms", "Git", "SQL", "REST APIs"],
    preferred: ["Docker", "CI/CD", "TypeScript", "Python", "Java", "System Design"],
  },
  "software development engineer": {
    required: ["Data Structures", "Algorithms", "Git", "SQL", "REST APIs"],
    preferred: ["Docker", "CI/CD", "TypeScript", "Python", "Java", "System Design"],
  },
  "software engineer": {
    required: ["Data Structures", "Algorithms", "Git", "SQL", "REST APIs"],
    preferred: ["Docker", "CI/CD", "TypeScript", "Python", "System Design"],
  },
};

// ── Job Description Skill Extraction Patterns ─────────────────────

// Section markers that indicate required vs preferred
const PREFERRED_MARKERS = [
  "nice to have", "preferred", "bonus", "plus", "good to have",
  "desirable", "advantageous", "optional", "would be a plus",
  "familiarity with", "exposure to", "knowledge of", "experience with would be a plus",
];

const REQUIRED_MARKERS = [
  "required", "must have", "must", "essential", "mandatory", "necessary",
  "you will need", "you must", "you should have", "candidates must",
  "minimum requirements",
];

// Skill token patterns — capture technology mentions from JD text
const SKILL_EXTRACTION_PATTERNS: Array<{ pattern: RegExp; canonical: string }> = [
  { pattern: /\b(react\.?js|reactjs|react)\b/i, canonical: "React" },
  { pattern: /\b(next\.?js|nextjs)\b/i, canonical: "Next.js" },
  { pattern: /\b(vue\.?js|vuejs|vue)\b/i, canonical: "Vue.js" },
  { pattern: /\b(angular\.?js|angularjs|angular)\b/i, canonical: "Angular" },
  { pattern: /\bsvelte\b/i, canonical: "Svelte" },
  { pattern: /\b(node\.?js|nodejs)\b/i, canonical: "Node.js" },
  { pattern: /\b(express\.?js|expressjs|express)\b/i, canonical: "Express.js" },
  { pattern: /\bfastapi\b/i, canonical: "FastAPI" },
  { pattern: /\bdjango\b/i, canonical: "Django" },
  { pattern: /\bflask\b/i, canonical: "Flask" },
  { pattern: /\bnestjs\b/i, canonical: "NestJS" },
  { pattern: /\bfastify\b/i, canonical: "Fastify" },
  { pattern: /\b(spring[\s-]?boot)\b/i, canonical: "Spring Boot" },
  { pattern: /\b(laravel)\b/i, canonical: "Laravel" },
  { pattern: /\b(rails|ruby[\s-]on[\s-]rails)\b/i, canonical: "Ruby on Rails" },
  { pattern: /\bpython\b/i, canonical: "Python" },
  { pattern: /\b(javascript|js)\b(?!on)/i, canonical: "JavaScript" },
  { pattern: /\btypescript\b/i, canonical: "TypeScript" },
  { pattern: /\bjava\b(?!\s*script)/i, canonical: "Java" },
  { pattern: /\b(c\+\+|cpp)\b/i, canonical: "C++" },
  { pattern: /\bc#\b/i, canonical: "C#" },
  { pattern: /\b(\.net|dotnet|asp\.net)\b/i, canonical: ".NET" },
  { pattern: /\b(go|golang)\b/i, canonical: "Go" },
  { pattern: /\brust\b/i, canonical: "Rust" },
  { pattern: /\bruby\b/i, canonical: "Ruby" },
  { pattern: /\bphp\b/i, canonical: "PHP" },
  { pattern: /\bkotlin\b/i, canonical: "Kotlin" },
  { pattern: /\bswift\b/i, canonical: "Swift" },
  { pattern: /\bscala\b/i, canonical: "Scala" },
  { pattern: /\bpostgres(?:ql)?\b/i, canonical: "PostgreSQL" },
  { pattern: /\bmysql\b/i, canonical: "MySQL" },
  { pattern: /\bmongodb\b/i, canonical: "MongoDB" },
  { pattern: /\bredis\b/i, canonical: "Redis" },
  { pattern: /\b(sqlite)\b/i, canonical: "SQLite" },
  { pattern: /\b(dynamodb)\b/i, canonical: "DynamoDB" },
  { pattern: /\b(cassandra)\b/i, canonical: "Cassandra" },
  { pattern: /\belasticsearch\b/i, canonical: "Elasticsearch" },
  { pattern: /\bfirebase\b/i, canonical: "Firebase" },
  { pattern: /\bsupabase\b/i, canonical: "Supabase" },
  { pattern: /\bneo4j\b/i, canonical: "Neo4j" },
  { pattern: /\b(sql)\b/i, canonical: "SQL" },
  { pattern: /\bdocker\b/i, canonical: "Docker" },
  { pattern: /\bkubernetes\b/i, canonical: "Kubernetes" },
  { pattern: /\bterraform\b/i, canonical: "Terraform" },
  { pattern: /\bansible\b/i, canonical: "Ansible" },
  { pattern: /\bjenkins\b/i, canonical: "Jenkins" },
  { pattern: /\b(github[\s-]?actions)\b/i, canonical: "GitHub Actions" },
  { pattern: /\b(ci\/cd|cicd)\b/i, canonical: "CI/CD" },
  { pattern: /\b(aws|amazon[\s-]web[\s-]services)\b/i, canonical: "AWS" },
  { pattern: /\b(gcp|google[\s-]cloud)\b/i, canonical: "GCP" },
  { pattern: /\bazure\b/i, canonical: "Azure" },
  { pattern: /\bnginx\b/i, canonical: "Nginx" },
  { pattern: /\blinux\b/i, canonical: "Linux" },
  { pattern: /\bbash\b/i, canonical: "Bash" },
  { pattern: /\b(graphql)\b/i, canonical: "GraphQL" },
  { pattern: /\bgrpc\b/i, canonical: "gRPC" },
  { pattern: /\b(rest[\s-]?api|restful)\b/i, canonical: "REST APIs" },
  { pattern: /\bgit\b/i, canonical: "Git" },
  { pattern: /\bpytorch\b/i, canonical: "PyTorch" },
  { pattern: /\btensorflow\b/i, canonical: "TensorFlow" },
  { pattern: /\bkeras\b/i, canonical: "Keras" },
  { pattern: /\b(scikit[\s-]learn|sklearn)\b/i, canonical: "scikit-learn" },
  { pattern: /\bpandas\b/i, canonical: "Pandas" },
  { pattern: /\bnumpy\b/i, canonical: "NumPy" },
  { pattern: /\b(machine[\s-]learning)\b/i, canonical: "Machine Learning" },
  { pattern: /\b(deep[\s-]learning)\b/i, canonical: "Deep Learning" },
  { pattern: /\b(nlp|natural[\s-]language[\s-]processing)\b/i, canonical: "NLP" },
  { pattern: /\b(computer[\s-]vision)\b/i, canonical: "Computer Vision" },
  { pattern: /\b(llm|large[\s-]language[\s-]model)/i, canonical: "LLM" },
  { pattern: /\bmlops\b/i, canonical: "MLOps" },
  { pattern: /\b(apache[\s-]spark|pyspark)\b/i, canonical: "Apache Spark" },
  { pattern: /\b(apache[\s-]kafka)\b/i, canonical: "Apache Kafka" },
  { pattern: /\b(apache[\s-]airflow|airflow)\b/i, canonical: "Apache Airflow" },
  { pattern: /\bdbt\b/i, canonical: "dbt" },
  { pattern: /\btailwind\b/i, canonical: "Tailwind CSS" },
  { pattern: /\bhtml\b/i, canonical: "HTML" },
  { pattern: /\bcss\b/i, canonical: "CSS" },
  { pattern: /\b(sass|scss)\b/i, canonical: "Sass" },
  { pattern: /\bredux\b/i, canonical: "Redux" },
  { pattern: /\bzustand\b/i, canonical: "Zustand" },
  { pattern: /\bwebpack\b/i, canonical: "Webpack" },
  { pattern: /\bvite\b/i, canonical: "Vite" },
  { pattern: /\bjest\b/i, canonical: "Jest" },
  { pattern: /\bvitest\b/i, canonical: "Vitest" },
  { pattern: /\bcypress\b/i, canonical: "Cypress" },
  { pattern: /\bplaywright\b/i, canonical: "Playwright" },
  { pattern: /\bpostman\b/i, canonical: "Postman" },
  { pattern: /\bfigma\b/i, canonical: "Figma" },
  { pattern: /\b(data[\s-]structures?)\b/i, canonical: "Data Structures" },
  { pattern: /\b(algorithms?)\b/i, canonical: "Algorithms" },
  { pattern: /\b(system[\s-]design)\b/i, canonical: "System Design" },
  { pattern: /\b(microservices?)\b/i, canonical: "Microservices" },
];

// ── JD Section Parser ─────────────────────────────────────────────

/**
 * Determine whether a paragraph/sentence is in a "preferred" section or "required" section.
 */
function detectSectionImportance(sectionText: string): RequirementImportance {
  const lower = sectionText.toLowerCase();
  if (PREFERRED_MARKERS.some((m) => lower.includes(m))) return "preferred";
  if (REQUIRED_MARKERS.some((m) => lower.includes(m))) return "required";
  return "required"; // Default to required
}

/**
 * Extract skills from job description text.
 * Returns requirements with importance (required/preferred) based on context.
 */
export function extractSkillsFromJobDescription(jdText: string): RoleRequirement[] {
  if (!jdText || jdText.trim().length < 30) return [];

  const requirements = new Map<string, RoleRequirement>();

  // Split into sections/paragraphs for context-aware parsing
  const sections = jdText.split(/\n{2,}|\r\n{2,}/);

  for (const section of sections) {
    const sectionImportance = detectSectionImportance(section);
    const lines = section.split(/\n|•|·|-|\*/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.length < 3) continue;

      for (const { pattern, canonical } of SKILL_EXTRACTION_PATTERNS) {
        if (pattern.test(trimmedLine)) {
          const existing = requirements.get(canonical);

          // Prefer "required" over "preferred" if the skill appears in both contexts
          if (!existing || (existing.importance === "preferred" && sectionImportance === "required")) {
            requirements.set(canonical, {
              rawRequirement: trimmedLine.length > 120 ? trimmedLine.slice(0, 120) + "…" : trimmedLine,
              normalizedSkill: canonical,
              source: "job_description",
              importance: sectionImportance,
              originalContext: trimmedLine,
            });
          }
        }
      }
    }
  }

  return Array.from(requirements.values());
}

// ── Role Baseline Fetcher ─────────────────────────────────────────

/**
 * Get baseline role requirements for a known role.
 * Returns empty array if role is not in baseline.
 */
export function getBaselineRequirements(targetRole: string): RoleRequirement[] {
  const roleKey = targetRole.trim().toLowerCase();

  // Try exact match first
  let baseline = ROLE_BASELINES[roleKey];

  // Try partial match if no exact match
  if (!baseline) {
    for (const [key, value] of Object.entries(ROLE_BASELINES)) {
      if (roleKey.includes(key) || key.includes(roleKey)) {
        baseline = value;
        break;
      }
    }
  }

  if (!baseline) return [];

  const result: RoleRequirement[] = [];

  for (const skill of baseline.required) {
    result.push({
      rawRequirement: skill,
      normalizedSkill: normalizeSkillName(skill),
      source: "role_baseline",
      importance: "required",
    });
  }

  for (const skill of baseline.preferred) {
    result.push({
      rawRequirement: skill,
      normalizedSkill: normalizeSkillName(skill),
      source: "role_baseline",
      importance: "preferred",
    });
  }

  return result;
}

// ── Combined Requirement Builder ──────────────────────────────────

/**
 * Get the final merged set of requirements for a student.
 *
 * Priority:
 * - If a JD is provided: extract from JD (primary)
 * - If role is known: add role_baseline requirements that are NOT already in JD
 * - Deduplicate by normalizedSkill
 */
export function buildRequirements(
  targetRole: string,
  jobDescription: string
): { requirements: RoleRequirement[]; source: "job_description" | "role_baseline" | "mixed"; warnings: string[] } {
  const warnings: string[] = [];

  const jdRequirements = extractSkillsFromJobDescription(jobDescription);
  const baselineRequirements = getBaselineRequirements(targetRole);

  // Determine which to use
  if (jdRequirements.length === 0 && baselineRequirements.length === 0) {
    warnings.push("No role requirements could be determined. Add a job description for a more precise analysis.");
    return { requirements: [], source: "role_baseline", warnings };
  }

  if (jdRequirements.length === 0) {
    return { requirements: baselineRequirements, source: "role_baseline", warnings };
  }

  if (baselineRequirements.length === 0) {
    if (jdRequirements.length < 3) {
      warnings.push("The job description contained very few recognizable technical skills. Results may be incomplete.");
    }
    return { requirements: jdRequirements, source: "job_description", warnings };
  }

  // Merge: JD is primary, add baseline skills not already captured
  const jdSkillSet = new Set(jdRequirements.map((r) => r.normalizedSkill.toLowerCase()));
  const merged = [...jdRequirements];

  for (const baseReq of baselineRequirements) {
    if (!jdSkillSet.has(baseReq.normalizedSkill.toLowerCase())) {
      merged.push(baseReq);
    }
  }

  return { requirements: merged, source: "mixed", warnings };
}
