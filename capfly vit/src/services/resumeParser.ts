/**
 * Resume Parser Service
 *
 * Extracts real text from a PDF File using pdfjs-dist (browser-side).
 * Identifies personal info, education, skills, projects, experience, etc.
 * Does NOT invent data. Missing sections = empty/null.
 * Does NOT verify or score anything.
 */

import type {
  ParsedResume,
  ResumePersonal,
  ResumeEducation,
  ResumeProject,
  ResumeExperience,
  ResumeCertification,
  ResumeSkills,
} from "@/types/extraction";

// ─── PDF Text Extraction ───────────────────────

async function extractTextFromPDF(file: File): Promise<{ text: string; pageCount: number }> {
  // Dynamic import to avoid SSR issues — pdfjs runs in browser only
  const pdfjs = await import("pdfjs-dist");

  // Set worker source — use the bundled worker from pdfjs-dist
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString();
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  const pageCount = pdf.numPages;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += pageText + "\n";
  }

  return { text: fullText.trim(), pageCount };
}

// ─── Section Detection Helpers ─────────────────

function findSectionContent(text: string, headings: string[]): string {
  const lines = text.split(/\n/);
  const headingPattern = new RegExp(
    `^(${headings.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\s*:?\\s*$`,
    "i"
  );

  const nextSectionPattern =
    /^(EDUCATION|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROJECTS|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|ACHIEVEMENTS|AWARDS|PUBLICATIONS|LANGUAGES|INTERESTS|CONTACT|SUMMARY|OBJECTIVE|PROFILE|ABOUT|INTERNSHIP|TRAINING|VOLUNTEER|REFERENCES|PORTFOLIO)\s*:?\s*$/i;

  let inSection = false;
  const contentLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inSection) contentLines.push("");
      continue;
    }

    if (headingPattern.test(trimmed)) {
      inSection = true;
      continue;
    }

    if (inSection && nextSectionPattern.test(trimmed) && !headingPattern.test(trimmed)) {
      break;
    }

    if (inSection) {
      contentLines.push(trimmed);
    }
  }

  return contentLines.join("\n").trim();
}

// ─── Personal Info Extraction ──────────────────

