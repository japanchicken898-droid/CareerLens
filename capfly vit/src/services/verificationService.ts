/**
 * Skill Claim vs Proof-of-Work Verification Service (Step 3)
 *
 * Core Logic:
 * RESUME CLAIM → EXTRACTED SKILL → SEARCH REAL EVIDENCE → GITHUB / PROJECT EVIDENCE
 * → EVIDENCE STRENGTH → VERIFICATION STATUS → EXPLANATION
 *
 * Strictly NO synthetic or hardcoded grading.
 * Strictly derived from real extracted data from Step 2.
 */

import { ExtractedProfile } from "@/types/extraction";
import {
  VerifiedSkill,
  VerificationReport,
  VerificationStatus,
  EvidenceStrength,
  EvidenceItem,
  SkillClaim,
  SkillCategory,
  SkillClaimSource,
} from "@/types/verification";
import { normalizeSkillName } from "@/utils/skillNormalizer";
import { categorizeSkill } from "@/utils/skillTaxonomy";

// Helper to escape regex special characters
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Extract contextual sentence or excerpt around a keyword match
function extractSnippet(text: string, keyword: string, maxLen = 120): string {
  const lower = text.toLowerCase();
  const kwLower = keyword.toLowerCase();
  const idx = lower.indexOf(kwLower);
  if (idx === -1) return text.slice(0, maxLen);

  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + keyword.length + 80);
  let snippet = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) snippet = "..." + snippet;
  if (end < text.length) snippet = snippet + "...";
  return snippet;
}

/**
 * Main Verification Engine for Step 3
 */
