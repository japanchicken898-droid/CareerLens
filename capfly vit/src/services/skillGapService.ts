/**
 * Skill Gap Analysis Engine (Step 5)
 *
 * Compares student verified skills (Step 3) against
 * actual role/JD requirements (roleRequirementService).
 *
 * No hard-coded skill gaps. No fake data.
 * Every output is derived from actual input data.
 */

import type { VerifiedSkill } from "@/types/verification";
import type {
  SkillGap,
  SkillGapAnalysis,
  SkillGapInput,
  GapStatus,
  GapPriority,
  RoleRequirement,
} from "@/types/skillGap";
import { buildRequirements } from "@/services/roleRequirementService";
import { categorizeSkill } from "@/utils/skillTaxonomy";

// ── Skill Matching ────────────────────────────────────────────────

/**
 * Find the best matching VerifiedSkill for a requirement.
 * Handles aliases and partial name matches.
 */
function findStudentSkill(
  normalizedRequirement: string,
  verifiedSkills: VerifiedSkill[]
): VerifiedSkill | null {
  const reqLower = normalizedRequirement.toLowerCase().trim();

  // 1. Exact normalized match
  let match = verifiedSkills.find(
    (s) => s.normalizedSkill.toLowerCase() === reqLower
  );
  if (match) return match;

  // 2. Raw skill match
  match = verifiedSkills.find(
    (s) => s.rawSkill.toLowerCase() === reqLower
  );
  if (match) return match;

  // 3. Substring match (e.g., "Node.js" matches "Node.js & Express")
  match = verifiedSkills.find(
    (s) =>
      s.normalizedSkill.toLowerCase().includes(reqLower) ||
      reqLower.includes(s.normalizedSkill.toLowerCase())
  );
  if (match) return match;

  // 4. Raw substring
  match = verifiedSkills.find(
    (s) =>
      s.rawSkill.toLowerCase().includes(reqLower) ||
      reqLower.includes(s.rawSkill.toLowerCase())
  );

  return match ?? null;
}

// ── Gap Status Classification ─────────────────────────────────────

function classifyGapStatus(studentSkill: VerifiedSkill | null): GapStatus {
  if (!studentSkill) return "SKILL_GAP";

  switch (studentSkill.status) {
    case "VERIFIED":
      return "READY";
    case "PARTIALLY_SUPPORTED":
      return "PARTIAL_GAP";
    case "UNVERIFIED":
      return "EVIDENCE_GAP";
    case "NOT_FOUND":
    default:
      return "SKILL_GAP";
  }
}

// ── Gap Priority Calculation ─────────────────────────────────────

function calculatePriority(
  gapStatus: GapStatus,
  importance: "required" | "preferred"
): GapPriority {
  if (importance === "required") {
    if (gapStatus === "SKILL_GAP") return "CRITICAL";
    if (gapStatus === "EVIDENCE_GAP") return "HIGH";
    if (gapStatus === "PARTIAL_GAP") return "HIGH";
    return "LOW"; // READY
  } else {
    // preferred
    if (gapStatus === "SKILL_GAP") return "MEDIUM";
    if (gapStatus === "EVIDENCE_GAP") return "MEDIUM";
    if (gapStatus === "PARTIAL_GAP") return "LOW";
    return "LOW"; // READY
  }
}

// ── Explanation Generator ─────────────────────────────────────────