function extractPersonal(text: string): ResumePersonal {
  const emailMatch = text.match(/\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/);
  const phoneMatch = text.match(
    /(\+?\d[\s\-.]?\(?\d{3}\)?[\s\-.]?\d{3}[\s\-.]?\d{4}|\+\d{1,3}[\s\-]?\d{6,12})/
  );

  // Extract the first non-empty line that looks like a name (before email/phone/URLs appear)
  const lines = text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  let name: string | null = null;
  for (const line of lines.slice(0, 5)) {
    // Skip lines that look like contact info
    if (emailMatch && line.includes(emailMatch[0])) continue;
    if (phoneMatch && line.includes(phoneMatch[0])) continue;
    if (/https?:\/\//i.test(line)) continue;
    if (/linkedin|github|portfolio/i.test(line)) continue;
    if (line.length > 60) continue; // too long to be a name
    // A name: 2–5 words, mostly alphabetic
    if (/^[A-Za-z]+([\s\-'][A-Za-z]+){1,4}$/.test(line)) {
      name = line;
      break;
    }
  }

  // Location heuristic: a line with city/state pattern or common location cues
  const locationMatch = text.match(
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*(?:[A-Z]{2}|[A-Za-z]+))\b/
  );

  // Summary / objective
  const summarySection = findSectionContent(text, [
    "SUMMARY",
    "PROFESSIONAL SUMMARY",
    "OBJECTIVE",
    "CAREER OBJECTIVE",
    "PROFILE",
    "ABOUT",
  ]);

  return {
    name: name || null,
    email: emailMatch ? emailMatch[0] : null,
    phone: phoneMatch ? phoneMatch[0].trim() : null,
    location: locationMatch ? locationMatch[1] : null,
    summary: summarySection || null,
  };
}

// ─── Education Extraction ──────────────────────

function extractEducation(text: string): ResumeEducation[] {
  const section = findSectionContent(text, ["EDUCATION", "ACADEMIC BACKGROUND", "ACADEMICS"]);
  if (!section) return [];

  const results: ResumeEducation[] = [];

  // Split by blank lines or bullet separators to find education blocks
  const blocks = section.split(/\n{2,}/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // Institution: usually the longest or first prominent line
    const institution = lines[0] || null;

    // Degree detection
    const degreeMatch = block.match(
      /\b(B\.?E|B\.?Tech|B\.?S|Bachelor|Master|M\.?S|M\.?Tech|M\.?E|Ph\.?D|MBA|B\.?Sc|M\.?Sc|B\.?Com|M\.?Com|Associate|Diploma)\b[^,\n]*/i
    );

    // Field of study
    const fieldMatch = block.match(
      /(?:in|of)\s+([A-Za-z\s&]+?)(?:,|\.|from|\n|$)/i
    );

    // Graduation year
    const yearMatch = block.match(/\b(20\d{2}|19\d{2})\b/g);

    // GPA
    const gpaMatch = block.match(/(?:GPA|CGPA|CPI|Score)[:\s]+([0-9.]+\s*\/?\s*[0-9.]*)/i);

    results.push({
      institution,
      degree: degreeMatch ? degreeMatch[0].trim() : null,
      field: fieldMatch ? fieldMatch[1].trim() : null,
      graduationYear: yearMatch ? yearMatch[yearMatch.length - 1] : null,
      gpa: gpaMatch ? gpaMatch[1].trim() : null,
    });
  }

  return results;
}

// ─── Skills Extraction ─────────────────────────

const LANG_KEYWORDS = [
  "python", "javascript", "typescript", "java", "c", "c++", "c#", "go", "golang",
  "rust", "ruby", "swift", "kotlin", "scala", "php", "r", "matlab", "dart",
  "bash", "shell", "powershell", "perl", "lua", "haskell", "ocaml", "elixir",
  "clojure", "groovy", "julia", "solidity", "sql",
];

const FRAMEWORK_KEYWORDS = [
  "react", "vue", "angular", "svelte", "next.js", "nuxt", "gatsby", "remix",
  "node.js", "express", "fastify", "nestjs", "django", "flask", "fastapi",
  "spring", "spring boot", "laravel", "rails", "ruby on rails", ".net", "asp.net",
  "pytorch", "tensorflow", "keras", "scikit-learn", "pandas", "numpy",
  "flutter", "react native", "ionic",
];

const DB_KEYWORDS = [
  "mysql", "postgresql", "postgres", "sqlite", "mongodb", "redis", "cassandra",
  "dynamodb", "firebase", "supabase", "neo4j", "elasticsearch", "oracle",
  "mssql", "sql server", "mariadb",
];

const TOOL_KEYWORDS = [
  "git", "github", "gitlab", "docker", "kubernetes", "aws", "gcp", "azure",
  "terraform", "ansible", "jenkins", "github actions", "ci/cd", "nginx",
  "linux", "postman", "graphql", "rest", "figma", "jira", "webpack", "vite",
  "jest", "cypress", "playwright", "storybook",
];

function extractSkillsFromText(text: string): ResumeSkills {
  const section = findSectionContent(text, [
    "SKILLS",
    "TECHNICAL SKILLS",
    "CORE SKILLS",
    "SKILL SET",
    "TECHNOLOGIES",
    "TECH STACK",
    "TOOLS & TECHNOLOGIES",
    "TOOLS AND TECHNOLOGIES",
    "KEY SKILLS",
    "COMPETENCIES",
  ]);

  // Use skills section if found, else scan entire text
  const searchText = section || text;
  const lower = searchText.toLowerCase();

  const collect = (keywords: string[]): string[] => {
    const found: string[] = [];
    for (const kw of keywords) {
      // Match as whole word (with slight flexibility for punctuation)
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, "i");
      if (regex.test(lower)) {
        found.push(kw);
      }
    }
    return found;
  };

  // Also extract comma/bullet-separated items from the skills section
  const rawItems = section
    ? section
        .split(/[,|•\-\n\/]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 1 && s.length < 50)
    : [];

  const programmingLanguages = collect(LANG_KEYWORDS);
  const frameworks = collect(FRAMEWORK_KEYWORDS);
  const databases = collect(DB_KEYWORDS);
  const tools = collect(TOOL_KEYWORDS);

  // "Other" = items from raw skills section that didn't match known categories
  const knownLower = [...programmingLanguages, ...frameworks, ...databases, ...tools].map((k) =>
    k.toLowerCase()
  );
  const other = rawItems.filter(
    (item) =>
      item.length > 1 &&
      !knownLower.includes(item.toLowerCase()) &&
      !/^\d+$/.test(item)
  );

  return {
    programmingLanguages,
    frameworks,
    libraries: [], // Can't reliably distinguish libraries vs frameworks from text alone
    databases,
    tools,
    other: [...new Set(other)].slice(0, 30), // cap at 30 misc items
  };
}

// ─── Projects Extraction ───────────────────────

function extractProjects(text: string): ResumeProject[] {
  const section = findSectionContent(text, [
    "PROJECTS",
    "PERSONAL PROJECTS",
    "ACADEMIC PROJECTS",
    "SIDE PROJECTS",
    "KEY PROJECTS",
    "NOTABLE PROJECTS",
  ]);

  if (!section) return [];

  const projects: ResumeProject[] = [];
  // Split on blank lines
  const blocks = section.split(/\n{2,}/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const name = lines[0];
    const description = lines.slice(1).join(" ").trim() || null;

    // URLs in this block
    const urlMatches = block.match(/https?:\/\/[^\s]+/g) || [];
    const githubUrl = urlMatches.find((u) => u.includes("github.com")) || null;
    const demoUrl = urlMatches.find((u) => !u.includes("github.com")) || null;
    const otherLinks = urlMatches.filter((u) => u !== githubUrl && u !== demoUrl);

    // Technologies mentioned
    const blockLower = block.toLowerCase();
    const techs: string[] = [];
    for (const kw of [...LANG_KEYWORDS, ...FRAMEWORK_KEYWORDS, ...DB_KEYWORDS, ...TOOL_KEYWORDS]) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, "i").test(blockLower)) {
        techs.push(kw);
      }
    }

    projects.push({
      name,
      description,
      technologies: [...new Set(techs)],
      githubUrl,
      demoUrl,
      otherLinks,
    });
  }

  return projects;
}

