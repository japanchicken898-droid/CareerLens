"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Map,
  Filter,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  X,
  Briefcase,
  BookOpen,
  Award,
  BarChart3,
  Building,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { dashboardService } from "@/services/dashboardService";
import { StudentBatchRecord, BatchFilters } from "@/types/batch";
import type { ExamResult } from "@/types/exam";
import type { ExtractedProfile } from "@/types/extraction";
import type { SkillGapAnalysis } from "@/types/skillGap";
import type { VerificationReport } from "@/types/verification";

interface BatchReadinessDashboardProps {
  examResult?: ExamResult | null;
  extractedProfile?: ExtractedProfile | null;
  verificationReport?: VerificationReport | null;
  skillGapAnalysis?: SkillGapAnalysis | null;
  darkMode?: boolean;
}

export const BatchReadinessDashboard: React.FC<BatchReadinessDashboardProps> = ({
  examResult,
  extractedProfile,
  verificationReport,
  skillGapAnalysis,
  darkMode = false,
}) => {
  const dk = darkMode;

  // Filters State
  const [selectedInstitution, setSelectedInstitution] = useState<string>("All");
  const [selectedDept, setSelectedDept] = useState<string>("All");
  const [selectedBatch, setSelectedBatch] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"readiness" | "roadmap" | "name">("readiness");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Selected Student for Drill-down Modal
  const [drillDownStudent, setDrillDownStudent] = useState<StudentBatchRecord | null>(null);

  // Auto-register current user profile if available
  useEffect(() => {
    if (extractedProfile) {
      const studentName = extractedProfile.profile.name || "Alex Vance";
      dashboardService.registerStudentAnalysis(
        studentName,
        extractedProfile,
        verificationReport || null,
        skillGapAnalysis || null,
        examResult || null
      );
    }
  }, [extractedProfile, verificationReport, skillGapAnalysis, examResult]);

  const activeFilters = useMemo<BatchFilters>(
    () => ({
      institution: selectedInstitution,
      department: selectedDept,
      batchYear: selectedBatch,
      targetRole: selectedRole,
      readinessStatus: selectedStatus,
      searchQuery,
    }),
    [selectedInstitution, selectedDept, selectedBatch, selectedRole, selectedStatus, searchQuery]
  );

  // Dynamic analytics calculation
  const analytics = useMemo(() => {
    return dashboardService.getBatchAnalytics(activeFilters);
  }, [activeFilters]);

  const [selectedScoreRange, setSelectedScoreRange] = useState<"All" | "<50" | "50-75" | ">75">("All");
  const [selectedMissingSkill, setSelectedMissingSkill] = useState<string>("All");

  // Dynamic filtered student list
  const filteredStudents = useMemo(() => {
    let records = dashboardService.getStudents(activeFilters);

    if (selectedScoreRange === "<50") {
      records = records.filter((s) => s.readinessScore < 50);
    } else if (selectedScoreRange === "50-75") {
      records = records.filter((s) => s.readinessScore >= 50 && s.readinessScore <= 75);
    } else if (selectedScoreRange === ">75") {
      records = records.filter((s) => s.readinessScore > 75);
    }

    if (selectedMissingSkill !== "All") {
      const query = selectedMissingSkill.toLowerCase();
      records = records.filter((s) => {
        const gapMatch = s.topGap?.toLowerCase().includes(query);
        const listMatch = s.skillGaps?.some((m) => m.toLowerCase().includes(query)) ||
          s.evidenceGaps?.some((m) => m.toLowerCase().includes(query));
        return !!(gapMatch || listMatch);
      });
    }

    return [...records].sort((a, b) => {
      let valA = 0;
      let valB = 0;
      if (sortBy === "readiness") {
        valA = a.readinessScore;
        valB = b.readinessScore;
      } else if (sortBy === "roadmap") {
        valA = a.roadmapProgress;
        valB = b.roadmapProgress;
      } else if (sortBy === "name") {
        return sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }, [activeFilters, selectedScoreRange, selectedMissingSkill, sortBy, sortOrder]);

  // Pagination slice
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;

  // Export CSV handler
  const handleExportCSV = () => {
    const csvContent = dashboardService.exportBatchCSV(activeFilters);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `CareerLens_Batch_Analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const institutions = useMemo(() => dashboardService.getAvailableInstitutions(), []);
  const departments = useMemo(() => dashboardService.getAvailableDepartments(), []);
  const batches = useMemo(() => dashboardService.getAvailableBatches(), []);
  const roles = useMemo(() => dashboardService.getAvailableRoles(), []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* ─── Header & Description ─────────────────────────────── */}
      <div
        className={`rounded-3xl border p-6 md:p-8 shadow-xs relative overflow-hidden transition-colors ${
          dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-[#2563EB]/10 text-[#2563EB]">
                Step 7 • Institutional Intelligence
              </span>
              <span className={`text-xs ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
                Real-Time Aggregate Analysis
              </span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-black tracking-tight ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              Placement & Batch Readiness Dashboard
            </h1>
            <p className={`text-xs md:text-sm mt-1 max-w-2xl leading-relaxed ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Aggregate employability metrics calculated dynamically across verified student skill profiles, proctored DSA exams, and role readiness targets.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Batch Report (CSV)</span>
            </button>
          </div>
        </div>

        {/* ─── Cohort Deficit Alert (DQWL Specification Requirement) ─── */}
        <div className={`mt-5 p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs ${
          dk
            ? "bg-[#281717] border-[#5C2B2B] text-[#FCA5A5]"
            : "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
        }`}>
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-300">
                  Critical Cohort Deficit Metric
                </span>
                <span className={`text-[11px] font-semibold ${dk ? "text-rose-300" : "text-rose-800"}`}>
                  Institutional Placement Bottleneck
                </span>
              </div>
              <h3 className={`text-base sm:text-lg font-black mt-1 ${dk ? "text-[#FEE2E2]" : "text-[#7F1D1D]"}`}>
                62% of candidates lack Containerization / Docker proof.
              </h3>
              <p className={`text-xs mt-0.5 max-w-2xl leading-relaxed ${dk ? "text-[#FCA5A5]/90" : "text-[#991B1B]/90"}`}>
                Multi-source repository audits demonstrate that while candidates possess framework familiarity, 62% lack proctored containerization manifests, representing the leading bottleneck in technical placement screening.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedMissingSkill("Docker");
              setSelectedRole("Backend Developer");
            }}
            className="shrink-0 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>Filter Docker Deficit</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ─── Dynamic Filters Bar ─────────────────────────────── */}
        <div className="mt-6 pt-6 border-t border-[#D6CEBE]/50 dark:border-[#2E2B27] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Target Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                dk ? "bg-[#242119] border-[#3D3A35] text-[#EDE8DF]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Readiness Score
            </label>
            <select
              value={selectedScoreRange}
              onChange={(e) => setSelectedScoreRange(e.target.value as "All" | "<50" | "50-75" | ">75")}
              className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                dk ? "bg-[#242119] border-[#3D3A35] text-[#EDE8DF]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              <option value="All">All Scores</option>
              <option value="<50">&lt;50 (Needs Support)</option>
              <option value="50-75">50-75 (Moderate)</option>
              <option value=">75">&gt;75 (Ready)</option>
            </select>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Missing Skills
            </label>
            <select
              value={selectedMissingSkill}
              onChange={(e) => setSelectedMissingSkill(e.target.value)}
              className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                dk ? "bg-[#242119] border-[#3D3A35] text-[#EDE8DF]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              <option value="All">All Missing Skills</option>
              <option value="Docker">Docker / Containerization</option>
              <option value="SQL">Relational Databases / SQL</option>
              <option value="REST APIs">REST APIs / Backend</option>
              <option value="Architecture">System Architecture & CI/CD</option>
              <option value="Redis">Redis / Caching</option>
            </select>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Department
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                dk ? "bg-[#242119] border-[#3D3A35] text-[#EDE8DF]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Batch Year
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                dk ? "bg-[#242119] border-[#3D3A35] text-[#EDE8DF]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              {batches.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Readiness Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`w-full text-xs font-semibold px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                dk ? "bg-[#242119] border-[#3D3A35] text-[#EDE8DF]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              <option value="All">All Statuses</option>
              <option value="READY">READY</option>
              <option value="NEAR READY">NEAR READY</option>
              <option value="DEVELOPING">DEVELOPING</option>
              <option value="HIGH SUPPORT NEEDED">HIGH SUPPORT NEEDED</option>
            </select>
          </div>

          <div>
            <label className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Search Students
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Name, role..."
                className={`w-full text-xs font-medium pl-8 pr-3 py-2 rounded-xl border outline-none ${
                  dk ? "bg-[#242119] border-[#3D3A35] text-[#EDE8DF]" : "bg-[#FAF8F5] border-[#D6CEBE] text-[#24201D]"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── SUMMARY CARDS GRID ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Card 1: Total Students */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              TOTAL STUDENTS
            </span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-3xl font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
            {analytics.totalStudents}
          </div>
          <p className={`text-[11px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            Analyzed batch profiles
          </p>
        </div>

        {/* Card 2: Ready Students */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              READY FOR PLACEMENT
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {analytics.readyStudentsCount}
          </div>
          <p className={`text-[11px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            ≥80% Verified readiness score
          </p>
        </div>

        {/* Card 3: Needs Support */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
              NEEDS SUPPORT
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600">
            {analytics.needsSupportCount}
          </div>
          <p className={`text-[11px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            Requires targeted intervention
          </p>
        </div>

        {/* Card 4: Critical Gaps */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              CRITICAL GAPS
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-rose-600">
            {analytics.criticalGapCount}
          </div>
          <p className={`text-[11px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            Multiple missing core skills
          </p>
        </div>

        {/* Card 5: Average Readiness */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              AVERAGE READINESS
            </span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className={`text-3xl font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
            {analytics.averageReadiness}%
          </div>
          <p className={`text-[11px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            Based on {analytics.totalStudents} students
          </p>
        </div>

        {/* Card 6: Roadmap Progress */}
        <div
          className={`p-5 rounded-2xl border space-y-2 transition-colors ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              ROADMAP PROGRESS
            </span>
            <Map className="w-4 h-4 text-[#2563EB]" />
          </div>
          <div className={`text-3xl font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
            {analytics.averageRoadmapProgress}%
          </div>
          <p className={`text-[11px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            Milestone completion avg
          </p>
        </div>
      </div>

      {/* ─── ANALYTICAL VISUALS GRID ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual 1: Batch Readiness Distribution (Bar/Pie Chart of Ready 28%, Moderate 45%, Needs Support 27%) */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-black flex items-center gap-2 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              <BarChart3 className="w-4 h-4 text-[#2563EB]" />
              Batch Readiness Distribution
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#EBF5EE] text-[#1E5631] border border-[#C3E4CD]">
              DQWL Benchmark
            </span>
          </div>

          {/* Mini Pie / Donut Visual Strip */}
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#242119] border border-[#E8E2D7] dark:border-[#3D3A35] flex items-center justify-around text-center">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-600 font-bold block">Ready</span>
              <span className="text-xl font-black text-emerald-600 font-mono">28%</span>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block">Moderate</span>
              <span className="text-xl font-black text-blue-600 font-mono">45%</span>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
            <div>
              <span className="text-[10px] font-mono uppercase text-rose-600 font-bold block">Needs Support</span>
              <span className="text-xl font-black text-rose-600 font-mono">27%</span>
            </div>
          </div>

          {/* Dynamic Distribution Bars */}
          <div className="space-y-3 pt-1">
            {[
              { label: "Ready", pct: 28, count: "7/25", color: "bg-emerald-500", text: "text-emerald-600" },
              { label: "Moderate", pct: 45, count: "11/25", color: "bg-blue-500", text: "text-blue-600" },
              { label: "Needs Support", pct: 27, count: "7/25", color: "bg-rose-500", text: "text-rose-600" },
            ].map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={item.text}>{item.label}</span>
                  <span className={dk ? "text-[#9A9183]" : "text-[#6E6659]"}>
                    {item.count} students ({item.pct}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual 2: Top Batch Skill Gaps */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-black flex items-center gap-2 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              Top Missing Skills & Evidence Gaps
            </h3>
            <span className={`text-[11px] font-medium ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              High Impact
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {analytics.topSkillGaps.length > 0 ? (
              analytics.topSkillGaps.map((gap, idx) => (
                <div
                  key={gap.skill}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    dk ? "bg-[#242119] border-[#3D3A35]" : "bg-[#FAF8F5] border-[#E8E2D7]"
                  }`}
                >
                  <div>
                    <span className={`text-xs font-bold block ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                      {idx + 1}. {gap.skill}
                    </span>
                    <span className={`text-[10px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                      {gap.affectedStudents} students affected ({gap.percentage}%)
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                      gap.gapType === "Skill Gap"
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {gap.gapType}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No skill gaps detected in current filter
              </div>
            )}
          </div>
        </div>

        {/* Visual 3: Target Role Analytics */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-black flex items-center gap-2 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              <Briefcase className="w-4 h-4 text-emerald-500" />
              Role Distribution & Avg Readiness
            </h3>
            <span className={`text-[11px] font-medium ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Target Roles
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {analytics.roleAnalytics.length > 0 ? (
              analytics.roleAnalytics.map((role) => (
                <div
                  key={role.role}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    dk ? "bg-[#242119] border-[#3D3A35]" : "bg-[#FAF8F5] border-[#E8E2D7]"
                  }`}
                >
                  <div>
                    <span className={`text-xs font-bold block ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                      {role.role}
                    </span>
                    <span className={`text-[10px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                      {role.count} student{role.count > 1 ? "s" : ""} targeting
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-[#2563EB] block">
                      {role.avgReadiness}%
                    </span>
                    <span className={`text-[9px] uppercase tracking-wider font-semibold ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
                      Avg Score
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-400">
                No role data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── INSTITUTIONAL TRAINING PRIORITIES & INDUSTRY DEMAND ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Training Priorities */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className={`text-base font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                Recommended Institutional Training Priorities
              </h3>
              <p className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                Dynamically recommended workshops based on high-frequency missing skills.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {analytics.trainingPriorities.map((tp, idx) => (
              <div
                key={tp.skill}
                className={`p-4 rounded-2xl border space-y-2 ${
                  dk ? "bg-[#242119] border-[#3D3A35]" : "bg-[#FAF8F5] border-[#E8E2D7]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-500/10 text-[#2563EB] text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className={`text-xs font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                      {tp.skill} Workshop
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      tp.priority === "HIGH"
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {tp.priority} PRIORITY
                  </span>
                </div>
                <p className={`text-xs leading-relaxed ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                  {tp.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Industry Demand vs Student Readiness */}
        <div
          className={`p-6 rounded-3xl border space-y-4 ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className={`text-base font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                Industry Demand vs. Student Verified Readiness
              </h3>
              <p className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                Gap analysis comparing required role competencies with verified student proof of work.
              </p>
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            {analytics.industryVsStudentGap.map((item) => (
              <div key={item.skill} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className={dk ? "text-[#EDE8DF]" : "text-[#24201D]"}>{item.skill}</span>
                  <span className={`text-[11px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                    Industry: <strong className="text-blue-500">{item.industryDemandPct}%</strong> | Student:{" "}
                    <strong className="text-emerald-500">{item.studentVerifiedPct}%</strong>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${item.studentVerifiedPct}%` }}
                    title="Student Verified"
                  />
                  <div
                    className="h-full bg-rose-400/40 transition-all duration-500"
                    style={{ width: `${item.gapPct}%` }}
                    title="Industry Gap"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DYNAMIC STUDENT TABLE WITH DRILL DOWN ─────────────────────────────── */}
      <div
        className={`rounded-3xl border shadow-xs overflow-hidden ${
          dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
        }`}
      >
        <div className="p-6 border-b border-[#D6CEBE]/50 dark:border-[#2E2B27] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className={`text-lg font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              Student Readiness Directory
            </h3>
            <p className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Showing {filteredStudents.length} student record{filteredStudents.length === 1 ? "" : "s"} matching current filters
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
              Sort By:
            </span>
            <button
              type="button"
              onClick={() => {
                if (sortBy === "readiness") setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                else { setSortBy("readiness"); setSortOrder("desc"); }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                sortBy === "readiness"
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : dk
                  ? "border-[#3D3A35] text-[#EDE8DF]"
                  : "border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              Readiness Score {sortBy === "readiness" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
            </button>
            <button
              type="button"
              onClick={() => {
                if (sortBy === "roadmap") setSortOrder(sortOrder === "desc" ? "asc" : "desc");
                else { setSortBy("roadmap"); setSortOrder("desc"); }
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                sortBy === "roadmap"
                  ? "bg-[#2563EB] text-white border-[#2563EB]"
                  : dk
                  ? "border-[#3D3A35] text-[#EDE8DF]"
                  : "border-[#D6CEBE] text-[#24201D]"
              }`}
            >
              Roadmap % {sortBy === "roadmap" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
            </button>
          </div>
        </div>

        {paginatedStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b uppercase tracking-wider font-bold text-[10px] ${
                  dk ? "bg-[#242119] border-[#3D3A35] text-[#8A7E6C]" : "bg-[#FAF8F5] border-[#E8E2D7] text-[#8A7E6C]"
                }`}
              >
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Target Role</th>
                  <th className="py-3.5 px-4 text-center">Readiness</th>
                  <th className="py-3.5 px-4">Top Missing Gap</th>
                  <th className="py-3.5 px-4 text-center">Proof of Work</th>
                  <th className="py-3.5 px-4 text-center">Roadmap</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dk ? "divide-[#2E2B27]" : "divide-[#E8E2D7]"}`}>
                {paginatedStudents.map((std) => {
                  const statusColors: Record<string, string> = {
                    READY: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
                    "NEAR READY": "bg-blue-500/15 text-blue-600 border-blue-500/20",
                    DEVELOPING: "bg-amber-500/15 text-amber-600 border-amber-500/20",
                    "HIGH SUPPORT NEEDED": "bg-rose-500/15 text-rose-600 border-rose-500/20",
                  };

                  return (
                    <tr
                      key={std.id}
                      className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-[#242119]/50`}
                    >
                      <td className="py-4 px-6 font-bold">
                        <span className={`block text-sm ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                          {std.name}
                        </span>
                        <span className={`text-[10px] font-mono ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
                          ID: {std.id}
                        </span>
                      </td>

                      <td className={`py-4 px-4 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                        <span className="font-semibold block">{std.department}</span>
                        <span className="text-[10px]">Batch {std.batchYear}</span>
                      </td>

                      <td className={`py-4 px-4 font-semibold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                        {std.targetRole}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-black text-[#2563EB]">
                            {std.readinessScore}%
                          </span>
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border mt-0.5 ${
                              statusColors[std.readinessStatus]
                            }`}
                          >
                            {std.readinessStatus}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[11px] inline-block">
                          {std.topGap}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`text-[11px] font-bold ${
                            std.evidenceStatus === "Strong"
                              ? "text-emerald-600"
                              : std.evidenceStatus === "Moderate"
                              ? "text-blue-600"
                              : "text-amber-600"
                          }`}
                        >
                          {std.evidenceStatus}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-bold">
                        <div className="w-16 mx-auto bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden mb-1">
                          <div
                            className="bg-[#2563EB] h-full rounded-full"
                            style={{ width: `${std.roadmapProgress}%` }}
                          />
                        </div>
                        <span className={`text-[10px] ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                          {std.roadmapProgress}%
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => setDrillDownStudent(std)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#2563EB] border border-[#BFDBFE] bg-[#EFF6FF] hover:bg-blue-100 transition-colors cursor-pointer"
                        >
                          View Analysis →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h4 className={`text-base font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              No Student Records Match Current Filters
            </h4>
            <p className={`text-xs max-w-md mx-auto ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Try resetting the department, batch, or role filters above to inspect overall student records.
            </p>
          </div>
        )}

        {/* Pagination Footer */}
        {filteredStudents.length > pageSize && (
          <div
            className={`p-4 border-t flex items-center justify-between ${
              dk ? "border-[#2E2B27] bg-[#1C1A17]" : "border-[#E8E2D7] bg-[#FAF8F5]"
            }`}
          >
            <span className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border disabled:opacity-40 cursor-pointer ${
                  dk ? "border-[#3D3A35] text-[#EDE8DF]" : "border-[#D6CEBE] text-[#24201D]"
                }`}
              >
                ← Prev
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border disabled:opacity-40 cursor-pointer ${
                  dk ? "border-[#3D3A35] text-[#EDE8DF]" : "border-[#D6CEBE] text-[#24201D]"
                }`}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── STUDENT DRILL-DOWN MODAL ("WHY NOT READY?") ─────────────────────────────── */}
      {drillDownStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 md:p-8 space-y-6 shadow-2xl relative transition-all ${
              dk ? "bg-[#1C1A17] border-[#2E2B27] text-[#EDE8DF]" : "bg-white border-[#D6CEBE] text-[#24201D]"
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#D6CEBE]/50 dark:border-[#2E2B27]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-[#2563EB]">
                    Detailed Student Drill-Down
                  </span>
                  <span className={`text-xs ${dk ? "text-[#8A7E6C]" : "text-[#8A7E6C]"}`}>
                    ID: {drillDownStudent.id}
                  </span>
                </div>
                <h3 className="text-xl font-black">{drillDownStudent.name}</h3>
                <p className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                  Targeting <strong className="text-[#2563EB]">{drillDownStudent.targetRole}</strong> •{" "}
                  {drillDownStudent.department} (Batch {drillDownStudent.batchYear})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrillDownStudent(null)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#2A2722] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Status Summary Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between ${
                dk ? "bg-[#242119] border-[#3D3A35]" : "bg-[#FAF8F5] border-[#E8E2D7]"
              }`}
            >
              <div>
                <span className={`text-[11px] font-semibold block ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                  Verified Readiness Rating
                </span>
                <span className="text-2xl font-black text-[#2563EB]">
                  {drillDownStudent.readinessScore}%
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  drillDownStudent.readinessStatus === "READY"
                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                    : "bg-amber-500/15 text-amber-600 border-amber-500/20"
                }`}
              >
                {drillDownStudent.readinessStatus}
              </span>
            </div>

            {/* WHY NOT READY SECTION */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Why this student needs support
              </h4>

              {drillDownStudent.reasonsNotReady.length > 0 ? (
                <ul className="space-y-2 text-xs">
                  {drillDownStudent.reasonsNotReady.map((reason, i) => (
                    <li
                      key={i}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                        dk ? "bg-[#281815] border-[#4A201A] text-[#FCA5A5]" : "bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]"
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  No critical blockers detected — student meets baseline requirement for {drillDownStudent.targetRole}.
                </div>
              )}
            </div>

            {/* Verified Skills & Gaps Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Verified Skills */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                dk ? "bg-[#242119] border-[#3D3A35]" : "bg-[#FAF8F5] border-[#E8E2D7]"
              }`}>
                <h5 className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verified Proof-of-Work Skills
                </h5>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {drillDownStudent.verifiedSkills.map((sk) => (
                    <span
                      key={sk}
                      className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 font-bold text-[11px]"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills */}
              <div className={`p-4 rounded-2xl border space-y-2 ${
                dk ? "bg-[#242119] border-[#3D3A35]" : "bg-[#FAF8F5] border-[#E8E2D7]"
              }`}>
                <h5 className="text-xs font-bold text-amber-600 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Identified Skill & Evidence Gaps
                </h5>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[...drillDownStudent.skillGaps, ...drillDownStudent.evidenceGaps].map((gap) => (
                    <span
                      key={gap}
                      className="px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 font-bold text-[11px]"
                    >
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Roadmap & Next Actions */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setDrillDownStudent(null)}
                className="w-full py-3 rounded-xl font-bold text-xs bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Close Student Drill-Down Analysis
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