function generateExplanation(
  req: RoleRequirement,
  studentSkill: VerifiedSkill | null,
  gapStatus: GapStatus,
  githubAvailable: boolean
): string {
  const skill = req.normalizedSkill;
  const importanceLabel = req.importance === "required" ? "required" : "preferred";
  const roleSource = req.source === "job_description" ? "the target job description" : "typical role requirements";

  switch (gapStatus) {
    case "READY":
      if (studentSkill!.evidenceStrength === "strong") {
        return `${skill} is ${importanceLabel} by ${roleSource} and your profile shows strong verified evidence across ${studentSkill!.evidence.filter(e => e.source === "github" || e.source === "project_readme").length} GitHub source(s).`;
      }
      return `${skill} is ${importanceLabel} and is verified in your profile, though with moderate evidence depth.`;

    case "PARTIAL_GAP":
      return `${skill} is listed as ${importanceLabel} in ${roleSource}. Your profile contains some evidence (${studentSkill!.evidence.length} source(s)), but the depth is limited. Stronger proof-of-work would improve your alignment.`;

    case "EVIDENCE_GAP":
      if (!githubAvailable) {
        return `${skill} is ${importanceLabel} in ${roleSource}. It appears in your resume, but GitHub evidence could not be verified — no public repositories were found supporting this skill.`;
      }
      return `${skill} is ${importanceLabel} in ${roleSource} and is listed in your resume, but no supporting implementation evidence was detected in your public GitHub repositories.`;

    case "SKILL_GAP":
      if (!githubAvailable) {
        return `${skill} is ${importanceLabel} in ${roleSource}, but was not detected anywhere in your submitted profile. GitHub analysis was limited, so this may not be accurate.`;
      }
      return `${skill} is ${importanceLabel} in ${roleSource}, but no evidence of this skill was found in your resume, projects, or public GitHub repositories.`;

    default:
      return `${skill} requires review based on your current profile.`;
  }
}

// ── Recommended Action Generator ─────────────────────────────────

function generateRecommendedAction(
  skill: string,
  gapStatus: GapStatus,
  category: string,
  req: RoleRequirement
): string {
  switch (gapStatus) {
    case "READY":
      return `Keep your ${skill} projects visible and up-to-date on GitHub.`;

    case "PARTIAL_GAP":
      if (category === "Cloud & DevOps") {
        return `Build a real project using ${skill} and push it to a public GitHub repository with a clear README.`;
      }
      if (category === "Database") {
        return `Add a project that showcases ${skill} usage with real schema design, migrations, or queries on GitHub.`;
      }
      return `Add at least one substantial project using ${skill} to demonstrate practical implementation experience.`;

    case "EVIDENCE_GAP":
      return `You have listed ${skill} in your resume. Add a real project or code sample using ${skill} to a public GitHub repository to back this claim with proof-of-work.`;

    case "SKILL_GAP":
      if (req.importance === "required") {
        return `${skill} is required for this role. Start by building a focused project that uses ${skill} in a real-world context and publish it to GitHub.`;
      }
      return `${skill} is preferred for this role. Learning and demonstrating ${skill} through a small project would strengthen your profile significantly.`;

    default:
      return `Review and improve your ${skill} demonstration.`;
  }
}

// ── Readiness Score Calculator ────────────────────────────────────

function calculateReadinessScore(gaps: SkillGap[]): number {
  const requiredGaps = gaps.filter((g) => g.requirement.importance === "required");
  if (requiredGaps.length === 0) return 100;

  let totalPoints = 0;
  const maxPoints = requiredGaps.length * 3;

  for (const gap of requiredGaps) {
    switch (gap.gapStatus) {
      case "READY":        totalPoints += 3; break;
      case "PARTIAL_GAP": totalPoints += 2; break;
      case "EVIDENCE_GAP": totalPoints += 1; break;
      case "SKILL_GAP":   totalPoints += 0; break;
    }
  }

  return Math.round((totalPoints / maxPoints) * 100);
}

// ── Verdict Generator ─────────────────────────────────────────────

function generateVerdict(readinessScore: number, skillGapCount: number, evidenceGapCount: number): string {
  if (readinessScore >= 85 && skillGapCount === 0) {
    return "Strong role alignment. Your verified skills closely match this role's requirements.";
  }
  if (readinessScore >= 70) {
    return evidenceGapCount > 0
      ? "Good skill coverage. Strengthen evidence for claimed skills to stand out."
      : "Good alignment with minor gaps. Focus on the priority items below.";
  }
  if (readinessScore >= 50) {
    return `Moderate alignment. ${skillGapCount > 0 ? `${skillGapCount} required skill(s) are missing from your profile.` : "Focus on adding stronger project evidence."}`;
  }
  return `Significant skill gaps detected. ${skillGapCount} required skill(s) need to be developed or evidenced.`;
}

// ── Main Analysis Engine ──────────────────────────────────────────

/**
 * Analyze skill gaps for a student against a target role and/or job description.
 *
 * @param input - The student's verified profile + role/JD data
 * @returns A fully dynamic SkillGapAnalysis
 */