// ─── Experience Extraction ─────────────────────

function extractExperience(text: string): ResumeExperience[] {
  const section = findSectionContent(text, [
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "EMPLOYMENT",
    "PROFESSIONAL EXPERIENCE",
    "INTERNSHIP",
    "INTERNSHIPS",
    "TRAINING",
    "INDUSTRY EXPERIENCE",
  ]);

  if (!section) return [];

  const experiences: ResumeExperience[] = [];
  const blocks = section.split(/\n{2,}/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    // First line: usually "Company | Role" or just company name
    const firstLine = lines[0];
    const pipeParts = firstLine.split(/\||—|–|-/).map((p) => p.trim());
    const company = pipeParts[0];
    const role = pipeParts[1] || null;

    // Duration: look for date patterns
    const durationMatch = block.match(
      /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|January|February|March|April|June|July|August|September|October|November|December)[\s,]+\d{4}/gi
    );
    const duration = durationMatch ? durationMatch.join(" – ") : null;

    const description = lines.slice(1).join(" ").trim() || null;

    const blockLower = block.toLowerCase();
    const techs: string[] = [];
    for (const kw of [...LANG_KEYWORDS, ...FRAMEWORK_KEYWORDS, ...DB_KEYWORDS, ...TOOL_KEYWORDS]) {
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, "i").test(blockLower)) {
        techs.push(kw);
      }
    }

    experiences.push({
      company,
      role,
      duration,
      description,
      technologies: [...new Set(techs)],
    });
  }

  return experiences;
}

