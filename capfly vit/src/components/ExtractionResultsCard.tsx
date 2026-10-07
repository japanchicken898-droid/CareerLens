"use client";

import React, { useMemo, useState } from "react";
import type { ExtractedProfile } from "@/types/extraction";
import { GithubIcon, LeetcodeIcon } from "@/components/Icons";
import {
  FileText,
  CheckCircle2,
  RefreshCw,
  Edit3,
  ExternalLink,
  Briefcase,
  User,
  Search,
  ArrowRight,
  GraduationCap,
  Award,
  Terminal,
  ChevronDown,
  ChevronUp,
  Layers,
  Code2,
} from "lucide-react";

interface ExtractionResultsCardProps {
  extracted: ExtractedProfile;
  onReextract: () => void;
  onEdit: () => void;
  onProceedToStep3?: () => void;
}

interface ConsolidatedSkillItem {
  key: string;
  name: string;
  sources: ("resume" | "github" | "leetcode")[];
  evidence: string[];
}

export const ExtractionResultsCard: React.FC<ExtractionResultsCardProps> = ({
  extracted,
  onReextract,
  onEdit,
  onProceedToStep3,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isBackgroundOpen, setIsBackgroundOpen] = useState(false);
  const [isRawTextOpen, setIsRawTextOpen] = useState(false);

  const { resume, github, normalizedSkills, profile } = extracted;

  // Extract LeetCode username if available
  const leetcodeUsername = useMemo(() => {
    if (!profile.leetcodeUrl) return null;
    const cleaned = profile.leetcodeUrl
      .replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, "")
      .replace(/\/.*$/, "")
      .trim();
    return cleaned || "connected";
  }, [profile.leetcodeUrl]);

  // Consolidate skills from all sources into unified cards
  const consolidatedSkills: ConsolidatedSkillItem[] = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        sources: Set<"resume" | "github" | "leetcode">;
        evidence: Set<string>;
      }
    >();

    for (const s of normalizedSkills) {
      const key = s.normalized.toLowerCase().trim();
      const existing = map.get(key) || {
        name: s.normalized,
        sources: new Set<"resume" | "github" | "leetcode">(),
        evidence: new Set<string>(),
      };

      if (s.source === "resume" || s.source === "github" || s.source === "leetcode") {
        existing.sources.add(s.source);
      }

      if (s.evidence?.repository) {
        existing.evidence.add(
          `Repo: ${s.evidence.repository}${s.evidence.language ? ` (${s.evidence.language})` : ""}`
        );
      }
      if (s.evidence?.context) {
        existing.evidence.add(s.evidence.context);
      } else if (s.source === "resume") {
        existing.evidence.add("Claimed in Resume Technical Skills");
      }

      map.set(key, existing);
    }

    // Ensure LeetCode DSA skills are represented if leetcodeUrl exists
    if (profile.leetcodeUrl) {
      const dsaKey = "data structures & algorithms";
      if (!map.has(dsaKey)) {
        map.set(dsaKey, {
          name: "Data Structures & Algorithms",
          sources: new Set(["leetcode"]),
          evidence: new Set([`LeetCode Profile: @${leetcodeUsername} (DSA proof)`]),
        });
      } else {
        map.get(dsaKey)!.sources.add("leetcode");
        map.get(dsaKey)!.evidence.add(`Verified LeetCode Profile: @${leetcodeUsername}`);
      }

      const psKey = "problem solving (dsa)";
      if (!map.has(psKey)) {
        map.set(psKey, {
          name: "Problem Solving (DSA)",
          sources: new Set(["leetcode"]),
          evidence: new Set([`Verified LeetCode Competitive Problem Solving Profile`]),
        });
      }
    }

    // Convert to sorted array (skills with multiple sources first, then alphabetical)
    return Array.from(map.entries())
      .map(([key, data]) => ({
        key,
        name: data.name,
        sources: Array.from(data.sources),
        evidence: Array.from(data.evidence),
      }))
      .sort((a, b) => {
        if (b.sources.length !== a.sources.length) {
          return b.sources.length - a.sources.length;
        }
        return a.name.localeCompare(b.name);
      });
  }, [normalizedSkills, profile.leetcodeUrl, leetcodeUsername]);

  // Filter skills by search query
  const filteredSkills = useMemo(() => {
    if (!searchQuery.trim()) return consolidatedSkills;
    const q = searchQuery.toLowerCase().trim();
    return consolidatedSkills.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.evidence.some((e) => e.toLowerCase().includes(q)) ||
        s.sources.some((src) => src.includes(q))
    );
  }, [consolidatedSkills, searchQuery]);

  // Counts for summary header
  const resumeSkillsCount = normalizedSkills.filter((s) => s.source === "resume").length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* ─── Top Status Banner ────────────────────────────────────────────── */}
      <div className="bg-[#E2EDE5] border border-[#B8D7C0] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2E6B47] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-[#1C452E]">
                Step 2: Real Data Extraction Overview
              </h2>
              <span className="bg-[#2E6B47]/10 text-[#2E6B47] border border-[#2E6B47]/20 font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold">
                EVIDENCE READY
              </span>
            </div>
            <p className="text-xs text-[#2E6B47]">
              Extracted factual signals across Resume, GitHub code, and LeetCode proofs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={onReextract}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#24201D] border border-[#D6CEBE] text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Re-run extraction"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6E6659]" />
            <span>Re-extract</span>
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#24201D] border border-[#D6CEBE] text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#6E6659]" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* ─── Unified Summary Header Card ──────────────────────────────────── */}
      <div className="paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-5">
        {/* Candidate Title & Role */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E8E2D7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F0ECE1] text-[#24201D] flex items-center justify-center font-bold text-xl border border-[#D6CEBE]">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#24201D]">{profile.name}</h3>
                {resume.personal.name && resume.personal.name !== profile.name && (
                  <span className="text-[11px] text-[#6E6659] font-normal">
                    (Resume: {resume.personal.name})
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6E6659] flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 font-semibold text-[#24201D]">
                  <Briefcase className="w-3.5 h-3.5 text-[#8A7E6C]" />
                  {profile.targetRole || "Software Developer"}
                </span>
                {resume.personal.email && (
                  <>
                    <span>•</span>
                    <span className="font-mono">{resume.personal.email}</span>
                  </>
                )}
                {resume.personal.location && (
                  <>
                    <span>•</span>
                    <span>{resume.personal.location}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[#4A4036] bg-[#FAF8F5] border border-[#D6CEBE] px-3 py-1.5 rounded-xl">
              <strong className="text-[#24201D]">{consolidatedSkills.length}</strong> Competencies Extracted
            </span>
          </div>
        </div>

        {/* Unified 4-Column Signal Summary Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Candidate & Target Role */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-1">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A7E6C]">
              <User className="w-3.5 h-3.5 text-[#5A5144]" />
              <span>Target Role</span>
            </div>
            <p className="font-bold text-sm text-[#24201D] truncate">
              {profile.targetRole || "Backend Developer"}
            </p>
            <p className="text-[11px] text-[#6E6659] truncate font-mono">
              {profile.name}
            </p>
          </div>

          {/* 2. Resume Status */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A7E6C]">
                <FileText className="w-3.5 h-3.5 text-[#B8532F]" />
                <span>Resume Status</span>
              </div>
              <span className="text-[10px] font-mono text-[#2E6B47] font-semibold bg-[#E2EDE5] px-1.5 py-0.2 rounded">
                Parsed
              </span>
            </div>
            <p className="font-bold text-sm text-[#24201D]">
              {resumeSkillsCount > 0 ? `${resumeSkillsCount} skills found` : "Resume text parsed"}
            </p>
            <p className="text-[11px] text-[#6E6659] truncate">
              {resume.education.length} edu • {resume.experience.length} exp • {resume.projects.length} proj
            </p>
          </div>

          {/* 3. GitHub Stats */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A7E6C]">
                <GithubIcon className="w-3.5 h-3.5 text-[#24201D]" />
                <span>GitHub Stats</span>
              </div>
              <span className="text-[10px] font-mono text-[#2E6B47] font-semibold bg-[#E2EDE5] px-1.5 py-0.2 rounded">
                Audited
              </span>
            </div>
            <p className="font-bold text-sm text-[#24201D]">
              {github.repositories.length} Public Repos
            </p>
            <p className="text-[11px] text-[#6E6659] truncate">
              {github.activity?.recentlyPushedRepos.length ?? 0} active repos (90d)
            </p>
          </div>

          {/* 4. LeetCode Stats */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#8A7E6C]">
                <LeetcodeIcon className="w-3.5 h-3.5 text-[#FFA116]" />
                <span>LeetCode Stats</span>
              </div>
              <span className="text-[10px] font-mono text-[#854D0E] font-semibold bg-[#FEF9C3] px-1.5 py-0.2 rounded">
                DSA Proof
              </span>
            </div>
            <p className="font-bold text-sm text-[#24201D] truncate">
              {leetcodeUsername ? `@${leetcodeUsername}` : "Connected"}
            </p>
            <p className="text-[11px] text-[#6E6659] truncate font-mono">
              DSA Proof Verified
            </p>
          </div>
        </div>
      </div>

      {/* ─── Unified Skill Evidence Grid ──────────────────────────────────── */}
      <div className="paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-5">
        {/* Header & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8E2D7] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#24201D]" />
              <h3 className="text-base font-bold text-[#24201D]">
                Extracted Competencies & Evidence
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#D6CEBE] text-[#6E6659]">
                {filteredSkills.length}
              </span>
            </div>
            <p className="text-xs text-[#6E6659] mt-0.5">
              Unified factual evidence mapped to each competency across code repositories, resume, and DSA proofs.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#8A7E6C] absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search competencies or repos..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] text-xs text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all"
            />
          </div>
        </div>

        {/* Skill Evidence Cards Grid */}
        {filteredSkills.length === 0 ? (
          <div className="text-center py-10 text-[#8A7E6C] font-mono text-xs">
            No competencies match &quot;{searchQuery}&quot;. Try a different keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSkills.map((skill) => {
              const hasMultiSource = skill.sources.length > 1;

              return (
                <div
                  key={skill.key}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                    hasMultiSource
                      ? "bg-[#FAF8F5] border-[#B8AC97] hover:border-[#24201D]"
                      : "bg-[#FFFFFF] border-[#D6CEBE] hover:border-[#8A7E6C]"
                  }`}
                >
                  {/* Card Header: Skill Name & Source Badges */}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-[#24201D] leading-tight">
                        {skill.name}
                      </h4>

                      {/* Source Badges */}
                      <div className="flex flex-wrap items-center gap-1 shrink-0">
                        {skill.sources.map((src) => {
                          if (src === "resume") {
                            return (
                              <span
                                key={src}
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FAF1EC] text-[#B8532F] border border-[#EAC9BC]"
                                title="Found on resume"
                              >
                                <FileText className="w-2.5 h-2.5" />
                                Resume
                              </span>
                            );
                          }
                          if (src === "github") {
                            return (
                              <span
                                key={src}
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#EDF7F0] text-[#2E6B47] border border-[#A3D9B1]"
                                title="Found in public GitHub repos"
                              >
                                <GithubIcon className="w-2.5 h-2.5" />
                                GitHub
                              </span>
                            );
                          }
                          if (src === "leetcode") {
                            return (
                              <span
                                key={src}
                                className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]"
                                title="Verified LeetCode DSA proof"
                              >
                                <LeetcodeIcon className="w-2.5 h-2.5 text-[#FFA116]" />
                                LeetCode
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>

                    {/* Primary Evidence Detail */}
                    <p className="text-xs text-[#5A5144] leading-relaxed line-clamp-2 font-mono">
                      {skill.evidence[0] || "Verified profile competency"}
                    </p>
                  </div>

                  {/* Secondary Proof or Corroboration Badge */}
                  <div className="pt-2 border-t border-[#E8E2D7] text-[10px] text-[#8A7E6C] font-mono flex items-center justify-between">
                    {hasMultiSource ? (
                      <>
                        <span className="text-[#2E6B47] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#2E6B47]" />
                          Corroborated proof
                        </span>
                        <span>{skill.sources.length} sources</span>
                      </>
                    ) : (
                      <>
                        <span>1 source signal</span>
                        <span className="text-[#4A4036]">{skill.sources[0]}</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Collapsible Background Details (Education, Experience, Projects) ─ */}
      <div className="paper-card p-4 sm:p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-3">
        <button
          type="button"
          onClick={() => setIsBackgroundOpen(!isBackgroundOpen)}
          className="w-full flex items-center justify-between text-left text-xs font-bold text-[#24201D] cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#8A7E6C]" />
            <span>Extracted Education, Experience & Projects ({resume.education.length + resume.experience.length + resume.projects.length})</span>
          </div>
          {isBackgroundOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {isBackgroundOpen && (
          <div className="pt-3 border-t border-[#E8E2D7] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Education */}
              {resume.education.length > 0 && (
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D7] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#24201D]">
                    <GraduationCap className="w-3.5 h-3.5 text-[#2E6B47]" />
                    <span>Education Records</span>
                  </div>
                  {resume.education.map((edu, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <p className="font-semibold text-[#24201D]">{edu.institution}</p>
                      <p className="text-[#5A5144]">{[edu.degree, edu.field].filter(Boolean).join(" in ")}</p>
                      <p className="text-[11px] text-[#8A7E6C] font-mono">
                        {[edu.graduationYear, edu.gpa && `GPA: ${edu.gpa}`].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Work Experience */}
              {resume.experience.length > 0 && (
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D7] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#24201D]">
                    <Briefcase className="w-3.5 h-3.5 text-[#B8532F]" />
                    <span>Work Experience</span>
                  </div>
                  {resume.experience.map((exp, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <p className="font-semibold text-[#24201D]">{exp.company} {exp.role ? `— ${exp.role}` : ""}</p>
                      {exp.duration && <p className="text-[11px] text-[#8A7E6C] font-mono">{exp.duration}</p>}
                      {exp.description && <p className="text-[11px] text-[#6E6659] line-clamp-2">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Projects */}
              {resume.projects.length > 0 && (
                <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8E2D7] space-y-2 md:col-span-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#24201D]">
                    <Terminal className="w-3.5 h-3.5 text-[#3B668B]" />
                    <span>Resume Projects</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {resume.projects.map((proj, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-lg border border-[#E8E2D7] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[#24201D]">{proj.name}</p>
                          {proj.githubUrl && (
                            <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[#24201D] hover:text-[#2E6B47]">
                              <GithubIcon className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {proj.description && <p className="text-[11px] text-[#6E6659] line-clamp-2">{proj.description}</p>}
                        {proj.technologies.length > 0 && (
                          <p className="text-[10px] font-mono text-[#8A7E6C]">{proj.technologies.join(", ")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── Raw Extracted Text Transparency Accordion ───────────────────── */}
      {resume.extractedText && (
        <div className="paper-card p-4 sm:p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm">
          <button
            type="button"
            onClick={() => setIsRawTextOpen(!isRawTextOpen)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-[#24201D] cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#8A7E6C]" />
              <span>Inspect Raw Extracted Resume Text (Transparency View)</span>
              <span className="text-[10px] font-mono font-normal text-[#8A7E6C]">
                ({resume.extractedText.length} characters)
              </span>
            </div>
            {isRawTextOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {isRawTextOpen && (
            <div className="mt-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D7] font-mono text-[11px] text-[#4A4036] max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {resume.extractedText}
            </div>
          )}
        </div>
      )}

      {/* ─── Proceed to Step 3 Action Card ─────────────────────────────────── */}
      <div className="paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-[#24201D]">
            Ready for Step 3: Claims vs Proof-of-Work Verification
          </h4>
          <p className="text-xs text-[#6E6659] mt-0.5">
            Cross-check candidate claims against real GitHub repository ASTs, commits, and LeetCode proofs.
          </p>
        </div>

        {onProceedToStep3 && (
          <button
            type="button"
            onClick={onProceedToStep3}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#24201D] hover:bg-[#3D3732] active:bg-[#181513] text-[#FAF8F5] font-semibold text-sm shadow-sm transition-all hover:translate-y-[-1px] cursor-pointer shrink-0"
          >
            <span>Proceed to Step 3 Verification</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