export function verifyProfileSkills(extracted: ExtractedProfile): VerificationReport {
  const { resume, github, normalizedSkills, profile, profileId } = extracted;

  // 1. Gather all unique skill candidates from normalizedSkills + resume raw sections
  const skillCandidatesMap = new Map<
    string,
    {
      rawSkill: string;
      normalizedSkill: string;
      claimedInResume: boolean;
      claimLocations: string[];
    }
  >();

  // Add all from Step 2 normalized skills
  for (const item of normalizedSkills) {
    const norm = item.normalized;
    const existing = skillCandidatesMap.get(norm);
    const fromResume = item.source === "resume";

    if (!existing) {
      skillCandidatesMap.set(norm, {
        rawSkill: item.raw,
        normalizedSkill: norm,
        claimedInResume: fromResume,
        claimLocations: fromResume ? ["Resume skills section"] : [],
      });
    } else {
      if (fromResume) {
        existing.claimedInResume = true;
        if (!existing.claimLocations.includes("Resume skills section")) {
          existing.claimLocations.push("Resume skills section");
        }
      }
    }
  }

  // Also check resume projects and experience for explicit skill mentions
  for (const proj of resume.projects) {
    for (const tech of proj.technologies) {
      const norm = normalizeSkillName(tech);
      const loc = `Resume project '${proj.name}'`;
      const existing = skillCandidatesMap.get(norm);
      if (!existing) {
        skillCandidatesMap.set(norm, {
          rawSkill: tech,
          normalizedSkill: norm,
          claimedInResume: true,
          claimLocations: [loc],
        });
      } else {
        existing.claimedInResume = true;
        if (!existing.claimLocations.includes(loc)) {
          existing.claimLocations.push(loc);
        }
      }
    }
  }

  for (const exp of resume.experience) {
    for (const tech of exp.technologies) {
      const norm = normalizeSkillName(tech);
      const loc = `Work experience at '${exp.company}'`;
      const existing = skillCandidatesMap.get(norm);
      if (!existing) {
        skillCandidatesMap.set(norm, {
          rawSkill: tech,
          normalizedSkill: norm,
          claimedInResume: true,
          claimLocations: [loc],
        });
      } else {
        existing.claimedInResume = true;
        if (!existing.claimLocations.includes(loc)) {
          existing.claimLocations.push(loc);
        }
      }
    }
  }

  // 2. Perform Claim vs Proof-of-Work Verification for each candidate skill
  const verifiedSkills: VerifiedSkill[] = [];

  for (const [normalizedName, candidate] of skillCandidatesMap.entries()) {
    const claims: SkillClaim[] = [];
    const evidence: EvidenceItem[] = [];
    const sourcesSet = new Set<SkillClaimSource>();

    // Check claims
    if (candidate.claimedInResume) {
      sourcesSet.add("resume");
      for (const loc of candidate.claimLocations) {
        claims.push({
          source: "resume",
          location: loc,
          context: `Claimed in ${loc}`,
        });
      }
    }

    // Search GitHub Evidence
    const targetNormLower = normalizedName.toLowerCase();
    const targetRawLower = candidate.rawSkill.toLowerCase();
    const regex = new RegExp(`(?<![a-zA-Z0-9_-])${escapeRegExp(targetRawLower)}(?![a-zA-Z0-9_-])`, "i");
    const normRegex = new RegExp(`(?<![a-zA-Z0-9_-])${escapeRegExp(targetNormLower)}(?![a-zA-Z0-9_-])`, "i");

    let primaryLangReposCount = 0;
    let anyLangReposCount = 0;
    let topicReposCount = 0;
    let readmeReposCount = 0;

    const matchedRepoNames: string[] = [];

    for (const repo of github.repositories) {
      let repoHasEvidence = false;

      // A. Primary language match
      if (repo.primaryLanguage) {
        const repoLangNorm = normalizeSkillName(repo.primaryLanguage).toLowerCase();
        if (repoLangNorm === targetNormLower || repo.primaryLanguage.toLowerCase() === targetRawLower) {
          primaryLangReposCount++;
          repoHasEvidence = true;
          sourcesSet.add("github");
          evidence.push({
            source: "github",
            evidenceType: "language",
            repository: repo.name,
            url: repo.url,
            location: `Primary language of repository '${repo.name}'`,
            context: `Primary language: ${repo.primaryLanguage} in ${repo.name}`,
          });
        }
      }

      // B. Languages array match (secondary/additional languages)
      if (repo.languages && repo.languages.length > 0) {
        const langMatch = repo.languages.find((l) => {
          const lNorm = normalizeSkillName(l).toLowerCase();
          return lNorm === targetNormLower || l.toLowerCase() === targetRawLower;
        });

        if (langMatch && (!repo.primaryLanguage || normalizeSkillName(repo.primaryLanguage).toLowerCase() !== targetNormLower)) {
          anyLangReposCount++;
          repoHasEvidence = true;
          sourcesSet.add("github");
          evidence.push({
            source: "github",
            evidenceType: "language",
            repository: repo.name,
            url: repo.url,
            location: `Detected in source files of '${repo.name}'`,
            context: `Used in repository: ${langMatch} (${repo.name})`,
          });
        }
      }

      // C. Topics match
      if (repo.topics && repo.topics.length > 0) {
        const topicMatch = repo.topics.find((t) => {
          const tNorm = normalizeSkillName(t).toLowerCase();
          return tNorm === targetNormLower || t.toLowerCase() === targetRawLower || t.toLowerCase().includes(targetNormLower);
        });

        if (topicMatch) {
          topicReposCount++;
          repoHasEvidence = true;
          sourcesSet.add("github");
          evidence.push({
            source: "github",
            evidenceType: "topic",
            repository: repo.name,
            url: repo.url,
            location: `Repository topic tag on '${repo.name}'`,
            context: `Tagged with topic '${topicMatch}'`,
          });
        }
      }

      // D. README match
      if (repo.hasReadme && repo.readmeContent) {
        if (regex.test(repo.readmeContent) || normRegex.test(repo.readmeContent)) {
          readmeReposCount++;
          repoHasEvidence = true;
          sourcesSet.add("github");
          const snippet = extractSnippet(repo.readmeContent, candidate.rawSkill);
          evidence.push({
            source: "project_readme",
            evidenceType: "readme",
            repository: repo.name,
            url: repo.url,
            location: `README documentation in '${repo.name}'`,
            context: snippet,
          });
        }
      }

      // E. Description match
      if (repo.description && (regex.test(repo.description) || normRegex.test(repo.description))) {
        repoHasEvidence = true;
        sourcesSet.add("github");
        evidence.push({
          source: "github",
          evidenceType: "project",
          repository: repo.name,
          url: repo.url,
          location: `Repository description of '${repo.name}'`,
          context: repo.description,
        });
      }

      if (repoHasEvidence && !matchedRepoNames.includes(repo.name)) {
        matchedRepoNames.push(repo.name);
      }
    }

    // F. Resume projects with verified links (additional supporting evidence)
    for (const proj of resume.projects) {
      if (
        proj.technologies.some(
          (t) => normalizeSkillName(t).toLowerCase() === targetNormLower
        )
      ) {
        if (proj.githubUrl || proj.demoUrl) {
          evidence.push({
            source: "resume",
            evidenceType: "project",
            repository: proj.name,
            url: proj.githubUrl || proj.demoUrl || undefined,
            location: `Resume project '${proj.name}'`,
            context: proj.description || `Project built with ${proj.technologies.join(", ")}`,
          });
        }
      }
    }

    // 3. Determine Evidence Strength
    let evidenceStrength: EvidenceStrength = "none";

    const totalRepoEvidence = primaryLangReposCount + anyLangReposCount + topicReposCount + readmeReposCount;
    const githubEvidenceItemsCount = evidence.filter((e) => e.source === "github" || e.source === "project_readme").length;

    if (
      primaryLangReposCount > 0 ||
      anyLangReposCount >= 1 ||
      matchedRepoNames.length >= 2 ||
      githubEvidenceItemsCount >= 2
    ) {
      evidenceStrength = "strong";
    } else if (matchedRepoNames.length === 1 || totalRepoEvidence >= 1 || evidence.length > 0) {
      evidenceStrength = "medium";
    } else {
      evidenceStrength = "none";
    }

    // 4. Determine Verification Status
    let status: VerificationStatus = "UNVERIFIED";

    if (candidate.claimedInResume) {
      if (evidenceStrength === "strong") {
        status = "VERIFIED";
      } else if (evidenceStrength === "medium") {
        status = "PARTIALLY_SUPPORTED";
      } else {
        status = "UNVERIFIED";
      }
    } else {
      // Discovered from GitHub
      if (evidenceStrength === "strong") {
        status = "VERIFIED";
      } else if (evidenceStrength === "medium") {
        status = "PARTIALLY_SUPPORTED";
      } else {
        status = "UNVERIFIED";
      }
    }

    // 5. Generate Dynamic, Explainable Rationale
    let explanation = "";

    if (status === "VERIFIED") {
      if (candidate.claimedInResume) {
        if (primaryLangReposCount > 0) {
          explanation = `Claimed in resume and verified as primary language across ${primaryLangReposCount} public GitHub repository (${matchedRepoNames.slice(0, 2).join(", ")}).`;
        } else if (anyLangReposCount > 0) {
          explanation = `Claimed in resume and detected in repository source code across ${matchedRepoNames.length} repository (${matchedRepoNames.slice(0, 2).join(", ")}).`;
        } else if (readmeReposCount > 0 && topicReposCount > 0) {
          explanation = `Claimed in resume and confirmed through verified project documentation and topic tags in '${matchedRepoNames[0]}'.`;
        } else if (matchedRepoNames.length > 0) {
          explanation = `Claimed in resume and confirmed through observable code and documentation in ${matchedRepoNames.length} repository (${matchedRepoNames.slice(0, 3).join(", ")}).`;
        } else {
          explanation = `Claimed in resume and supported by verified project implementation.`;
        }
      } else {
        explanation = `Detected as active codebase technology across ${matchedRepoNames.length} public GitHub repository (${matchedRepoNames.slice(0, 2).join(", ")}), demonstrating direct proof of work.`;
      }
    } else if (status === "PARTIALLY_SUPPORTED") {
      if (topicReposCount > 0 && primaryLangReposCount === 0 && anyLangReposCount === 0 && readmeReposCount === 0) {
        explanation = `Listed in resume and tagged in topics on '${matchedRepoNames[0]}', but not detected as a compiled language or primary codebase dependency.`;
      } else if (readmeReposCount > 0 && topicReposCount === 0) {
        explanation = `Referenced in project documentation for '${matchedRepoNames[0]}', with limited direct source code metrics.`;
      } else if (matchedRepoNames.length === 1) {
        explanation = `Identified in 1 repository ('${matchedRepoNames[0]}') with single project evidence.`;
      } else {
        explanation = `Claimed with partial contextual evidence from project descriptions.`;
      }
    } else {
      // UNVERIFIED
      if (github.fetchError || github.rateLimited) {
        explanation = `Claimed in resume, but GitHub proof-of-work could not be fully cross-checked (${github.rateLimited ? "API rate limited" : "profile unavailable"}).`;
      } else if (github.repositories.length === 0) {
        explanation = `Claimed in resume, but candidate public GitHub profile has 0 public repositories for proof-of-work verification.`;
      } else {
        explanation = `Claimed in resume, but no supporting repository languages, topic tags, or README documentation were detected in public GitHub repositories.`;
      }
    }

    const category = categorizeSkill(normalizedName);

    verifiedSkills.push({
      id: `skill_${normalizedName.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      rawSkill: candidate.rawSkill,
      normalizedSkill: normalizedName,
      category,
      sources: Array.from(sourcesSet),
      claims,
      evidence,
      evidenceStrength,
      status,
      explanation,
    });
  }

  // Sort verified skills: Verified first, then Partially Supported, then Unverified, alphabetical within
  verifiedSkills.sort((a, b) => {
    const priority = { VERIFIED: 1, PARTIALLY_SUPPORTED: 2, UNVERIFIED: 3, NOT_FOUND: 4 };
    const diff = priority[a.status] - priority[b.status];
    if (diff !== 0) return diff;
    return a.normalizedSkill.localeCompare(b.normalizedSkill);
  });

  // Group by category
  const skillsByCategory: Record<SkillCategory, VerifiedSkill[]> = {
    Programming: [],
    Frontend: [],
    Backend: [],
    Database: [],
    "Data & AI": [],
    "Cloud & DevOps": [],
    "Software Engineering": [],
    Cybersecurity: [],
    Mobile: [],
    "UI/UX & Design": [],
    Other: [],
  };

  for (const skill of verifiedSkills) {
    skillsByCategory[skill.category].push(skill);
  }

  const verifiedCount = verifiedSkills.filter((s) => s.status === "VERIFIED").length;
  const partiallySupportedCount = verifiedSkills.filter((s) => s.status === "PARTIALLY_SUPPORTED").length;
  const unverifiedCount = verifiedSkills.filter((s) => s.status === "UNVERIFIED").length;

  return {
    profileId,
    studentName: profile.name,
    totalSkills: verifiedSkills.length,
    verifiedCount,
    partiallySupportedCount,
    unverifiedCount,
    skills: verifiedSkills,
    skillsByCategory,
    sourcesEvaluated: {
      resume: resume.isTextBased,
      github: !github.fetchError && github.repositories.length > 0,
      portfolio: !!profile.portfolioUrl,
      linkedin: !!profile.linkedinUrl,
    },
    verifiedAt: new Date().toISOString(),
  };
}
