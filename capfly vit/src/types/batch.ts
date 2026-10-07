// ─────────────────────────────────────────────
// STEP 7 — Placement / Batch Readiness Dashboard Types
// ─────────────────────────────────────────────

export type ReadinessStatusCategory =
  | "READY"
  | "NEAR READY"
  | "DEVELOPING"
  | "HIGH SUPPORT NEEDED";

export type EvidenceStrength = "Strong" | "Moderate" | "Weak" | "None";

export type PlacementStatusOption =
  | "Not Applied"
  | "Applied"
  | "Interviewing"
  | "Offer Received"
  | "Placed"
  | "Rejected"
  | "Withdrawn"
  | "Not Connected";

export type UserRole =
  | "INSTITUTION_ADMIN"
  | "PLACEMENT_OFFICER"
  | "FACULTY"
  | "DEPARTMENT_COORDINATOR";

export interface BatchFilters {
  institution?: string;
  department?: string;
  batchYear?: string;
  targetRole?: string;
  readinessStatus?: string;
  searchQuery?: string;
}

export interface StudentBatchRecord {
  id: string;
  name: string;
  institution: string;
  department: string;
  batchYear: string;
  targetRole: string;
  readinessScore: number; // 0 - 100
  readinessStatus: ReadinessStatusCategory;
  topGap: string;
  evidenceStatus: EvidenceStrength;
  roadmapProgress: number; // 0 - 100
  placementStatus: PlacementStatusOption;
  verifiedSkills: string[];
  evidenceGaps: string[];
  skillGaps: string[];
  reasonsNotReady: string[];
  analyzedAt: string;
}

export interface ReadinessDistributionItem {
  category: ReadinessStatusCategory;
  count: number;
  percentage: number;
}

export interface SkillGapFrequencyItem {
  skill: string;
  affectedStudents: number;
  percentage: number;
  gapType: "Skill Gap" | "Evidence Gap";
}

export interface VerifiedSkillItem {
  skill: string;
  count: number;
  percentage: number;
}

export interface RoleAnalyticsItem {
  role: string;
  count: number;
  avgReadiness: number;
}

export interface DepartmentAnalyticsItem {
  department: string;
  count: number;
  avgReadiness: number;
}

export interface TrainingPriorityRecommendation {
  skill: string;
  affectedStudents: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  recommendedAction: string;
}

export interface IndustryDemandVsStudentGap {
  skill: string;
  industryDemandPct: number;
  studentVerifiedPct: number;
  gapPct: number;
}

export interface BatchAnalytics {
  institution: string;
  departmentFilter: string;
  batchFilter: string;
  totalStudents: number;
  analyzedStudentsCount: number;
  readyStudentsCount: number;
  needsSupportCount: number;
  criticalGapCount: number;
  averageReadiness: number;
  averageRoadmapProgress: number;

  readinessDistribution: ReadinessDistributionItem[];
  topSkillGaps: SkillGapFrequencyItem[];
  mostVerifiedSkills: VerifiedSkillItem[];
  roleAnalytics: RoleAnalyticsItem[];
  departmentAnalytics: DepartmentAnalyticsItem[];
  trainingPriorities: TrainingPriorityRecommendation[];
  industryVsStudentGap: IndustryDemandVsStudentGap[];

  hasPlacementData: boolean;
  placementRate?: number;
}
