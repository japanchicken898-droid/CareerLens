// ─────────────────────────────────────────────
// STEP 3 — Skill Claim vs Proof-of-Work Verification Types
// Factual, explainable verification based on real extracted evidence.
// No synthetic scoring. No fake verification.
// ─────────────────────────────────────────────

export type VerificationStatus =
  | "VERIFIED"
  | "PARTIALLY_SUPPORTED"
  | "UNVERIFIED"
  | "NOT_FOUND";

export type EvidenceStrength = "strong" | "medium" | "weak" | "none";

export type SkillCategory =
  | "Programming"
  | "Frontend"
  | "Backend"
  | "Database"
  | "Data & AI"
  | "Cloud & DevOps"
  | "Software Engineering"
  | "Cybersecurity"
  | "Mobile"
  | "UI/UX & Design"
  | "Other";

export type SkillClaimSource = "resume" | "portfolio" | "linkedin" | "github";

export interface SkillClaim {
  source: SkillClaimSource;
  location?: string;
  context?: string;
}

export type EvidenceType =
  | "language"
  | "readme"
  | "topic"
  | "project"
  | "skill_claim"
  | "code_file"
  | "portfolio_desc";

export interface EvidenceItem {
  source: "github" | "resume" | "portfolio" | "linkedin" | "project_readme" | "project_code";
  evidenceType: EvidenceType;
  repository?: string;
  url?: string;
  context?: string;
  location?: string;
}

export interface VerifiedSkill {
  id: string;
  rawSkill: string;
  normalizedSkill: string;
  category: SkillCategory;
  sources: SkillClaimSource[];
  claims: SkillClaim[];
  evidence: EvidenceItem[];
  evidenceStrength: EvidenceStrength;
  status: VerificationStatus;
  explanation: string;
}

export interface VerificationReport {
  profileId: string;
  studentName: string;
  totalSkills: number;
  verifiedCount: number;
  partiallySupportedCount: number;
  unverifiedCount: number;
  skills: VerifiedSkill[];
  skillsByCategory: Record<SkillCategory, VerifiedSkill[]>;
  sourcesEvaluated: {
    resume: boolean;
    github: boolean;
    portfolio: boolean;
    linkedin: boolean;
  };
  verifiedAt: string;
}
