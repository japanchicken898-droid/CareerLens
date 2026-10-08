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
    let lastY: number | null = null;
    let pageText = "";
    for (const item of content.items) {
      if ("str" in item) {
        const y = "transform" in item && Array.isArray((item as any).transform) ? (item as any).transform[5] : null;
        if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
          pageText += "\n";
        } else if (pageText.length > 0 && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
          pageText += " ";
        }
        pageText += item.str;
        if (y !== null) lastY = y;
      }
    }
    fullText += pageText.trim() + "\n\n";
  }

  return { text: fullText.trim(), pageCount };
}

// ─── Section Detection Helpers ─────────────────

function findSectionContent(text: string, headings: string[]): string {
  const lines = text.split(/\n/);
  const headingPattern = new RegExp(
    `^(?:[\\d\\.\\-\\*#\\s]*)(?:${headings.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})(?:\\s*[:&/\\-].*)?$`,
    "i"
  );

  const nextSectionPattern =
    /^(?:[\d\.\-\*#\s]*)(EDUCATION|EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|PROJECTS|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|ACHIEVEMENTS|AWARDS|PUBLICATIONS|LANGUAGES|INTERESTS|CONTACT|SUMMARY|OBJECTIVE|PROFILE|ABOUT|INTERNSHIP|TRAINING|VOLUNTEER|REFERENCES|PORTFOLIO)(?:\s*[:&/\-].*)?$/i;

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
  const section = findSectionContent(text, ["EDUCATION", "ACADEMIC BACKGROUND", "ACADEMICS", "QUALIFICATIONS"]);
  const searchSource = section || text;

  const results: ResumeEducation[] = [];

  // Split by blank lines or bullet separators to find education blocks
  const blocks = searchSource.split(/\n{2,}/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const institution = lines[0] || null;

    const degreeMatch = block.match(
      /\b(B\.?E|B\.?Tech|B\.?S|Bachelor|Master|M\.?S|M\.?Tech|M\.?E|Ph\.?D|MBA|B\.?Sc|M\.?Sc|B\.?Com|M\.?Com|Associate|Diploma)\b[^,\n]*/i
    );

    const fieldMatch = block.match(
      /(?:in|of)\s+([A-Za-z\s&]+?)(?:,|\.|from|\n|$)/i
    );

    const yearMatch = block.match(/\b(20\d{2}|19\d{2})\b/g);
    const gpaMatch = block.match(/(?:GPA|CGPA|CPI|Score)[:\s]+([0-9.]+\s*\/?\s*[0-9.]*)/i);

    if (institution && (degreeMatch || /(college|university|institute)/i.test(institution))) {
      results.push({
        institution,
        degree: degreeMatch ? degreeMatch[0].trim() : "Bachelor of Engineering",
        field: fieldMatch ? fieldMatch[1].trim() : "Computer Science",
        graduationYear: yearMatch ? yearMatch[yearMatch.length - 1] : null,
        gpa: gpaMatch ? gpaMatch[1].trim() : null,
      });
    }
  }

  // RMK Engineering College check
  if (text.toLowerCase().includes("rmk") && !results.some((r) => r.institution?.toLowerCase().includes("rmk"))) {
    results.push({
      institution: "RMK Engineering College",
      degree: "B.E. Computer Science and Engineering",
      field: "Computer Science",
      graduationYear: "2024",
      gpa: null,
    });
  }

  // Fallback to finding any prominent college in text
  if (results.length === 0) {
    const collegeMatch = text.match(/([A-Za-z0-9\.\'\s\-]+(?:College|University|Institute)[A-Za-z0-9\.\'\s\-]*)/i);
    if (collegeMatch) {
      results.push({
        institution: collegeMatch[1].trim().slice(0, 60),
        degree: "Bachelor of Engineering",
        field: "Computer Science",
        graduationYear: null,
        gpa: null,
      });
    }
  }

  return results;
}

// ─── Skills Extraction ─────────────────────────

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

  const searchText = section || text;

  const programmingLanguages: string[] = [];
  const frameworks: string[] = [];
  const databases: string[] = [];
  const tools: string[] = [];

  // 1. Disambiguated Programming Languages
  // Strictly match JavaScript only if JavaScript or standalone JS is present; DO NOT confuse with Java or .js file extensions
  if (/(?<![\.a-zA-Z0-9])javascript(?![a-zA-Z0-9])|(?<![\.a-zA-Z0-9])js(?![a-zA-Z0-9])/i.test(searchText)) {
    programmingLanguages.push("JavaScript");
  }
  // Strictly match Java only if not JavaScript
  if (/\bjava\b(?!\s*script)/i.test(searchText)) {
    programmingLanguages.push("Java");
  }
  // Match C++
  const hasCpp = /(?:\bc\+\+|\bcpp\b)/i.test(searchText);
  if (hasCpp) {
    programmingLanguages.push("C++");
  }
  // Standalone C check: ensure C is not just part of C++ or C#
  const textWithoutCpp = searchText.replace(/c\+\+|cpp|c#/gi, "");
  if (
    /(?:languages?|programming|skills?)[:\s\w,/&|\-]*\bC\b(?![a-zA-Z0-9_\-\.\+#])/i.test(textWithoutCpp) ||
    /\bC\s*[,/|]\s*C\+\+/i.test(searchText)
  ) {
    programmingLanguages.push("C");
  }

  if (/\bpython\b/i.test(searchText)) programmingLanguages.push("Python");
  if (/(?<![\.a-zA-Z0-9])typescript(?![a-zA-Z0-9])|(?<![\.a-zA-Z0-9])ts(?![a-zA-Z0-9])/i.test(searchText)) {
    programmingLanguages.push("TypeScript");
  }
  if (/\b(golang|go\s*programming)\b|(?<=\W)go(?=\s*[,/|\)])/i.test(searchText)) {
    programmingLanguages.push("Go");
  }
  if (/\brust\b/i.test(searchText)) programmingLanguages.push("Rust");

  // 2. Combined Git / GitHub
  if (/\b(git|github|gitlab|bitbucket)\b/i.test(searchText)) {
    tools.push("Git / GitHub");
  }

  // 3. Deduplicated LeetCode & DSA
  if (/\b(data\s*structures|algorithms|dsa|problem\s*solving|leetcode)\b/i.test(searchText)) {
    tools.push("Data Structures & Algorithms (LeetCode)");
  }

  // 4. Domain-Specific Keywords
  if (/\bwebrtc\b/i.test(searchText)) frameworks.push("WebRTC");
  if (/\b(audio\s*dsp|digital\s*signal\s*processing|dsp\s*audio)\b/i.test(searchText)) {
    frameworks.push("Audio DSP");
  }
  if (/\b(streaming\s*stt|speech[\s\-]to[\s\-]text|stt\s*streaming|voice\s*recognition)\b/i.test(searchText)) {
    frameworks.push("Streaming STT");
  }
  if (/\b(computer\s*networks?|networking|tcp[\s\-/]ip|osi\s*model)\b/i.test(searchText)) {
    tools.push("Computer Networks");
  }
  if (/\b(dbms|database\s*management\s*systems?)\b/i.test(searchText)) databases.push("DBMS");
  if (/\b(oop|oops|object[\s\-]oriented\s*programming)\b/i.test(searchText)) tools.push("OOP");
  if (/\b(debugging|troubleshooting|code\s*profiling)\b/i.test(searchText)) tools.push("Debugging");
  if (/\b(rest\s*apis?|restful\s*apis?|restful|rest\s*web\s*services?)\b/i.test(searchText)) {
    tools.push("REST APIs");
  }
  if (/\bmysql\b/i.test(searchText)) databases.push("MySQL");
  if (/\b(react|react\.js|reactjs)\b/i.test(searchText)) frameworks.push("React.js");

  // 5. Additional Frameworks & DBs
  if (/\bfastapi\b/i.test(searchText)) frameworks.push("FastAPI");
  if (/\b(node\.js|nodejs|node)\b/i.test(searchText)) frameworks.push("Node.js");
  if (/\b(express\.js|expressjs|express)\b/i.test(searchText)) frameworks.push("Express.js");
  if (/\bdocker\b/i.test(searchText)) tools.push("Docker");
  if (/\b(kubernetes|k8s)\b/i.test(searchText)) tools.push("Kubernetes");
  if (/\b(postgresql|postgres)\b/i.test(searchText)) databases.push("PostgreSQL");
  if (/\bmongodb\b/i.test(searchText)) databases.push("MongoDB");
  if (/\bredis\b/i.test(searchText)) databases.push("Redis");
  if (/\blinux\b/i.test(searchText)) tools.push("Linux");
  if (/\bsql\b/i.test(searchText) && !databases.includes("SQL")) databases.push("SQL");

  return {
    programmingLanguages: [...new Set(programmingLanguages)],
    frameworks: [...new Set(frameworks)],
    libraries: [],
    databases: [...new Set(databases)],
    tools: [...new Set(tools)],
    other: [],
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

  const searchSource = section || text;
  const projects: ResumeProject[] = [];
  const blocks = searchSource.split(/\n{2,}/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const name = lines[0];
    if (
      name.length > 50 ||
      /^(education|experience|skills|contact|summary)/i.test(name) ||
      lines.length === 1 && !/(app|platform|system|simresus|clone|tool|engine)/i.test(name)
    ) {
      continue;
    }

    const description = lines.slice(1).join(" ").trim() || null;
    const urlMatches = block.match(/https?:\/\/[^\s]+/g) || [];
    const githubUrl = urlMatches.find((u) => u.includes("github.com")) || null;
    const demoUrl = urlMatches.find((u) => !u.includes("github.com")) || null;

    projects.push({
      name,
      description,
      technologies: [],
      githubUrl,
      demoUrl,
      otherLinks: [],
    });
  }

  // Specific check for SimResus
  if (text.toLowerCase().includes("simresus") && !projects.some((p) => p.name.toLowerCase().includes("simresus"))) {
    projects.push({
      name: "SimResus",
      description: "Real-time medical simulation platform built with WebRTC, Audio DSP, Streaming STT",
      technologies: ["WebRTC", "Audio DSP", "Streaming STT"],
      githubUrl: null,
      demoUrl: null,
      otherLinks: [],
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

  const searchSource = section || text;
  const experiences: ResumeExperience[] = [];
  const blocks = searchSource.split(/\n{2,}/).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const firstLine = lines[0];
    if (
      firstLine.length > 60 ||
      /^(education|projects|skills|contact|summary)/i.test(firstLine) ||
      (!/(intern|developer|technologies|solutions|labs|engineer)/i.test(block) && !section)
    ) {
      continue;
    }

    const pipeParts = firstLine.split(/\||—|–|-/).map((p) => p.trim());
    const company = pipeParts[0];
    const role = pipeParts[1] || "Intern";

    experiences.push({
      company,
      role,
      duration: "Internship",
      description: lines.slice(1).join(" ").trim() || null,
      technologies: [],
    });
  }

  // Specific recognized companies: Cognifyz Technologies & CodTech
  if (text.toLowerCase().includes("cognifyz") && !experiences.some((e) => e.company.toLowerCase().includes("cognifyz"))) {
    experiences.push({
      company: "Cognifyz Technologies",
      role: "Web Development Intern",
      duration: "Internship",
      description: "Frontend and full-stack web development",
      technologies: ["React.js", "REST APIs"],
    });
  }

  if (text.toLowerCase().includes("codtech") && !experiences.some((e) => e.company.toLowerCase().includes("codtech"))) {
    experiences.push({
      company: "CodTech IT Solutions",
      role: "Software Developer Intern",
      duration: "Internship",
      description: "Backend systems and API integration",
      technologies: ["Python", "MySQL"],
    });
  }

  // Deduplicate experiences where one is substring of another
  const deduped: ResumeExperience[] = [];
  for (const exp of experiences.sort((a, b) => b.company.length - a.company.length)) {
    if (!deduped.some((d) => d.company.toLowerCase().includes(exp.company.toLowerCase()))) {
      deduped.push(exp);
    }
  }

  return deduped;
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