export function analyzeSkillGaps(input: SkillGapInput): SkillGapAnalysis {
  const { verifiedSkills, targetRole, jobDescription, githubAvailable } = input;

  // 1. Build requirements from JD + role baseline
  const { requirements, source, warnings } = buildRequirements(targetRole, jobDescription);

  if (requirements.length === 0) {
    return {
      summary: {
        targetRole,
        hasJobDescription: jobDescription.trim().length > 30,
        totalRequirements: 0,
        requiredCount: 0,
        preferredCount: 0,
        readyCount: 0,
        partialGapCount: 0,
        evidenceGapCount: 0,
        skillGapCount: 0,
        readinessScore: 0,
        isRoleReady: false,
        verdict: "Role requirements are currently unavailable. Add a job description for a more precise gap analysis.",
      },
      gaps: [],
      readySkills: [],
      partialSkills: [],
      evidenceGaps: [],
      skillGaps: [],
      additionalStrengths: verifiedSkills.filter(s => s.status === "VERIFIED").map(s => s.normalizedSkill),
      analyzedAt: new Date().toISOString(),
      requirementSource: source,
      warnings,
    };
  }

  // 2. Compare each requirement against student skills
  const gaps: SkillGap[] = [];

  for (const req of requirements) {
    const studentSkill = findStudentSkill(req.normalizedSkill, verifiedSkills);
    const gapStatus = classifyGapStatus(studentSkill);
    const priority = calculatePriority(gapStatus, req.importance);
    const category = categorizeSkill(req.normalizedSkill);
    const explanation = generateExplanation(req, studentSkill, gapStatus, githubAvailable);
    const recommendedAction = generateRecommendedAction(req.normalizedSkill, gapStatus, category, req);

    gaps.push({
      skillId: `gap_${req.normalizedSkill.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      rawSkill: req.rawRequirement,
      normalizedSkill: req.normalizedSkill,
      category,
      requirement: {
        source: req.source,
        importance: req.importance,
        originalText: req.rawRequirement,
      },
      studentStatus: studentSkill ? studentSkill.status : "NOT_FOUND",
      evidence: studentSkill?.evidence ?? [],
      gapStatus,
      priority,
      explanation,
      recommendedAction,
    });
  }

  // 3. Sort: by priority then by importance
  const priorityOrder: Record<GapPriority, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  gaps.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  // 4. Identify additional strengths (verified skills NOT required by role)
  const requiredSkillsSet = new Set(requirements.map((r) => r.normalizedSkill.toLowerCase()));
  const additionalStrengths = verifiedSkills
    .filter(
      (s) =>
        s.status === "VERIFIED" &&
        !requiredSkillsSet.has(s.normalizedSkill.toLowerCase())
    )
    .map((s) => s.normalizedSkill);

  // 5. Build subsets
  const readySkills = gaps.filter((g) => g.gapStatus === "READY");
  const partialSkills = gaps.filter((g) => g.gapStatus === "PARTIAL_GAP");
  const evidenceGaps = gaps.filter((g) => g.gapStatus === "EVIDENCE_GAP");
  const skillGaps = gaps.filter((g) => g.gapStatus === "SKILL_GAP");

  const requiredCount = requirements.filter((r) => r.importance === "required").length;
  const preferredCount = requirements.filter((r) => r.importance === "preferred").length;
  const readinessScore = calculateReadinessScore(gaps);
  const isRoleReady = readinessScore >= 75 && skillGaps.filter((g) => g.requirement.importance === "required").length === 0;

  return {
    summary: {
      targetRole,
      hasJobDescription: jobDescription.trim().length > 30,
      totalRequirements: requirements.length,
      requiredCount,
      preferredCount,
      readyCount: readySkills.length,
      partialGapCount: partialSkills.length,
      evidenceGapCount: evidenceGaps.length,
      skillGapCount: skillGaps.length,
      readinessScore,
      isRoleReady,
      verdict: generateVerdict(readinessScore, skillGaps.filter((g) => g.requirement.importance === "required").length, evidenceGaps.length),
    },
    gaps,
    readySkills,
    partialSkills,
    evidenceGaps,
    skillGaps,
    additionalStrengths,
    analyzedAt: new Date().toISOString(),
    requirementSource: source,
    warnings,
  };
}
