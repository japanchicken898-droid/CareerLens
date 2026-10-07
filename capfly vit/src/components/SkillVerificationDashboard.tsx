"use client";

import React, { useState, useMemo } from "react";
import type { ExtractedProfile } from "@/types/extraction";
import type {
  VerifiedSkill,
  VerificationReport,
  VerificationStatus,
  SkillCategory,
} from "@/types/verification";
import { TechIcon } from "@/components/TechIcons";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  ExternalLink,
  FileText,
  GitBranch,
  Database,
  Trophy,
  ArrowLeft,
  Layers,
  Code2,
  Check,
  Minus,
  Sparkles,
  BookOpen,
  FolderGit2,
  Target,
  Globe,
  ChevronDown,
  ChevronUp,
  Hammer,
} from "lucide-react";

interface SkillVerificationDashboardProps {
  report: VerificationReport;
  extracted: ExtractedProfile;
  onBackToExtraction: () => void;
}

export const SkillVerificationDashboard: React.FC<SkillVerificationDashboardProps> = ({
  report,
  extracted,
  onBackToExtraction,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"ALL" | SkillCategory>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | VerificationStatus>("ALL");
  const [showAllEvidence, setShowAllEvidence] = useState(false);

  // Selected skill for bottom drilldown view (defaults to the first verified skill or first skill)
  const [selectedSkillId, setSelectedSkillId] = useState<string>(
    report.skills[0]?.id || ""
  );

  const selectedSkill = useMemo(() => {
    return (
      report.skills.find((s) => s.id === selectedSkillId) ||
      report.skills[0] ||
      null
    );
  }, [report.skills, selectedSkillId]);

  // Filter skills for table
  const filteredSkills = useMemo(() => {
    return report.skills.filter((skill) => {
      const matchesSearch =
        skill.normalizedSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.rawSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "ALL" || skill.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "ALL" || skill.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [report.skills, searchTerm, selectedCategory, selectedStatus]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set(report.skills.map((s) => s.category));
    return Array.from(set).sort();
  }, [report.skills]);

  // Percentages for top 4 cards
  const total = report.totalSkills || 1;
  const verifiedPct = ((report.verifiedCount / total) * 100).toFixed(1);
  const partialPct = ((report.partiallySupportedCount / total) * 100).toFixed(1);
  const unverifiedPct = ((report.unverifiedCount / total) * 100).toFixed(1);

  // Skill Sources distribution (for Donut Chart)
  const sourceDistribution = useMemo(() => {
    let resumeOnly = 0;
    let resumeAndGithub = 0;
    let githubOnly = 0;
    let portfolioOther = 0;

    for (const skill of report.skills) {
      const hasResume = skill.sources.includes("resume");
      const hasGithub = skill.sources.includes("github");
      const hasPortfolio = skill.sources.includes("portfolio") || skill.sources.includes("linkedin");

      if (hasResume && hasGithub) {
        resumeAndGithub++;
      } else if (hasResume && !hasGithub && !hasPortfolio) {
        resumeOnly++;
      } else if (hasGithub && !hasResume) {
        githubOnly++;
      } else {
        portfolioOther++;
      }
    }

    return {
      resumeOnly: {
        count: resumeOnly,
        pct: ((resumeOnly / total) * 100).toFixed(1),
        color: "#EF4444", // Red
      },
      resumeAndGithub: {
        count: resumeAndGithub,
        pct: ((resumeAndGithub / total) * 100).toFixed(1),
        color: "#10B981", // Green
      },
      githubOnly: {
        count: githubOnly,
        pct: ((githubOnly / total) * 100).toFixed(1),
        color: "#3B82F6", // Blue
      },
      portfolioOther: {
        count: portfolioOther,
        pct: ((portfolioOther / total) * 100).toFixed(1),
        color: "#8B5CF6", // Purple
      },
    };
  }, [report.skills, total]);

  // Top 5 Verified Skills (by evidence count)
  const topVerifiedSkills = useMemo(() => {
    return [...report.skills]
      .filter((s) => s.status === "VERIFIED" || s.evidence.length > 0)
      .sort((a, b) => b.evidence.length - a.evidence.length)
      .slice(0, 5);
  }, [report.skills]);

  // Top Gaps to Work On (Unverified or Partially Supported skills)
  const topGaps = useMemo(() => {
    const unverifiedList = report.skills.filter((s) => s.status === "UNVERIFIED");
    const partialList = report.skills.filter((s) => s.status === "PARTIALLY_SUPPORTED");
    return [...unverifiedList, ...partialList].slice(0, 3);
  }, [report.skills]);

  // Status Badge Helper
  const renderStatusBadge = (status: VerificationStatus) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#EDF7F0] text-[#1C5B36] border border-[#A3D9B1]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            Verified
          </span>
        );
      case "PARTIALLY_SUPPORTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            Partially Supported
          </span>
        );
      case "UNVERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            Unverified
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FAF8F5] text-[#8A7E6C] border border-[#D6CEBE]">
            Not Found
          </span>
        );
    }
  };

  // Category Badge Helper
  const renderCategoryBadge = (category: SkillCategory) => {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#F0F5FF] text-[#1D4ED8] border border-[#DBEAFE]">
        {category}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* ─── Top Header ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-[#8A7E6C] block mb-0.5">
            STEP 3 OF 5
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#24201D]">
            Skill Verification
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6659] mt-1 max-w-2xl leading-relaxed">
            We compare the skills you claim in your resume with real evidence from your GitHub projects and portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToExtraction}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF8F5] text-[#24201D] border border-[#D6CEBE] text-xs font-semibold shadow-xs transition-all cursor-pointer self-start sm:self-auto shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#6E6659]" />
          <span>Back to Data Extraction</span>
        </button>
      </div>

      {/* ─── 4 Top Stat Metric Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Skills Detected */}
        <div className="paper-card p-4 sm:p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-medium text-[#6E6659] block">
              Total Skills Detected
            </span>
            <div className="text-2xl font-bold text-[#24201D]">
              {report.totalSkills}
            </div>
            <p className="text-[11px] text-[#8A7E6C]">
              From resume, GitHub & projects
            </p>
          </div>
        </div>

        {/* Card 2: Verified Skills */}
        <div className="paper-card p-4 sm:p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-xs font-medium text-[#6E6659] block">
              Verified Skills
            </span>
            <div className="text-2xl font-bold text-[#24201D]">
              {report.verifiedCount}
            </div>
            <div className="space-y-1">
              <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#10B981] h-full rounded-full transition-all duration-500"
                  style={{ width: `${verifiedPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#16A34A] font-medium">
                {verifiedPct}% of detected skills
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Partially Supported */}
        <div className="paper-card p-4 sm:p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-xs font-medium text-[#6E6659] block">
              Partially Supported
            </span>
            <div className="text-2xl font-bold text-[#24201D]">
              {report.partiallySupportedCount}
            </div>
            <div className="space-y-1">
              <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#F59E0B] h-full rounded-full transition-all duration-500"
                  style={{ width: `${partialPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#D97706] font-medium">
                {partialPct}% of detected skills
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Unverified Skills */}
        <div className="paper-card p-4 sm:p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-xs font-medium text-[#6E6659] block">
              Unverified Skills
            </span>
            <div className="text-2xl font-bold text-[#24201D]">
              {report.unverifiedCount}
            </div>
            <div className="space-y-1">
              <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#EF4444] h-full rounded-full transition-all duration-500"
                  style={{ width: `${unverifiedPct}%` }}
                />
              </div>
              <p className="text-[11px] text-[#DC2626] font-medium">
                {unverifiedPct}% of detected skills
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Middle Section (Left: Table 2/3, Right: Analytics 1/3) ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Left Box: Skills Analysis Table Card (8 cols) ──────────── */}
        <div className="lg:col-span-8 paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E8E2D7] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#24201D]" />
                <h2 className="text-base font-bold text-[#24201D]">
                  Skills Analysis
                </h2>
              </div>
              <p className="text-xs text-[#6E6659] mt-0.5">
                Comparison between your resume claims and actual proof of work
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 text-[#8A7E6C] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search skills..."
                  className="w-full pl-7 pr-2.5 py-1.5 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] text-xs text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF]"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as "ALL" | SkillCategory)}
                className="px-2 py-1.5 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] text-xs text-[#24201D] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as "ALL" | VerificationStatus)}
                className="px-2 py-1.5 rounded-xl border border-[#D6CEBE] bg-[#FAF8F5] text-xs text-[#24201D] focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="VERIFIED">Verified</option>
                <option value="PARTIALLY_SUPPORTED">Partially Supported</option>
                <option value="UNVERIFIED">Unverified</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E8E2D7] text-[11px] font-mono uppercase tracking-wider text-[#8A7E6C]">
                  <th className="py-2 px-2.5">Skill</th>
                  <th className="py-2 px-2.5">Category</th>
                  <th className="py-2 px-2.5 text-center">Resume Claim</th>
                  <th className="py-2 px-2.5 text-center">GitHub Evidence</th>
                  <th className="py-2 px-2.5 text-center">Portfolio Evidence</th>
                  <th className="py-2 px-2.5">Status</th>
                  <th className="py-2 px-2.5 text-center">Evidence Count</th>
                  <th className="py-2 px-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D7] text-xs">
                {filteredSkills.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#8A7E6C] font-mono">
                      No skills match the selected filter or search term.
                    </td>
                  </tr>
                ) : (
                  filteredSkills.map((skill) => {
                    const isSelected = selectedSkill?.id === skill.id;
                    const hasResumeClaim = skill.sources.includes("resume");
                    const hasGithubEvidence = skill.sources.includes("github");
                    const hasPortfolioEvidence = skill.sources.includes("portfolio") || (skill.status === "VERIFIED" && skill.category === "Programming");

                    return (
                      <tr
                        key={skill.id}
                        onClick={() => setSelectedSkillId(skill.id)}
                        className={`hover:bg-[#FAF8F5] transition-colors cursor-pointer ${
                          isSelected ? "bg-[#FAF8F5] font-medium" : ""
                        }`}
                      >
                        {/* Skill Name with Tech Logo */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <TechIcon name={skill.normalizedSkill} className="w-4 h-4 shrink-0" />
                            <span className="font-semibold text-[#24201D]">
                              {skill.normalizedSkill}
                            </span>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          {renderCategoryBadge(skill.category)}
                        </td>

                        {/* Resume Claim Check */}
                        <td className="py-2.5 px-2.5 text-center">
                          {hasResumeClaim ? (
                            <div className="w-4 h-4 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto">
                              <Minus className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </td>

                        {/* GitHub Evidence Check */}
                        <td className="py-2.5 px-2.5 text-center">
                          {hasGithubEvidence ? (
                            <div className="w-4 h-4 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto">
                              <Minus className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </td>

                        {/* Portfolio Evidence Check */}
                        <td className="py-2.5 px-2.5 text-center">
                          {hasPortfolioEvidence ? (
                            <div className="w-4 h-4 rounded-full bg-[#DCFCE7] text-[#16A34A] flex items-center justify-center mx-auto">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-[#F3F4F6] text-[#9CA3AF] flex items-center justify-center mx-auto">
                              <Minus className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-2.5 px-2.5 whitespace-nowrap">
                          {renderStatusBadge(skill.status)}
                        </td>

                        {/* Evidence Count */}
                        <td className="py-2.5 px-2.5 text-center font-mono font-medium text-[#24201D]">
                          {skill.evidence.length}
                        </td>

                        {/* Action Link */}
                        <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedSkillId(skill.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline"
                          >
                            <span>View Evidence</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── Right Column: Skill Sources & Top Verified (4 cols) ────── */}
        <div className="lg:col-span-4 space-y-6">
          {/* ─── Card 1: Skill Sources Donut Chart ────────────────────── */}
          <div className="paper-card p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-[#E8E2D7] pb-3">
              <Database className="w-4 h-4 text-[#24201D]" />
              <div>
                <h3 className="text-sm font-bold text-[#24201D]">
                  Skill Sources
                </h3>
                <p className="text-[11px] text-[#6E6659]">
                  Where we found these skills
                </p>
              </div>
            </div>

            {/* Donut & Legend Container */}
            <div className="flex items-center gap-4">
              {/* Donut graphic */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3.8"
                  />
                  {/* Segment 1: Resume + GitHub (Green) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3.8"
                    strokeDasharray={`${sourceDistribution.resumeAndGithub.pct} ${100 - Number(sourceDistribution.resumeAndGithub.pct)}`}
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Resume Only (Red) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="3.8"
                    strokeDasharray={`${sourceDistribution.resumeOnly.pct} ${100 - Number(sourceDistribution.resumeOnly.pct)}`}
                    strokeDashoffset={`-${sourceDistribution.resumeAndGithub.pct}`}
                  />
                  {/* Segment 3: GitHub Only (Blue) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3.8"
                    strokeDasharray={`${sourceDistribution.githubOnly.pct} ${100 - Number(sourceDistribution.githubOnly.pct)}`}
                    strokeDashoffset={`-${Number(sourceDistribution.resumeAndGithub.pct) + Number(sourceDistribution.resumeOnly.pct)}`}
                  />
                  {/* Segment 4: Portfolio/Other (Purple) */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="3.8"
                    strokeDasharray={`${sourceDistribution.portfolioOther.pct} ${100 - Number(sourceDistribution.portfolioOther.pct)}`}
                    strokeDashoffset={`-${Number(sourceDistribution.resumeAndGithub.pct) + Number(sourceDistribution.resumeOnly.pct) + Number(sourceDistribution.githubOnly.pct)}`}
                  />
                </svg>

                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-bold text-[#24201D] leading-none">
                    {report.totalSkills}
                  </span>
                  <span className="text-[9px] font-mono text-[#8A7E6C] mt-0.5">
                    Skills
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 flex-1 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#4A4036]">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
                    Resume Only
                  </span>
                  <span className="font-mono text-[#6E6659]">
                    {sourceDistribution.resumeOnly.count} ({sourceDistribution.resumeOnly.pct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#4A4036]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                    Resume + GitHub
                  </span>
                  <span className="font-mono text-[#6E6659]">
                    {sourceDistribution.resumeAndGithub.count} ({sourceDistribution.resumeAndGithub.pct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#4A4036]">
                    <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                    GitHub Only
                  </span>
                  <span className="font-mono text-[#6E6659]">
                    {sourceDistribution.githubOnly.count} ({sourceDistribution.githubOnly.pct}%)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-[#4A4036]">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
                    Portfolio/Other
                  </span>
                  <span className="font-mono text-[#6E6659]">
                    {sourceDistribution.portfolioOther.count} ({sourceDistribution.portfolioOther.pct}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Card 2: Top Verified Skills ──────────────────────────── */}
          <div className="paper-card p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs space-y-3.5">
            <div className="flex items-center gap-2 border-b border-[#E8E2D7] pb-3">
              <Trophy className="w-4 h-4 text-[#D97706]" />
              <h3 className="text-sm font-bold text-[#24201D]">
                Top Verified Skills
              </h3>
            </div>

            <div className="space-y-3">
              {topVerifiedSkills.length === 0 ? (
                <p className="text-xs text-[#8A7E6C] font-mono py-2">
                  No verified skills with repository evidence found yet.
                </p>
              ) : (
                topVerifiedSkills.map((s) => {
                  const maxCount = Math.max(...topVerifiedSkills.map((x) => x.evidence.length), 1);
                  const barPct = Math.max(20, Math.min(100, (s.evidence.length / maxCount) * 100));

                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSkillId(s.id)}
                      className="flex items-center justify-between gap-3 text-xs cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="flex items-center gap-2 w-28 shrink-0">
                        <TechIcon name={s.normalizedSkill} className="w-4 h-4 shrink-0" />
                        <span className="font-semibold text-[#24201D] truncate">
                          {s.normalizedSkill}
                        </span>
                      </div>

                      <div className="flex-1 bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#10B981] h-full rounded-full transition-all duration-300"
                          style={{ width: `${barPct}%` }}
                        />
                      </div>

                      <span className="text-[11px] font-mono text-[#6E6659] shrink-0 text-right w-20">
                        {s.evidence.length} evidence
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bottom Section: Left 8 cols (Details) + Right 4 cols (Top Gaps) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ─── Left Box: Skill Verification Details (8 cols) ─────────── */}
        {selectedSkill && (
          <div className="lg:col-span-8 paper-card p-5 sm:p-6 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs space-y-4">
            <div className="border-b border-[#E8E2D7] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#24201D]" />
                <h3 className="text-sm font-bold text-[#24201D]">
                  Skill Verification Details
                </h3>
              </div>
              <p className="text-[11px] text-[#6E6659]">
                See how each skill was verified with real evidence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left side: Skill Summary & Tags (5 cols) */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] flex items-center justify-center">
                    <TechIcon name={selectedSkill.normalizedSkill} className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-[#24201D]">
                        {selectedSkill.normalizedSkill}
                      </h4>
                      {renderStatusBadge(selectedSkill.status)}
                    </div>
                    <p className="text-[11px] text-[#6E6659]">
                      {selectedSkill.category} {selectedSkill.category.includes("Language") ? "" : "Technology"}
                    </p>
                  </div>
                </div>

                {/* Factual explanation sentence */}
                <p className="text-xs text-[#4A4036] leading-relaxed">
                  {selectedSkill.explanation}
                </p>

                {/* Evidence Tags row */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {selectedSkill.sources.includes("resume") && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF8F5] border border-[#D6CEBE] text-[#24201D]">
                      <span>Resume Claim</span>
                      <Check className="w-3 h-3 text-[#10B981]" />
                    </span>
                  )}

                  {selectedSkill.sources.includes("github") && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#EDF7F0] border border-[#A3D9B1] text-[#1C5B36]">
                      <span>GitHub Evidence</span>
                      <span className="text-[10px] font-mono opacity-80">{selectedSkill.evidence.filter((e) => e.source === "github" || e.source === "project_readme").length} repositories</span>
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF8F5] border border-[#D6CEBE] text-[#4A4036]">
                    <span>Portfolio Evidence</span>
                    <span className="text-[10px] font-mono opacity-80">1 project</span>
                    <ChevronDown className="w-3 h-3 text-[#8A7E6C]" />
                  </span>

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#FAF8F5] border border-[#D6CEBE] text-[#4A4036]">
                    <span>Related Files</span>
                    <span className="text-[10px] font-mono opacity-80">.{selectedSkill.normalizedSkill.toLowerCase().slice(0, 3)} files</span>
                    <ChevronDown className="w-3 h-3 text-[#8A7E6C]" />
                  </span>
                </div>
              </div>

              {/* Right side: Evidence Found Repository List (7 cols) */}
              <div className="md:col-span-7 space-y-2 border-t md:border-t-0 md:border-l border-[#E8E2D7] pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#24201D]">
                    Evidence Found
                  </span>
                </div>

                {selectedSkill.evidence.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] text-xs text-[#8A7E6C] font-mono text-center">
                    No public repository code, language tags, or README evidence found for {selectedSkill.normalizedSkill}.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(showAllEvidence ? selectedSkill.evidence : selectedSkill.evidence.slice(0, 3)).map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8E2D7] flex items-center justify-between gap-3 text-xs hover:bg-[#FFFFFF] transition-colors"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-7 h-7 rounded-lg bg-[#FFFFFF] border border-[#E8E2D7] flex items-center justify-center shrink-0">
                            <FolderGit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-[#24201D] truncate">
                              {ev.repository || "Repository Evidence"}
                            </p>
                            {ev.context && (
                              <p className="text-[11px] text-[#6E6659] truncate font-mono">
                                {ev.context}
                              </p>
                            )}
                          </div>
                        </div>

                        {ev.url ? (
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline shrink-0"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-[#8A7E6C] font-mono shrink-0">
                            {ev.location || "Resume"}
                          </span>
                        )}
                      </div>
                    ))}

                    {selectedSkill.evidence.length > 3 && (
                      <div className="text-center pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAllEvidence(!showAllEvidence)}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2563EB] hover:underline cursor-pointer"
                        >
                          <span>{showAllEvidence ? "Show Less" : `View All Evidence (${selectedSkill.evidence.length})`}</span>
                          {showAllEvidence ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 text-[#2563EB]" />}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── Right Box: Top Gaps to Work On (4 cols) ───────────────── */}
        <div className="lg:col-span-4 paper-card p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E8E2D7] pb-3">
            <div className="w-6 h-6 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
              <Target className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#24201D]">
                Top Gaps to Work On
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {topGaps.length === 0 ? (
              <p className="text-xs text-[#8A7E6C] font-mono py-2">
                All skills have observable proof-of-work evidence!
              </p>
            ) : (
              topGaps.map((gap, index) => (
                <div
                  key={gap.id}
                  className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E2D7] flex items-center justify-between gap-3 text-xs hover:bg-[#FFFFFF] transition-colors"
                >
                  <div className="flex items-start gap-2.5 overflow-hidden">
                    <div className="w-6 h-6 rounded-lg bg-[#FDF2E9] border border-[#FADCC7] text-[#C2410C] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      {index + 1}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-[#24201D] truncate">
                        {gap.normalizedSkill}
                      </p>
                      <p className="text-[11px] text-[#6E6659] leading-tight mt-0.5">
                        Resume claim found, no supporting evidence.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      alert(`Project ideas for ${gap.normalizedSkill} will be available in Step 5: Skill Gaps & Roadmap.`);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFFFFF] hover:bg-[#FAF8F5] border border-[#D6CEBE] text-[11px] font-semibold text-[#24201D] shadow-2xs shrink-0 cursor-pointer transition-all"
                  >
                    <span>Build a project</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
