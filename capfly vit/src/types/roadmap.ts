// ─────────────────────────────────────────────────────────────────
//  STEP 6 — Personalized Career Roadmap — Type Definitions
//  All values dynamically generated from student data.
//  Zero hard-coded roadmap content.
// ─────────────────────────────────────────────────────────────────

export type MilestoneStatus = "COMPLETED" | "IN_PROGRESS" | "NEXT" | "LOCKED";
export type PhaseType =
  | "FOUNDATION"
  | "CORE_SKILL_DEVELOPMENT"
  | "INTERMEDIATE_SKILL_DEVELOPMENT"
  | "ADVANCED_SKILL_DEVELOPMENT"
  | "PROOF_OF_WORK"
  | "APPLIED_PROJECTS"
  | "INDUSTRY_READINESS"
  | "INTERVIEW_PREPARATION"
  | "PLACEMENT_READINESS";

export type SkillPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ResourceType =
  | "documentation"
  | "course"
  | "tutorial"
  | "practice"
  | "certification"
  | "project"
  | "reference";

// ── Resource ─────────────────────────────────────────────────────

export interface RoadmapResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  type: ResourceType;
  skill: string;
  reason: string;
  isFree: boolean;
}

// ── Milestone ─────────────────────────────────────────────────────

export interface RoadmapMilestone {
  id: string;
  title: string;
  description: string;
  /** Normalized skill names this milestone addresses */
  skills: string[];
  /** IDs of skill gaps this closes */
  gapIds: string[];
  priority: SkillPriority;
  status: MilestoneStatus;
  /** IDs of milestones that must be completed first */
  prerequisites: string[];
  estimatedEffort: string;
  completionCriteria: string;
  resources: RoadmapResource[];
  /** Specific, actionable task description */
  actionTask: string;
}

// ── Project ──────────────────────────────────────────────────────

export interface RoadmapProject {
  id: string;
  title: string;
  description: string;
  /** Skills this project demonstrates */
  skills: string[];
  /** Gap IDs this project helps close */
  closesGaps: string[];
  requirements: string[];
  expectedEvidence: string[];
  estimatedEffort: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  resources: RoadmapResource[];
  status: MilestoneStatus;
}

// ── Phase ────────────────────────────────────────────────────────

export interface RoadmapPhase {
  id: string;
  order: number;
  type: PhaseType;
  title: string;
  description: string;
  objective: string;
  whyNeeded: string;
  milestones: RoadmapMilestone[];
  status: MilestoneStatus;
  estimatedEffort: string;
}

// ── Priority Skill ────────────────────────────────────────────────

export interface PrioritySkill {
  skill: string;
  priority: SkillPriority;
  why: string;
  nextAction: string;
  currentState: "VERIFIED" | "PARTIALLY_SUPPORTED" | "UNVERIFIED" | "NOT_FOUND";
}

// ── Job-Ready Milestone ───────────────────────────────────────────

export interface JobReadyCondition {
  label: string;
  achieved: boolean;
  description: string;
}

// ── Progress ─────────────────────────────────────────────────────

export interface RoadmapProgress {
  completed: number;
  total: number;
  percentage: number;
  /** IDs of milestones manually marked complete by the student */
  manuallyCompleted: string[];
}

// ── Full Personalized Roadmap ─────────────────────────────────────

export interface PersonalizedRoadmap {
  /** Unique identifier derived from sourceAnalysisId */
  id: string;
  studentId: string;
  targetRole: string;
  /** Hash of the input data — used to detect when to regenerate */
  sourceAnalysisId: string;
  generatedAt: string;

  /** Short personalized summary */
  summary: string;

  /** Top 3–5 priorities, ordered by urgency */
  priorities: PrioritySkill[];

  /** Dynamically generated phases (2–6 phases depending on gaps) */
  phases: RoadmapPhase[];

  /** Skills verified and already strong — display as strengths */
  strengths: string[];

  /** Normalized skill names that need closing */
  gaps: string[];

  /** All milestones (flattened, for progress tracking) */
  milestones: RoadmapMilestone[];

  /** Recommended projects */
  projects: RoadmapProject[];

  /** All unique resources across all milestones */
  resources: RoadmapResource[];

  /** Conditions for being job-ready */
  jobReadyConditions: JobReadyCondition[];

  progress: RoadmapProgress;

  /** Display-ready estimated total duration */
  estimatedDuration: string;
}

// ── Input to the generator ────────────────────────────────────────

export interface RoadmapInput {
  studentId: string;
  studentName: string;
  targetRole: string;
  jobDescription: string;
  verifiedSkills: import("@/types/verification").VerifiedSkill[];
  skillGapAnalysis: import("@/types/skillGap").SkillGapAnalysis | null;
  examResult: import("@/types/exam").ExamResult | null;
  githubAvailable: boolean;
}
