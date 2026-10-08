// ─────────────────────────────────────────────
// STEP 2 — Real Data Extraction Types
// No scores. No verification. Evidence only.
// ─────────────────────────────────────────────

/** Where a piece of evidence came from */
export type DataSource = "resume" | "github" | "portfolio" | "linkedin" | "leetcode";

/** A single normalized skill with its source and raw text preserved */
export interface NormalizedSkill {
  raw: string;          // exactly as it appeared
  normalized: string;  // canonical name for later comparison
  source: DataSource;
  evidence?: {
    repository?: string;
    language?: string;
    context?: string;   // sentence/bullet the skill appeared in
  };
}

// ─── Resume ───────────────────────────────────

export interface ResumePersonal {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  summary: string | null;
}

export interface ResumeEducation {
  institution: string | null;
  degree: string | null;
  field: string | null;
  graduationYear: string | null;
  gpa: string | null;
}

export interface ResumeProject {
  name: string;
  description: string | null;
  technologies: string[];
  githubUrl: string | null;
  demoUrl: string | null;
  otherLinks: string[];
}

export interface ResumeExperience {
  company: string;
  role: string | null;
  duration: string | null;
  description: string | null;
  technologies: string[];
}

export interface ResumeCertification {
  name: string;
  issuer: string | null;
  year: string | null;
}

export interface ResumeSkills {
  programmingLanguages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  tools: string[];
  other: string[];
}

export interface ParsedResume {
  extractedText: string;          // full raw text from PDF
  isTextBased: boolean;           // false = scanned/image PDF
  personal: ResumePersonal;
  education: ResumeEducation[];
  skills: ResumeSkills;
  projects: ResumeProject[];
  experience: ResumeExperience[];
  certifications: ResumeCertification[];
  achievements: string[];
  links: string[];                // all URLs found in resume
  parseError: string | null;      // null = success
  statusText?: string;            // summary status like '1 edu • 2 exp • 1 proj'
}

// ─── GitHub ───────────────────────────────────

export interface GitHubUserProfile {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  profileUrl: string;
  publicRepos: number;
  followers: number;
  following: number;
  company: string | null;
  location: string | null;
  blog: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface GitHubRepository {
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  primaryLanguage: string | null;
  languages: string[];            // all detected languages (from languages API)
  stars: number;
  forks: number;
  openIssues: number;
  topics: string[];
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string | null;
  license: string | null;
  hasReadme: boolean;
  readmeContent: string | null;   // raw README text for evidence
  isFork: boolean;
  isArchived: boolean;
  size: number;                   // kb
  inspectedTechnologies?: string[];
  hasDocker?: boolean;
  hasCicd?: boolean;
  hasSql?: boolean;
  hasRedis?: boolean;
}

export interface GitHubActivity {
  recentlyPushedRepos: string[];  // repo names pushed within last 90 days
  lastPushDate: string | null;
  totalPublicRepos: number;
  languageDistribution: Record<string, number>; // lang → byte count
}

export interface GitHubData {
  username: string;
  profile: GitHubUserProfile | null;
  repositories: GitHubRepository[];
  activity: GitHubActivity | null;
  fetchError: string | null;      // null = success
  rateLimited: boolean;
}

// ─── Unified Extracted Profile ─────────────────

export interface ExtractedProfile {
  /** Reference back to the Step 1 profile ID */
  profileId: string;

  /** Student-supplied profile fields (from Step 1) */
  profile: {
    name: string;
    githubUrl: string;
    leetcodeUrl?: string;
    portfolioUrl: string;
    linkedinUrl: string;
    targetRole: string;
    jobDescription: string;
    additionalLinks: string[];
  };

  /** Parsed resume data */
  resume: ParsedResume;

  /** GitHub public data */
  github: GitHubData;

  /**
   * All skills collected from all sources, normalized.
   * NOT verified yet — that is Step 3.
   */
  normalizedSkills: NormalizedSkill[];

  /** Timestamp of this extraction run */
  extractedAt: string;
}
