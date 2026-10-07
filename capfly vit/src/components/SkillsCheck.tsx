"use client";

import React, { useState } from "react";
import type {
  VerifiedSkill,
  VerificationStatus,
  SkillCategory,
  EvidenceItem,
} from "@/types/verification";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  GitBranch,
  Layers,
  BookOpen,
  Tag,
  Globe,
  HelpCircle,
} from "lucide-react";

interface SkillsCheckProps {
  skills: VerifiedSkill[];
  candidateName?: string;
  onRefreshVerification?: () => void;
}

export const SkillsCheck: React.FC<SkillsCheckProps> = ({ skills, candidateName }) => {
  const [statusFilter, setStatusFilter] = useState<"ALL" | VerificationStatus>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | SkillCategory>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSkillId, setExpandedSkillId] = useState<string | null>(null);

  // Filter skills
  const filteredSkills = skills.filter((item) => {
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesCategory = categoryFilter === "ALL" || item.category === categoryFilter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      item.normalizedSkill.toLowerCase().includes(searchLower) ||
      item.rawSkill.toLowerCase().includes(searchLower) ||
      item.category.toLowerCase().includes(searchLower) ||
      item.explanation.toLowerCase().includes(searchLower) ||
      item.evidence.some((e) => e.repository?.toLowerCase().includes(searchLower));

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const countByStatus = {
    ALL: skills.length,
    VERIFIED: skills.filter((s) => s.status === "VERIFIED").length,
    PARTIALLY_SUPPORTED: skills.filter((s) => s.status === "PARTIALLY_SUPPORTED").length,
    UNVERIFIED: skills.filter((s) => s.status === "UNVERIFIED").length,
    NOT_FOUND: skills.filter((s) => s.status === "NOT_FOUND").length,
  };

  const categoriesPresent = Array.from(new Set(skills.map((s) => s.category))).sort();

  const getStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#EDF7F0] text-[#1C5B36] border border-[#A3D9B1]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2E6B47]" />
            Verified
          </span>
        );
      case "PARTIALLY_SUPPORTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
            <AlertTriangle className="w-3.5 h-3.5 text-[#A16207]" />
            Partially Supported
          </span>
        );
      case "UNVERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
            <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />
            Unverified
          </span>
        );
      case "NOT_FOUND":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-[#FAF8F5] text-[#8A7E6C] border border-[#D6CEBE]">
            <HelpCircle className="w-3.5 h-3.5" />
            Not Found
          </span>
        );
    }
  };

  const getEvidenceTypeIcon = (type: EvidenceItem["evidenceType"]) => {
    switch (type) {
      case "language":
        return <GitBranch className="w-3.5 h-3.5 text-[#2E6B47]" />;
      case "readme":
        return <BookOpen className="w-3.5 h-3.5 text-[#3B668B]" />;
      case "topic":
        return <Tag className="w-3.5 h-3.5 text-[#8A7E6C]" />;
      case "project":
        return <Globe className="w-3.5 h-3.5 text-[#B8532F]" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-[#8A7E6C]" />;
    }
  };

  return (
    <div className="paper-card p-5 sm:p-7 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-6">
      {/* ─── Header and Search Controls ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#24201D]">
              Skill Claim vs Proof-of-Work Verification
            </h2>
            <span className="bg-[#FAF8F5] text-[#24201D] border border-[#D6CEBE] font-mono text-[11px] px-2 py-0.5 rounded-md font-semibold">
              STEP 3
            </span>
          </div>
          <p className="text-xs text-[#6E6659] mt-0.5">
            Cross-referencing claims from {candidateName ? `${candidateName}'s resume` : "your resume"} against public GitHub evidence.
          </p>
        </div>

        {/* Search input & Category dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {categoriesPresent.length > 1 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as "ALL" | SkillCategory)}
              aria-label="Filter skills by category"
              className="px-2.5 py-1.5 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] text-xs font-mono text-[#24201D] focus:outline-none focus:border-[#24201D] cursor-pointer"
            >
              <option value="ALL">All Categories ({categoriesPresent.length})</option>
              {categoriesPresent.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#8A7E6C] absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search skills, repos..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] text-xs text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF]"
            />
          </div>
        </div>
      </div>

      {/* ─── Filter Tabs & Summary Counters ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#E8E2D7] pb-3">
        {(
          [
            { id: "ALL", label: "All Skills", count: countByStatus.ALL },
            { id: "VERIFIED", label: "Verified", count: countByStatus.VERIFIED },
            { id: "PARTIALLY_SUPPORTED", label: "Partially Supported", count: countByStatus.PARTIALLY_SUPPORTED },
            { id: "UNVERIFIED", label: "Unverified", count: countByStatus.UNVERIFIED },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              statusFilter === tab.id
                ? "bg-[#24201D] text-[#FAF8F5] font-semibold shadow-xs"
                : "bg-[#FAF8F5] hover:bg-[#F0ECE1] text-[#6E6659] border border-[#D6CEBE]"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                statusFilter === tab.id
                  ? "bg-[#3D3732] text-[#FAF8F5]"
                  : tab.id === "VERIFIED"
                  ? "bg-[#EDF7F0] text-[#1C5B36]"
                  : tab.id === "PARTIALLY_SUPPORTED"
                  ? "bg-[#FEF9C3] text-[#854D0E]"
                  : tab.id === "UNVERIFIED"
                  ? "bg-[#FEE2E2] text-[#991B1B]"
                  : "bg-[#E8E2D7] text-[#4A4036]"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Verification Skills Table / Evidence Rows ──────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#D6CEBE] text-[11px] font-mono uppercase tracking-wider text-[#8A7E6C]">
              <th className="py-2.5 px-3">Skill / Capability</th>
              <th className="py-2.5 px-3">Verification Status</th>
              <th className="py-2.5 px-3">Evidence Rationale</th>
              <th className="py-2.5 px-3 text-right">Proof of Work</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E2D7] text-xs">
            {filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[#8A7E6C] font-mono">
                  No skills matching this filter or search query.
                </td>
              </tr>
            ) : (
              filteredSkills.map((skill) => {
                const isExpanded = expandedSkillId === skill.id;
                return (
                  <React.Fragment key={skill.id}>
                    <tr
                      className={`hover:bg-[#FAF8F5]/80 transition-colors ${
                        isExpanded ? "bg-[#FAF8F5]/60" : ""
                      }`}
                    >
                      {/* Skill Name & Category */}
                      <td className="py-3 px-3 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#24201D] text-sm">
                            {skill.normalizedSkill}
                          </span>
                          {skill.rawSkill.toLowerCase() !== skill.normalizedSkill.toLowerCase() && (
                            <span className="text-[10px] text-[#8A7E6C] font-mono">
                              ({skill.rawSkill})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-[#8A7E6C] font-mono bg-[#FAF8F5] border border-[#E8E2D7] px-1.5 py-0.2 rounded">
                            {skill.category}
                          </span>
                          {skill.sources.map((src) => (
                            <span
                              key={src}
                              className={`text-[9px] uppercase px-1 py-0.2 rounded font-mono font-bold ${
                                src === "resume"
                                  ? "bg-[#B8532F]/15 text-[#B8532F]"
                                  : "bg-[#2E6B47]/15 text-[#2E6B47]"
                              }`}
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3 align-top whitespace-nowrap">
                        {getStatusBadge(skill.status)}
                      </td>

                      {/* Dynamic Factual Explanation */}
                      <td className="py-3 px-3 align-top text-[#4A4036] max-w-md leading-relaxed">
                        <p>{skill.explanation}</p>
                      </td>

                      {/* Evidence Action / Details Trigger */}
                      <td className="py-3 px-3 align-top text-right whitespace-nowrap">
                        {skill.evidence.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2E6B47] hover:text-[#1C5B36] font-semibold bg-[#FAF8F5] hover:bg-[#E2EDE5] border border-[#D6CEBE] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>{skill.evidence.length} Evidence Point{skill.evidence.length > 1 ? "s" : ""}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setExpandedSkillId(isExpanded ? null : skill.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8A7E6C] hover:text-[#24201D] bg-[#FAF8F5] border border-[#D6CEBE] px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            <span>No Evidence</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Expandable Evidence Drawer Row */}
                    {isExpanded && (
                      <tr className="bg-[#FAF8F5]">
                        <td colSpan={4} className="py-3.5 px-4 border-b border-[#E8E2D7]">
                          <div className="bg-white p-4 rounded-xl border border-[#D6CEBE] space-y-3">
                            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-2">
                              <div className="flex items-center gap-2">
                                <Layers className="w-4 h-4 text-[#24201D]" />
                                <span className="font-bold text-xs text-[#24201D]">
                                  Observable Evidence Details for {skill.normalizedSkill}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-[#8A7E6C]">
                                Evidence Strength: <span className="font-bold uppercase text-[#24201D]">{skill.evidenceStrength}</span>
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              {/* Left: Claim Sources */}
                              <div className="space-y-2">
                                <span className="text-[10px] uppercase font-mono font-bold text-[#8A7E6C] block">
                                  Claim Sources ({skill.claims.length})
                                </span>
                                {skill.claims.length === 0 ? (
                                  <p className="text-[11px] text-[#8A7E6C] font-mono">
                                    Discovered directly from GitHub codebase without explicit resume claim.
                                  </p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {skill.claims.map((c, i) => (
                                      <div
                                        key={i}
                                        className="p-2 bg-[#FAF8F5] rounded-lg border border-[#E8E2D7] flex items-start gap-2"
                                      >
                                        <FileText className="w-3.5 h-3.5 text-[#B8532F] shrink-0 mt-0.5" />
                                        <div>
                                          <p className="font-semibold text-[#24201D] text-[11px]">
                                            {c.location || "Resume claim"}
                                          </p>
                                          {c.context && (
                                            <p className="text-[11px] text-[#6E6659]">
                                              {c.context}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              {/* Right: Observable Proof of Work */}
                              <div className="space-y-2">
                                <span className="text-[10px] uppercase font-mono font-bold text-[#8A7E6C] block">
                                  Observable Evidence ({skill.evidence.length})
                                </span>
                                {skill.evidence.length === 0 ? (
                                  <div className="p-2.5 bg-[#FAF5F2] rounded-lg border border-[#F5D5C6] text-[11px] text-[#8C3B1E]">
                                    No supporting public repositories, language records, topics, or project README files found.
                                  </div>
                                ) : (
                                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                    {skill.evidence.map((ev, i) => (
                                      <div
                                        key={i}
                                        className="p-2 bg-[#FAF8F5] rounded-lg border border-[#E8E2D7] space-y-1"
                                      >
                                        <div className="flex items-center justify-between gap-2">
                                          <div className="flex items-center gap-1.5 font-medium text-[11px] text-[#24201D]">
                                            {getEvidenceTypeIcon(ev.evidenceType)}
                                            <span>{ev.location || ev.repository || "Evidence Record"}</span>
                                          </div>
                                          {ev.url && (
                                            <a
                                              href={ev.url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="text-[#2E6B47] hover:underline inline-flex items-center gap-0.5 text-[10px] font-mono"
                                            >
                                              <span>View</span>
                                              <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          )}
                                        </div>
                                        {ev.context && (
                                          <p className="text-[11px] text-[#5A5144] font-mono bg-white p-1.5 rounded border border-[#E8E2D7] whitespace-pre-wrap">
                                            {ev.context}
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ─── Legend & Summary Footer ─────────────────────────────────────── */}
      <div className="pt-3 border-t border-[#E8E2D7] flex flex-wrap items-center justify-between text-[11px] text-[#8A7E6C] gap-2">
        <div className="flex flex-wrap items-center gap-4 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E6B47]" /> Verified: Observable in public GitHub codebase/languages
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#A16207]" /> Partially Supported: Detected in topics or documentation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B91C1C]" /> Unverified: Resume claim without repository proof
          </span>
        </div>

        <span className="text-[11px] font-mono text-[#6E6659]">
          {countByStatus.VERIFIED} of {skills.length} skills confirmed by proof of work
        </span>
      </div>
    </div>
  );
};
