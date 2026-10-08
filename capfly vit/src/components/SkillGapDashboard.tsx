"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  Target, CheckCircle2, AlertTriangle, XCircle, Eye, EyeOff,
  ChevronDown, ChevronUp, Search, Filter, TrendingUp, Zap,
  BookOpen, ArrowRight, Info, Shield, Star, BarChart3,
} from "lucide-react";
import type { SkillGapAnalysis, SkillGap, GapStatus, GapPriority } from "@/types/skillGap";
import type { SkillCategory } from "@/types/verification";
import {
  type RoleMarketData,
  fetchBenchmarkMetrics,
} from "@/services/backendApiService";

// ── Sub-types ─────────────────────────────────────────────────────

interface SkillGapDashboardProps {
  analysis: SkillGapAnalysis;
  darkMode?: boolean;
  roleMarketData?: Record<string, RoleMarketData> | null;
}

type FilterStatus = "all" | GapStatus;
type FilterCategory = "all" | SkillCategory;

// ── Status Config ─────────────────────────────────────────────────

const GAP_STATUS_CONFIG: Record<GapStatus, { label: string; shortLabel: string; icon: React.ReactNode; color: string; bg: string; border: string; darkColor: string; darkBg: string; darkBorder: string }> = {
  READY: {
    label: "Ready", shortLabel: "Ready",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-[#2E6B47]", bg: "bg-[#EDF7F0]", border: "border-[#86EFAC]",
    darkColor: "text-[#4ADE80]", darkBg: "bg-[#052e16]", darkBorder: "border-[#166534]",
  },
  PARTIAL_GAP: {
    label: "Partial Gap", shortLabel: "Partial",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-[#B45309]", bg: "bg-[#FEF9C3]", border: "border-[#FDE68A]",
    darkColor: "text-[#FCD34D]", darkBg: "bg-[#1c1500]", darkBorder: "border-[#92400e]",
  },
  EVIDENCE_GAP: {
    label: "Evidence Gap", shortLabel: "No Proof",
    icon: <Eye className="w-3.5 h-3.5" />,
    color: "text-[#9333EA]", bg: "bg-[#F3E8FF]", border: "border-[#D8B4FE]",
    darkColor: "text-[#C084FC]", darkBg: "bg-[#3b0764]", darkBorder: "border-[#7e22ce]",
  },
  SKILL_GAP: {
    label: "Skill Gap", shortLabel: "Missing",
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-[#DC2626]", bg: "bg-[#FEE2E2]", border: "border-[#FCA5A5]",
    darkColor: "text-[#FCA5A5]", darkBg: "bg-[#1c0101]", darkBorder: "border-[#7f1d1d]",
  },
};

const PRIORITY_CONFIG: Record<GapPriority, { label: string; color: string; darkColor: string }> = {
  CRITICAL: { label: "Critical", color: "text-[#DC2626]", darkColor: "text-[#FCA5A5]" },
  HIGH:     { label: "High",     color: "text-[#B45309]", darkColor: "text-[#FCD34D]" },
  MEDIUM:   { label: "Medium",   color: "text-[#2563EB]", darkColor: "text-[#93C5FD]" },
  LOW:      { label: "Low",      color: "text-[#6E6659]", darkColor: "text-[#9A9183]" },
};

// ── Evidence Modal ─────────────────────────────────────────────────

const EvidenceModal: React.FC<{ gap: SkillGap; onClose: () => void; darkMode: boolean }> = ({ gap, onClose, darkMode: dk }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
    <div
      className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 space-y-4 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={`text-base font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>{gap.normalizedSkill}</h3>
          <p className={`text-xs mt-0.5 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>Evidence Review</p>
        </div>
        <button type="button" onClick={onClose} className={`text-xs px-2 py-1 rounded border cursor-pointer ${dk ? "border-[#3D3A35] text-[#9A9183] hover:bg-[#2A2722]" : "border-[#D6CEBE] text-[#6E6659] hover:bg-[#FAF8F5]"}`}>Close</button>
      </div>

      <div className={`p-3 rounded-xl border text-xs ${dk ? "bg-[#141210] border-[#2E2B27]" : "bg-[#FAF8F5] border-[#E8E2D7]"}`}>
        <div className={`font-bold mb-1 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Role Requirement</div>
        <div className={`${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
          <span className={`font-semibold ${gap.requirement.importance === "required" ? (dk ? "text-[#FCA5A5]" : "text-[#DC2626]") : (dk ? "text-[#FCD34D]" : "text-[#B45309]")}`}>
            {gap.requirement.importance === "required" ? "Required" : "Preferred"}
          </span>
          {" — "}{gap.requirement.originalText}
        </div>
      </div>

      <div>
        <div className={`text-xs font-bold mb-2 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
          Student Evidence ({gap.evidence.length} item{gap.evidence.length !== 1 ? "s" : ""})
        </div>
        {gap.evidence.length === 0 ? (
          <div className={`p-3 rounded-xl border text-xs italic ${dk ? "bg-[#141210] border-[#2E2B27] text-[#9A9183]" : "bg-[#FAF8F5] border-[#E8E2D7] text-[#6E6659]"}`}>
            No supporting evidence was found in the submitted sources.
          </div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {gap.evidence.map((ev, idx) => (
              <div key={idx} className={`p-3 rounded-xl border text-xs space-y-1 ${dk ? "bg-[#141210] border-[#2E2B27]" : "bg-[#FAF8F5] border-[#E8E2D7]"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className={`font-semibold capitalize ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>{ev.source.replace("_", " ")}</span>
                  {ev.repository && <span className={`font-mono ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`}>{ev.repository}</span>}
                </div>
                {ev.location && <div className={dk ? "text-[#9A9183]" : "text-[#6E6659]"}>{ev.location}</div>}
                {ev.context && <div className={`italic line-clamp-2 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>"{ev.context}"</div>}
                {ev.url && (
                  <a href={ev.url} target="_blank" rel="noopener noreferrer" className={`underline break-all ${dk ? "text-[#93C5FD]" : "text-[#2563EB]"}`}>
                    {ev.url}
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={`p-3 rounded-xl border text-xs ${dk ? "bg-[#141210] border-[#2E2B27]" : "bg-[#FAF8F5] border-[#E8E2D7]"}`}>
        <div className={`font-bold mb-1 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Recommended Action</div>
        <div className={dk ? "text-[#9A9183]" : "text-[#6E6659]"}>{gap.recommendedAction}</div>
      </div>
    </div>
  </div>
);

// ── Gap Row Component ─────────────────────────────────────────────

const GapRow: React.FC<{ gap: SkillGap; darkMode: boolean; onViewEvidence: (gap: SkillGap) => void }> = ({ gap, darkMode: dk, onViewEvidence }) => {
  const [expanded, setExpanded] = useState(false);
  const statusCfg = GAP_STATUS_CONFIG[gap.gapStatus];
  const priorityCfg = PRIORITY_CONFIG[gap.priority];

  return (
    <div className={`rounded-xl border transition-all ${dk ? "bg-[#161412] border-[#2E2B27]" : "bg-white border-[#E8E2D7]"}`}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center gap-3 p-3.5 text-left cursor-pointer transition-colors rounded-xl ${dk ? "hover:bg-[#1C1A17]" : "hover:bg-[#FAF8F5]"}`}
        aria-expanded={expanded}
      >
        {/* Skill Name */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-bold truncate ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>{gap.normalizedSkill}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${dk ? "bg-[#2A2722] border-[#3D3A35] text-[#9A9183]" : "bg-[#F0ECE1] border-[#D6CEBE] text-[#6E6659]"}`}>{gap.category}</span>
          </div>
        </div>

        {/* Importance badge */}
        <span className={`hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${gap.requirement.importance === "required" ? (dk ? "bg-[#1c0101] text-[#FCA5A5]" : "bg-[#FEE2E2] text-[#DC2626]") : (dk ? "bg-[#1c1500] text-[#FCD34D]" : "bg-[#FEF9C3] text-[#B45309]")}`}>
          {gap.requirement.importance === "required" ? "Required" : "Preferred"}
        </span>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg font-bold border shrink-0 ${dk ? `${statusCfg.darkColor} ${statusCfg.darkBg} ${statusCfg.darkBorder}` : `${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}`}>
          {statusCfg.icon}
          <span className="hidden sm:inline">{statusCfg.label}</span>
        </span>

        {/* Priority */}
        {gap.gapStatus !== "READY" && (
          <span className={`hidden md:inline text-[10px] font-bold shrink-0 ${dk ? priorityCfg.darkColor : priorityCfg.color}`}>
            {priorityCfg.label}
          </span>
        )}

        {/* Expand chevron */}
        <span className={`shrink-0 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className={`px-3.5 pb-3.5 space-y-3 border-t ${dk ? "border-[#252220]" : "border-[#F0ECE1]"}`}>
          <p className={`text-xs leading-relaxed pt-2 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>{gap.explanation}</p>
          {gap.gapStatus !== "READY" && (
            <div className={`flex items-start gap-2 p-3 rounded-xl border text-xs ${dk ? "bg-[#0F0E0C] border-[#2E2B27]" : "bg-[#FAF8F5] border-[#E8E2D7]"}`}>
              <ArrowRight className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
              <span className={dk ? "text-[#EDE8DF]" : "text-[#24201D]"}>{gap.recommendedAction}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onViewEvidence(gap)}
            className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${dk ? "border-[#3D3A35] text-[#9A9183] hover:bg-[#2A2722]" : "border-[#D6CEBE] text-[#6E6659] hover:bg-[#F0ECE1]"}`}
          >
            <Eye className="w-3 h-3" />
            View Evidence ({gap.evidence.length})
          </button>
        </div>
      )}
    </div>
  );
};

// ── Main Dashboard Component ──────────────────────────────────────

export const SkillGapDashboard: React.FC<SkillGapDashboardProps> = ({
  analysis,
  darkMode = false,
  roleMarketData,
}) => {
  const dk = darkMode;
  const { summary, gaps, additionalStrengths } = analysis;

  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGap, setSelectedGap] = useState<SkillGap | null>(null);
  const [showStrengths, setShowStrengths] = useState(false);

  const [marketData, setMarketData] = useState<Record<string, RoleMarketData> | null>(
    roleMarketData || null
  );

  React.useEffect(() => {
    if (roleMarketData) {
      setMarketData(roleMarketData);
    } else {
      fetchBenchmarkMetrics().then((res) => {
        if (res?.role_market_data) {
          setMarketData(res.role_market_data);
        }
      });
    }
  }, [roleMarketData]);

  // Collect all unique categories dynamically from the gaps
  const availableCategories = useMemo(() => {
    const cats = new Set<SkillCategory>(gaps.map((g) => g.category));
    return Array.from(cats).sort();
  }, [gaps]);

  // Filter logic
  const filteredGaps = useMemo(() => {
    return gaps.filter((gap) => {
      if (filterStatus !== "all" && gap.gapStatus !== filterStatus) return false;
      if (filterCategory !== "all" && gap.category !== filterCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !gap.normalizedSkill.toLowerCase().includes(q) &&
          !gap.rawSkill.toLowerCase().includes(q) &&
          !gap.category.toLowerCase().includes(q) &&
          !gap.explanation.toLowerCase().includes(q)
        ) return false;
      }
      return true;
    });
  }, [gaps, filterStatus, filterCategory, searchQuery]);

  const readinessBar = Math.min(100, Math.max(0, summary.readinessScore));

  // Top priority gaps (non-ready, sorted by priority, first 5)
  const topGaps = useMemo(() =>
    gaps.filter((g) => g.gapStatus !== "READY").slice(0, 5),
  [gaps]);

  const handleViewEvidence = useCallback((gap: SkillGap) => {
    setSelectedGap(gap);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* ── Evidence Modal ──────────────────────────────────────────── */}
      {selectedGap && (
        <EvidenceModal gap={selectedGap} onClose={() => setSelectedGap(null)} darkMode={dk} />
      )}

      {/* ── Header Card ─────────────────────────────────────────────── */}
      <div className={`rounded-2xl border p-6 shadow-xs ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${dk ? "bg-[#2A2722] text-[#4ADE80]" : "bg-[#EDF7F0] text-[#2E6B47]"}`}>
                Step 5 • Skill Gap Analysis
              </span>
              {summary.hasJobDescription && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${dk ? "bg-[#1c1500] text-[#FCD34D]" : "bg-[#FEF9C3] text-[#B45309]"}`}>
                  JD-Powered
                </span>
              )}
            </div>
            <h2 className={`text-2xl font-black tracking-tight ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              Skill Gap Analysis
            </h2>
            <p className={`text-xs mt-1 max-w-xl leading-relaxed ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Target Role: <span className="font-semibold">{summary.targetRole}</span>
              {analysis.requirementSource === "job_description" && " • Requirements from your job description"}
              {analysis.requirementSource === "role_baseline" && " • Requirements from role baseline"}
              {analysis.requirementSource === "mixed" && " • Requirements from JD + role baseline"}
            </p>
          </div>

          {/* Readiness Score */}
          <div className={`p-4 rounded-xl border text-center shrink-0 min-w-[110px] ${dk ? "bg-[#242119] border-[#3D3A35]" : "bg-[#FAF8F5] border-[#D6CEBE]"}`}>
            <div className={`text-[10px] font-semibold mb-1 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>Role Readiness</div>
            <div className={`text-3xl font-black ${summary.readinessScore >= 75 ? (dk ? "text-[#4ADE80]" : "text-[#2E6B47]") : summary.readinessScore >= 50 ? (dk ? "text-[#FCD34D]" : "text-[#B45309]") : (dk ? "text-[#FCA5A5]" : "text-[#DC2626]")}`}>
              {summary.readinessScore}%
            </div>
            <div className={`text-[10px] font-medium mt-0.5 ${summary.isRoleReady ? "text-[#4ADE80]" : (dk ? "text-[#9A9183]" : "text-[#6E6659]")}`}>
              {summary.isRoleReady ? "Role Ready" : "Gaps Detected"}
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className={`mt-4 p-3 rounded-xl border text-xs font-medium leading-relaxed ${dk ? "bg-[#0F0E0C] border-[#2E2B27] text-[#9A9183]" : "bg-[#FAF8F5] border-[#E8E2D7] text-[#6E6659]"}`}>
          <Info className="w-3.5 h-3.5 inline mr-1.5 opacity-60" />{summary.verdict}
        </div>

        {/* Readiness Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-[11px]">
            <span className={dk ? "text-[#9A9183]" : "text-[#6E6659]"}>Role Readiness</span>
            <span className={`font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>{summary.readinessScore}%</span>
          </div>
          <div className={`h-2 rounded-full ${dk ? "bg-[#2A2722]" : "bg-[#E8E2D7]"}`} role="progressbar" aria-valuenow={readinessBar} aria-valuemin={0} aria-valuemax={100} aria-label="Role readiness score">
            <div
              className={`h-full rounded-full transition-all duration-700 ${summary.readinessScore >= 75 ? "bg-emerald-500" : summary.readinessScore >= 50 ? "bg-amber-400" : "bg-red-500"}`}
              style={{ width: `${readinessBar}%` }}
            />
          </div>
        </div>

        {/* Warnings */}
        {analysis.warnings.length > 0 && (
          <div className="mt-4 space-y-1">
            {analysis.warnings.map((w, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs p-2.5 rounded-lg border ${dk ? "bg-[#1c1500] border-[#92400e] text-[#FCD34D]" : "bg-[#FEF9C3] border-[#FDE68A] text-[#B45309]"}`}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{w}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Stats Overview ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: "Ready", value: summary.readyCount, status: "READY" as GapStatus },
          { label: "Partial Gap", value: summary.partialGapCount, status: "PARTIAL_GAP" as GapStatus },
          { label: "Evidence Gap", value: summary.evidenceGapCount, status: "EVIDENCE_GAP" as GapStatus },
          { label: "Skill Gap", value: summary.skillGapCount, status: "SKILL_GAP" as GapStatus },
        ] as const).map((stat) => {
          const cfg = GAP_STATUS_CONFIG[stat.status];
          const isActive = filterStatus === stat.status;
          return (
            <button
              key={stat.status}
              type="button"
              onClick={() => setFilterStatus(isActive ? "all" : stat.status)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${isActive ? (dk ? `${cfg.darkBg} ${cfg.darkBorder}` : `${cfg.bg} ${cfg.border}`) : (dk ? "bg-[#1C1A17] border-[#2E2B27] hover:border-[#3D3A35]" : "bg-white border-[#D6CEBE] hover:border-[#B5AFA6]")}`}
              aria-pressed={isActive}
              aria-label={`Filter by ${stat.label}: ${stat.value} skills`}
            >
              <div className={`flex items-center gap-1.5 mb-2 ${dk ? cfg.darkColor : cfg.color}`}>
                {cfg.icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className={`text-2xl font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>{stat.value}</div>
              <div className={`text-[10px] mt-0.5 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>of {summary.totalRequirements} skills</div>
            </button>
          );
        })}
      </div>

      {/* ── Visual Gap Bar ─────────────────────────────────────────── */}
      {summary.totalRequirements > 0 && (
        <div className={`rounded-2xl border p-5 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className={`w-4 h-4 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
            <h3 className={`text-sm font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Gap Distribution</h3>
          </div>
          <div className="h-4 rounded-full overflow-hidden flex" role="img" aria-label="Gap distribution bar chart">
            {summary.readyCount > 0 && (
              <div style={{ width: `${(summary.readyCount / summary.totalRequirements) * 100}%` }} className="bg-emerald-500 h-full" title={`Ready: ${summary.readyCount}`} />
            )}
            {summary.partialGapCount > 0 && (
              <div style={{ width: `${(summary.partialGapCount / summary.totalRequirements) * 100}%` }} className="bg-amber-400 h-full" title={`Partial: ${summary.partialGapCount}`} />
            )}
            {summary.evidenceGapCount > 0 && (
              <div style={{ width: `${(summary.evidenceGapCount / summary.totalRequirements) * 100}%` }} className="bg-purple-500 h-full" title={`Evidence Gap: ${summary.evidenceGapCount}`} />
            )}
            {summary.skillGapCount > 0 && (
              <div style={{ width: `${(summary.skillGapCount / summary.totalRequirements) * 100}%` }} className="bg-red-500 h-full" title={`Skill Gap: ${summary.skillGapCount}`} />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px]">
            {[
              { label: "Ready", count: summary.readyCount, color: "bg-emerald-500" },
              { label: "Partial Gap", count: summary.partialGapCount, color: "bg-amber-400" },
              { label: "Evidence Gap", count: summary.evidenceGapCount, color: "bg-purple-500" },
              { label: "Skill Gap", count: summary.skillGapCount, color: "bg-red-500" },
            ].filter(l => l.count > 0).map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 rounded-sm ${l.color}`} />
                <span className={dk ? "text-[#9A9183]" : "text-[#6E6659]"}>{l.label}: <strong className={dk ? "text-[#EDE8DF]" : "text-[#24201D]"}>{l.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Top Priority Gaps ──────────────────────────────────────── */}
      {topGaps.length > 0 && (
        <div className={`rounded-2xl border p-5 space-y-4 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${dk ? "text-[#FCD34D]" : "text-[#B45309]"}`} />
            <h3 className={`text-sm font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Top Gaps to Work On</h3>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${dk ? "bg-[#2A2722] text-[#9A9183]" : "bg-[#F0ECE1] text-[#6E6659]"}`}>
              Prioritized
            </span>
          </div>

          <div className="space-y-2.5">
            {topGaps.map((gap, idx) => {
              const statusCfg = GAP_STATUS_CONFIG[gap.gapStatus];
              const priorityCfg = PRIORITY_CONFIG[gap.priority];

              const getMarketTelemetry = (skillName: string): { demand: string; cohortGap: string } => {
                const sLower = skillName.toLowerCase();
                if (marketData) {
                  for (const [key, val] of Object.entries(marketData)) {
                    const kLower = key.toLowerCase();
                    if (
                      sLower.includes(kLower) ||
                      kLower.includes(sLower) ||
                      (sLower.includes("docker") && kLower.includes("docker")) ||
                      ((sLower.includes("database") || sLower.includes("sql") || sLower.includes("postgres") || sLower.includes("relational")) &&
                        (kLower.includes("database") || kLower.includes("sql"))) ||
                      ((sLower.includes("rest") || sLower.includes("api")) &&
                        (kLower.includes("rest") || kLower.includes("api"))) ||
                      ((sLower.includes("architecture") || sLower.includes("ci/cd")) &&
                        (kLower.includes("architecture") || kLower.includes("ci/cd"))) ||
                      ((sLower.includes("dsa") || sLower.includes("algorithm")) &&
                        (kLower.includes("algorithm") || kLower.includes("structure")))
                    ) {
                      return {
                        demand: `${val.market_demand}% of SDE-1 postings`,
                        cohortGap: `${val.cohort_gap}% unverified`,
                      };
                    }
                  }
                }

                if (sLower.includes("docker") || sLower.includes("container")) {
                  return { demand: "78% of SDE-1 postings", cohortGap: "81% unverified" };
                }
                if (sLower.includes("database") || sLower.includes("sql") || sLower.includes("postgres") || sLower.includes("mysql") || sLower.includes("relational")) {
                  return { demand: "86% of SDE-1 postings", cohortGap: "62% unverified" };
                }
                if (sLower.includes("rest") || sLower.includes("api")) {
                  return { demand: "92% of SDE-1 postings", cohortGap: "44% unverified" };
                }
                if (sLower.includes("ci/cd") || sLower.includes("pipeline") || sLower.includes("architecture")) {
                  return { demand: "65% of SDE-1 postings", cohortGap: "73% unverified" };
                }
                return { demand: "70% of SDE-1 postings", cohortGap: "68% unverified" };
              };

              const telemetry = getMarketTelemetry(gap.normalizedSkill);

              return (
                <div key={gap.skillId} className={`flex items-start gap-3 p-3.5 rounded-xl border ${dk ? "bg-[#161412] border-[#252220]" : "bg-[#FAF8F5] border-[#E8E2D7]"}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${dk ? "bg-[#2A2722] text-[#9A9183]" : "bg-[#E8E2D7] text-[#6E6659]"}`}>
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold text-sm ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>{gap.normalizedSkill}</span>
                      <span className={`text-[10px] font-bold ${dk ? priorityCfg.darkColor : priorityCfg.color}`}>
                        {priorityCfg.label} Priority
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-bold border ${dk ? `${statusCfg.darkColor} ${statusCfg.darkBg} ${statusCfg.darkBorder}` : `${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}`}>
                        {statusCfg.icon}<span>{statusCfg.shortLabel}</span>
                      </span>
                    </div>

                    {/* Market Distribution Telemetry */}
                    <div className={`mt-1.5 inline-flex items-center gap-1.5 flex-wrap text-[11px] font-mono px-2.5 py-1 rounded-lg border ${
                      dk ? "bg-[#141210] border-[#2E2B27] text-[#D4C8B5]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#5C5245]"
                    }`}>
                      <TrendingUp className={`w-3.5 h-3.5 shrink-0 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
                      <span>Market Demand: <strong className={dk ? "text-[#EDE8DF]" : "text-[#24201D]"}>{telemetry.demand}</strong></span>
                      <span className="opacity-40">•</span>
                      <span>Cohort Gap: <strong className={dk ? "text-[#FCD34D]" : "text-[#B45309]"}>{telemetry.cohortGap}</strong></span>
                    </div>

                    <p className={`text-xs mt-1.5 leading-relaxed ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>{gap.recommendedAction}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {topGaps.length >= 2 && (
            <div className={`text-xs p-3 rounded-xl border italic ${dk ? "bg-[#141210] border-[#2E2B27] text-[#5C5751]" : "bg-[#FAF8F5] border-[#E8E2D7] text-[#8A7E6C]"}`}>
              <BookOpen className="w-3 h-3 inline mr-1.5 opacity-60" />
              {`These gaps are prioritized because ${topGaps.filter(g => g.requirement.importance === "required").length > 0 ? `${topGaps.filter(g => g.requirement.importance === "required").length} are required skill(s) for the ${summary.targetRole} role` : `they appear in the requirements for the ${summary.targetRole} role`}${topGaps.filter(g => g.gapStatus === "EVIDENCE_GAP").length > 0 ? ` and ${topGaps.filter(g => g.gapStatus === "EVIDENCE_GAP").length} have insufficient proof-of-work evidence` : ""}.`}
            </div>
          )}
        </div>
      )}

      {/* ── Full Gap Table ──────────────────────────────────────────── */}
      <div className={`rounded-2xl border ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
        <div className={`p-5 border-b ${dk ? "border-[#252220]" : "border-[#E8E2D7]"}`}>
          <div className="flex items-center gap-2 mb-4">
            <Target className={`w-4 h-4 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
            <h3 className={`text-sm font-bold flex-1 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              All Skills Analysis
              <span className={`ml-2 text-[11px] font-normal ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>({filteredGaps.length} of {gaps.length})</span>
            </h3>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search */}
            <div className={`relative flex-1 flex items-center rounded-xl border ${dk ? "bg-[#141210] border-[#2E2B27]" : "bg-[#FAF8F5] border-[#D6CEBE]"}`}>
              <Search className={`w-3.5 h-3.5 absolute left-3 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search skills…"
                className={`w-full bg-transparent pl-8 pr-3 py-2 text-xs outline-none ${dk ? "text-[#EDE8DF] placeholder:text-[#5C5751]" : "text-[#24201D] placeholder:text-[#8A7E6C]"}`}
                aria-label="Search skills"
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className={`w-3.5 h-3.5 shrink-0 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`} />
              {(["all", "READY", "PARTIAL_GAP", "EVIDENCE_GAP", "SKILL_GAP"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFilterStatus(s)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer transition-colors ${filterStatus === s ? (dk ? "bg-[#EDE8DF] text-[#0F0E0C] border-[#EDE8DF]" : "bg-[#24201D] text-[#FAF8F5] border-[#24201D]") : (dk ? "border-[#3D3A35] text-[#9A9183] hover:border-[#5C5751]" : "border-[#D6CEBE] text-[#6E6659] hover:border-[#B5AFA6]")}`}
                  aria-pressed={filterStatus === s}
                >
                  {s === "all" ? "All" : s === "PARTIAL_GAP" ? "Partial" : s === "EVIDENCE_GAP" ? "Evidence" : s === "SKILL_GAP" ? "Missing" : "Ready"}
                </button>
              ))}
            </div>
          </div>

          {/* Category filter — only if there are multiple categories */}
          {availableCategories.length > 1 && (
            <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
              <button
                type="button"
                onClick={() => setFilterCategory("all")}
                className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer transition-colors ${filterCategory === "all" ? (dk ? "bg-[#2A2722] text-[#EDE8DF] border-[#3D3A35]" : "bg-[#F0ECE1] text-[#24201D] border-[#D6CEBE]") : (dk ? "border-[#252220] text-[#5C5751]" : "border-[#E8E2D7] text-[#8A7E6C]")}`}
              >All Categories</button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFilterCategory(filterCategory === cat ? "all" : cat)}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-semibold cursor-pointer transition-colors ${filterCategory === cat ? (dk ? "bg-[#2A2722] text-[#EDE8DF] border-[#3D3A35]" : "bg-[#F0ECE1] text-[#24201D] border-[#D6CEBE]") : (dk ? "border-[#252220] text-[#5C5751]" : "border-[#E8E2D7] text-[#8A7E6C]")}`}
                  aria-pressed={filterCategory === cat}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-2">
          {filteredGaps.length === 0 ? (
            <div className={`text-center py-10 text-sm ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              No skills match the current filter. <button type="button" onClick={() => { setFilterStatus("all"); setFilterCategory("all"); setSearchQuery(""); }} className="underline cursor-pointer">Clear filters</button>
            </div>
          ) : (
            filteredGaps.map((gap) => (
              <GapRow key={gap.skillId} gap={gap} darkMode={dk} onViewEvidence={handleViewEvidence} />
            ))
          )}
        </div>
      </div>

      {/* ── Additional Strengths ────────────────────────────────────── */}
      {additionalStrengths.length > 0 && (
        <div className={`rounded-2xl border ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
          <button
            type="button"
            onClick={() => setShowStrengths(!showStrengths)}
            className={`w-full flex items-center justify-between p-5 cursor-pointer transition-colors rounded-2xl ${dk ? "hover:bg-[#242119]" : "hover:bg-[#FAF8F5]"}`}
            aria-expanded={showStrengths}
          >
            <div className="flex items-center gap-2">
              <Star className={`w-4 h-4 ${dk ? "text-[#FCD34D]" : "text-[#B45309]"}`} />
              <h3 className={`text-sm font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                Additional Strengths
                <span className={`ml-2 text-[11px] font-normal ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                  ({additionalStrengths.length} verified skills beyond this role's requirements)
                </span>
              </h3>
            </div>
            {showStrengths ? <ChevronUp className={`w-4 h-4 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`} /> : <ChevronDown className={`w-4 h-4 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`} />}
          </button>
          {showStrengths && (
            <div className={`px-5 pb-5 border-t ${dk ? "border-[#252220]" : "border-[#E8E2D7]"}`}>
              <p className={`text-xs mt-3 mb-3 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>These skills are verified in your profile but are not required for the target role. They are additional assets — do not treat them as gaps.</p>
              <div className="flex flex-wrap gap-2">
                {additionalStrengths.map((skill) => (
                  <span key={skill} className={`text-xs px-2.5 py-1 rounded-full border font-medium ${dk ? "bg-[#052e16] text-[#4ADE80] border-[#166534]" : "bg-[#EDF7F0] text-[#2E6B47] border-[#86EFAC]"}`}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