// ─── Certifications Extraction ─────────────────

function extractCertifications(text: string): ResumeCertification[] {
  const section = findSectionContent(text, [
    "CERTIFICATIONS",
    "CERTIFICATES",
    "LICENSES",
    "COURSES",
    "ONLINE COURSES",
    "PROFESSIONAL CERTIFICATIONS",
  ]);

  if (!section) return [];

  const certs: ResumeCertification[] = [];
  const lines = section.split("\n").map((l) => l.trim()).filter(Boolean);

  for (const line of lines) {
    const yearMatch = line.match(/\b(20\d{2}|19\d{2})\b/);
    const issuerMatch = line.match(/(?:by|from|–|-|—)\s*([A-Z][A-Za-z\s]+)/);
    const name = line.replace(/\b(20\d{2}|19\d{2})\b/, "").replace(/(?:by|from)\s*[A-Z][A-Za-z\s]+/, "").trim();

    certs.push({
      name,
      issuer: issuerMatch ? issuerMatch[1].trim() : null,
      year: yearMatch ? yearMatch[0] : null,
    });
  }

  return certs;
}

// ─── Achievements Extraction ───────────────────

function extractAchievements(text: string): string[] {
  const section = findSectionContent(text, [
    "ACHIEVEMENTS",
    "AWARDS",
    "HONORS",
    "HONOURS",
    "ACCOMPLISHMENTS",
    "PUBLICATIONS",
    "HACKATHONS",
    "COMPETITIONS",
    "EXTRA-CURRICULAR",
    "EXTRACURRICULAR",
    "ACTIVITIES",
  ]);

  if (!section) return [];

  return section
    .split("\n")
    .map((l) => l.replace(/^[•\-*]\s*/, "").trim())
    .filter((l) => l.length > 3)
    .slice(0, 20);
}

// ─── Links Extraction ──────────────────────────

function extractLinks(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s<>"',)]+/g) || [];
  // Also match bare github.com/... or linkedin.com/... patterns
  const bareMatches = text.match(/(?:github\.com|linkedin\.com|bitbucket\.org)\/[^\s<>"',)]+/g) || [];
  const all = [...matches, ...bareMatches.map((m) => `https://${m}`)];
  return [...new Set(all)].slice(0, 30);
}

// ─── Public API ────────────────────────────────

export async function parseResume(file: File): Promise<ParsedResume> {
  const empty: ParsedResume = {
    extractedText: "",
    isTextBased: false,
    personal: { name: null, email: null, phone: null, location: null, summary: null },
    education: [],
    skills: { programmingLanguages: [], frameworks: [], libraries: [], databases: [], tools: [], other: [] },
    projects: [],
    experience: [],
    certifications: [],
    achievements: [],
    links: [],
    parseError: null,
  };

  try {
    const { text } = await extractTextFromPDF(file);

    if (!text || text.replace(/\s/g, "").length < 50) {
      return {
        ...empty,
        extractedText: text,
        isTextBased: false,
        parseError:
          "Unable to extract readable text from this PDF. It may be a scanned or image-based PDF. Please upload a text-based PDF resume.",
      };
    }

    return {
      extractedText: text,
      isTextBased: true,
      personal: extractPersonal(text),
      education: extractEducation(text),
      skills: extractSkillsFromText(text),
      projects: extractProjects(text),
      experience: extractExperience(text),
      certifications: extractCertifications(text),
      achievements: extractAchievements(text),
      links: extractLinks(text),
      parseError: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ...empty,
      parseError: `Failed to parse PDF: ${message}`,
    };
  }
}
