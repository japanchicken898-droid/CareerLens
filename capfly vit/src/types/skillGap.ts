// -----------------------------------------------------------------
//  STEP 5 — Skill Gap Analysis — Type Definitions
//  All values are dynamically computed. No hard-coded gaps.
// -----------------------------------------------------------------

import type { SkillCategory, EvidenceItem, VerificationStatus } from "@/types/verification";

// -- Role Requirement ----------------------------------------------

export type RequirementSource = "job_description" | "role_baseline";
export type RequirementImportance = "required" | "preferred";

export interface RoleRequirement {
  rawRequirement: string;
  normalizedSkill: string;
  source: RequirementSource;
  importance: RequirementImportance;
  originalContext?: string;
}

// -- Gap Classification ---------------------------------------------

export type GapStatus = "READY" | "PARTIAL_GAP" | "EVIDENCE_GAP" | "SKILL_GAP";
export type GapPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

// -- Skill Gap Record ----------------------------------------------

export interface SkillGap {
  skillId: string;
  rawSkill: string;
  normalizedSkill: string;
  category: SkillCategory;
  requirement: {
    source: RequirementSource;
    importance: RequirementImportance;
    originalText: string;
  };
  studentStatus: VerificationStatus | "NOT_FOUND";
  evidence: EvidenceItem[];
  gapStatus: GapStatus;
  priority: GapPriority;
  explanation: string;
  recommendedAction: string;
}

// -- Summary --------------------------------------------------------

export interface GapSummary {
  targetRole: string;
  hasJobDescription: boolean;
  totalRequirements: number;
  requiredCount: number;
  preferredCount: number;
  readyCount: number;
  partialGapCount: number;
  evidenceGapCount: number;
  skillGapCount: number;
  readinessScore: number;
  isRoleReady: boolean;
  verdict: string;
}

// -- Full Analysis Result -------------------------------------------

export interface SkillGapAnalysis {
  summary: GapSummary;
  gaps: SkillGap[];
  readySkills: SkillGap[];
  partialSkills: SkillGap[];
  evidenceGaps: SkillGap[];
  skillGaps: SkillGap[];
  additionalStrengths: string[];
  analyzedAt: string;
  requirementSource: RequirementSource | "mixed";
  warnings: string[];
}

// -- Input for the gap engine ---------------------------------------

export interface SkillGapInput {
  verifiedSkills: import("@/types/verification").VerifiedSkill[];
  targetRole: string;
  jobDescription: string;
  githubAvailable: boolean;
  studentName: string;
}
