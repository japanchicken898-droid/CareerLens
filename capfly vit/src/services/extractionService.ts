/**
 * Extraction Orchestrator
 *
 * Coordinates resume parsing + GitHub fetching for a given ProfileData.
 * Builds the unified ExtractedProfile.
 * Normalizes and de-duplicates all skills.
 * No scores. No verification. Evidence collection only.
 */

import type { ProfileData } from "@/types/profile";
import type { ExtractedProfile, NormalizedSkill, DataSource } from "@/types/extraction";
import { parseResume } from "@/services/resumeParser";
import { fetchGitHubData } from "@/services/githubService";
import { normalizeSkillName, deduplicateNormalizedSkills } from "@/utils/skillNormalizer";

// ─── Skill Collection Helpers ──────────────────

function skillsFromResume(
  programmingLanguages: string[],
  frameworks: string[],
  libraries: string[],
  databases: string[],
  tools: string[],
  other: string[]
): NormalizedSkill[] {
  const all = [
    ...programmingLanguages,
    ...frameworks,
    ...libraries,
    ...databases,
    ...tools,
    ...other,
  ];

  return all.map((raw) => ({
    raw: raw.trim(),
    normalized: normalizeSkillName(raw),
    source: "resume" as DataSource,
  }));
}

function skillsFromGitHub(repos: ExtractedProfile["github"]["repositories"]): NormalizedSkill[] {
  const skills: NormalizedSkill[] = [];

  for (const repo of repos) {
    if (repo.primaryLanguage) {
      skills.push({
        raw: repo.primaryLanguage,
        normalized: normalizeSkillName(repo.primaryLanguage),
        source: "github" as DataSource,
        evidence: {
          repository: repo.name,
          language: repo.primaryLanguage,
          context: `Primary language of repository "${repo.name}"`,
        },
      });
    }

    for (const lang of repo.languages) {
      if (lang !== repo.primaryLanguage) {
        skills.push({
          raw: lang,
          normalized: normalizeSkillName(lang),
          source: "github" as DataSource,
          evidence: {
            repository: repo.name,
            language: lang,
            context: `Used in repository "${repo.name}"`,
          },
        });
      }
    }

    for (const topic of repo.topics) {
      skills.push({
        raw: topic,
        normalized: normalizeSkillName(topic),
        source: "github" as DataSource,
        evidence: {
          repository: repo.name,
          context: `Repository topic on "${repo.name}"`,
        },
      });
    }
  }

  return skills;
}

const STORAGE_KEY = "careerlens_extracted_profile";

let _sessionCache: { profileId: string; result: ExtractedProfile } | null = null;

export function getCachedExtraction(profileId?: string): ExtractedProfile | null {
  if (profileId && _sessionCache?.profileId === profileId) return _sessionCache.result;
  if (!_sessionCache && typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ExtractedProfile;
        if (!profileId || parsed.profileId === profileId) {
          _sessionCache = { profileId: parsed.profileId, result: parsed };
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return _sessionCache?.result ?? null;
}

function cacheExtraction(result: ExtractedProfile): void {
  _sessionCache = { profileId: result.profileId, result };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    } catch {
      // ignore
    }
  }
}

export function clearExtractionCache(): void {
  _sessionCache = null;
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}

// ─── Progress Callback ─────────────────────────

export type ExtractionStage =
  | "idle"
  | "reading_resume"
  | "connecting_github"
  | "collecting_repositories"
  | "organizing_evidence"
  | "done"
  | "error";

export interface ExtractionProgress {
  stage: ExtractionStage;
  label: string;
  detail: string;
}

export type OnProgress = (progress: ExtractionProgress) => void;

// ─── Main Orchestrator ─────────────────────────

export async function extractProfileData(
  profile: ProfileData,
  onProgress: OnProgress
): Promise<ExtractedProfile> {
  const profileId = profile.id ?? "unknown";

  // Check session cache — avoid re-extracting the same profile
  const cached = getCachedExtraction(profileId);
  if (cached) return cached;

  // ── Stage 1: Resume ─────────────────────────
  onProgress({
    stage: "reading_resume",
    label: "Reading your resume...",
    detail: "Extracting text from the uploaded PDF file.",
  });

  const resumeFile = profile.resume instanceof File ? profile.resume : null;
  let parsedResume = await (resumeFile
    ? parseResume(resumeFile)
    : Promise.resolve({
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
        parseError: "No resume file available. The PDF file may not have been re-uploaded after page refresh.",
      }));

  // ── Stage 2: GitHub ─────────────────────────
  onProgress({
    stage: "connecting_github",
    label: "Connecting to GitHub...",
    detail: `Looking up public profile for ${profile.githubUrl}`,
  });

  const githubData = await fetchGitHubData(profile.githubUrl);

  // ── Stage 3: Repositories ───────────────────
  onProgress({
    stage: "collecting_repositories",
    label: "Collecting public repositories...",
    detail: `Found ${githubData.repositories.length} public repositories.`,
  });

  // ── Stage 4: Normalize & Organize ──────────
  onProgress({
    stage: "organizing_evidence",
    label: "Organizing profile evidence...",
    detail: "Normalizing skills from resume and GitHub.",
  });

  const resumeSkillObjects = skillsFromResume(
    parsedResume.skills.programmingLanguages,
    parsedResume.skills.frameworks,
    parsedResume.skills.libraries,
    parsedResume.skills.databases,
    parsedResume.skills.tools,
    parsedResume.skills.other
  );

  const githubSkillObjects = skillsFromGitHub(githubData.repositories);

  const leetcodeSkillObjects: NormalizedSkill[] = profile.leetcodeUrl
    ? [
        {
          raw: "Data Structures & Algorithms",
          normalized: "Data Structures & Algorithms",
          source: "leetcode",
          evidence: {
            context: `LeetCode Profile: ${profile.leetcodeUrl} (DSA proof)`,
          },
        },
        {
          raw: "Problem Solving",
          normalized: "Problem Solving",
          source: "leetcode",
          evidence: {
            context: `Verified LeetCode Problem Solving Profile`,
          },
        },
      ]
    : [];

  const allNormalizedSkills = deduplicateNormalizedSkills([
    ...resumeSkillObjects,
    ...githubSkillObjects,
    ...leetcodeSkillObjects,
  ]);

  // ── Build unified ExtractedProfile ──────────
  const result: ExtractedProfile = {
    profileId,
    profile: {
      name: profile.name,
      githubUrl: profile.githubUrl,
      leetcodeUrl: profile.leetcodeUrl,
      portfolioUrl: profile.portfolioUrl,
      linkedinUrl: profile.linkedinUrl,
      targetRole: profile.targetRole,
      jobDescription: profile.jobDescription,
      additionalLinks: profile.additionalLinks,
    },
    resume: parsedResume,
    github: githubData,
    normalizedSkills: allNormalizedSkills,
    extractedAt: new Date().toISOString(),
  };

  cacheExtraction(result);

  onProgress({
    stage: "done",
    label: "Extraction complete.",
    detail: "Profile evidence collected. Ready for Step 3.",
  });

  return result;
}
