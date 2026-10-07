"use client";

import React from "react";
import {
  Trophy,
  XCircle,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  Target,
  AlertTriangle,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import type { ExamResult } from "@/types/exam";

interface ExamResultPageProps {
  result: ExamResult;
  onContinue: () => void;
  darkMode?: boolean;
}

export const ExamResultPage: React.FC<ExamResultPageProps> = ({
  result,
  onContinue,
  darkMode = false,
}) => {
  const dk = darkMode;
  const r = result;

  const submitReasonLabel: Record<string, string> = {
    MANUAL: "Submitted by student",
    TIME_EXPIRED: "Time Expired — Auto-submitted",
    INTEGRITY_VIOLATION: "Auto-submitted — Integrity Violation",
    AUTO: "Auto-submitted",
  };

  const levelColor = (level: string) => {
    if (level === "Strong") return dk ? "text-[#4ADE80]" : "text-[#15803D]";
    if (level === "Good") return dk ? "text-[#93C5FD]" : "text-[#1D4ED8]";
    if (level === "Developing") return dk ? "text-[#FCD34D]" : "text-[#B45309]";
    return dk ? "text-[#FCA5A5]" : "text-[#DC2626]";
  };

  const levelBg = (level: string) => {
    if (level === "Strong") return dk ? "bg-[#052e16] border-[#166534]" : "bg-[#EDF7F0] border-[#86EFAC]";
    if (level === "Good") return dk ? "bg-[#0d1a2e] border-[#1e3a5f]" : "bg-[#DBEAFE] border-[#93C5FD]";
    if (level === "Developing") return dk ? "bg-[#1c1500] border-[#92400e]" : "bg-[#FEF9C3] border-[#FDE68A]";
    return dk ? "bg-[#1c0101] border-[#7f1d1d]" : "bg-[#FEE2E2] border-[#FECACA]";
  };

  const industryItems = [
    { label: "Problem Solving", value: r.industryAlignment.problemSolving },
    { label: "Data Structures", value: r.industryAlignment.dataStructures },
    { label: "Algorithms", value: r.industryAlignment.algorithms },
    { label: "Complexity Analysis", value: r.industryAlignment.complexityAnalysis },
    { label: "Coding Accuracy", value: r.industryAlignment.codingAccuracy },
  ];

  const recommendedRoles = r.passed
    ? ["Software Developer", "Backend Developer", "Full Stack Developer", "Algorithm-focused roles"]
    : ["Junior Developer", "Trainee Developer", "Technical Support"];

  return (
    <div className={`min-h-screen ${dk ? "bg-[#0F0E0C]" : "bg-[#F7F5F0]"} p-4 sm:p-6`}>
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Hero result card ─────────────────────────────────────── */}
        <div className={`rounded-2xl border p-8 text-center ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}
          style={{ boxShadow: dk ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(74,64,54,0.08)" }}>

          <div className="flex justify-center mb-4">
            {r.passed ? (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${dk ? "bg-[#052e16] border-2 border-[#2E6B47]" : "bg-[#EDF7F0] border-2 border-[#86EFAC]"}`}>
                <Trophy className={`w-10 h-10 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
              </div>
            ) : (
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${dk ? "bg-[#1c0101] border-2 border-[#7f1d1d]" : "bg-[#FEE2E2] border-2 border-[#FECACA]"}`}>
                <XCircle className={`w-10 h-10 ${dk ? "text-[#FCA5A5]" : "text-[#DC2626]"}`} />
              </div>
            )}
          </div>

          <h1 className={`text-3xl font-black mb-1 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
            DSA Assessment Result
          </h1>
          <p className={`text-sm mb-5 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            {r.studentName} • {submitReasonLabel[r.submitReason] || r.submitReason}
          </p>

          {/* Big score */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div>
              <div className={`text-5xl font-black mono-num ${r.passed ? (dk ? "text-[#4ADE80]" : "text-[#2E6B47]") : (dk ? "text-[#FCA5A5]" : "text-[#DC2626]")}`}>
                {r.marksEarned}
                <span className={`text-2xl ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>/{r.totalMarks}</span>
              </div>
              <div className={`text-sm mt-1 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                Total Score
              </div>
            </div>
            <div className={`w-px h-16 ${dk ? "bg-[#2E2B27]" : "bg-[#D6CEBE]"}`} />
            <div>
              <div className={`text-5xl font-black mono-num ${r.passed ? (dk ? "text-[#4ADE80]" : "text-[#2E6B47]") : (dk ? "text-[#FCA5A5]" : "text-[#DC2626]")}`}>
                {r.percentage}%
              </div>
              <div className={`text-sm mt-1 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                Percentage
              </div>
            </div>
            <div className={`w-px h-16 ${dk ? "bg-[#2E2B27]" : "bg-[#D6CEBE]"}`} />
            <div>
              <div className={`text-3xl font-black px-4 py-1 rounded-xl ${r.passed
                ? dk ? "bg-[#052e16] text-[#4ADE80]" : "bg-[#EDF7F0] text-[#2E6B47]"
                : dk ? "bg-[#1c0101] text-[#FCA5A5]" : "bg-[#FEE2E2] text-[#DC2626]"
              }`}>
                {r.passed ? "PASSED" : "FAILED"}
              </div>
            </div>
          </div>

          {/* Score bar */}
          <div className={`h-2 rounded-full w-full max-w-sm mx-auto ${dk ? "bg-[#2A2722]" : "bg-[#E8E2D7]"}`}>
            <div
              className={`h-full rounded-full transition-all ${r.passed ? "bg-[#2E6B47]" : "bg-[#DC2626]"}`}
              style={{ width: `${r.percentage}%` }}
            />
          </div>
          <p className={`text-xs mt-2 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
            Passing score: {r.totalMarks * 0.5} marks (50%)
          </p>
        </div>

        {/* ── Stats grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { label: "Correct", value: r.correct, color: dk ? "text-[#4ADE80]" : "text-[#2E6B47]" },
            { label: "Incorrect", value: r.incorrect, color: dk ? "text-[#FCA5A5]" : "text-[#DC2626]" },
            { label: "Skipped", value: r.skipped, color: dk ? "text-[#9A9183]" : "text-[#6E6659]" },
            { label: "Accuracy", value: `${r.accuracy}%`, color: dk ? "text-[#93C5FD]" : "text-[#1D4ED8]" },
            { label: "Time Used", value: `${r.timeUsedMinutes}m`, color: dk ? "text-[#FCD34D]" : "text-[#B45309]" },
            { label: "Tab Violations", value: r.integrityStatus.tabViolations, color: r.integrityStatus.tabViolations > 0 ? "text-[#F97316]" : (dk ? "text-[#4ADE80]" : "text-[#2E6B47]") },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-xl border p-3 text-center ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
              <div className={`text-xl font-black mono-num ${stat.color}`}>{stat.value}</div>
              <div className={`text-[10px] ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Topic Performance ─────────────────────────────────────── */}
        <div className={`rounded-2xl border p-6 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className={`w-4 h-4 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`} />
            <h2 className={`text-sm font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Topic Performance</h2>
          </div>
          <div className="space-y-3">
            {r.topicScores
              .sort((a, b) => b.percentage - a.percentage)
              .map((ts) => (
                <div key={ts.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold ${dk ? "text-[#B5AFA6]" : "text-[#4A4036]"}`}>{ts.topic}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${levelBg(ts.level)} ${levelColor(ts.level)}`}>
                        {ts.level}
                      </span>
                    </div>
                    <span className={`text-xs font-bold mono-num ${levelColor(ts.level)}`}>
                      {ts.correct}/{ts.totalQuestions} ({ts.percentage}%)
                    </span>
                  </div>
                  <div className={`h-1.5 rounded-full ${dk ? "bg-[#2A2722]" : "bg-[#E8E2D7]"}`}>
                    <div
                      className={`h-full rounded-full transition-all ${
                        ts.percentage >= 80 ? "bg-[#2E6B47]"
                        : ts.percentage >= 60 ? "bg-[#1D4ED8]"
                        : ts.percentage >= 40 ? "bg-[#B45309]"
                        : "bg-[#DC2626]"
                      }`}
                      style={{ width: `${ts.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* ── Skill Updates + Industry Alignment ───────────────────── */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Skill updates */}
          <div className={`rounded-2xl border p-6 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={`w-4 h-4 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`} />
              <h2 className={`text-sm font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Skill Profile Updated</h2>
            </div>
            <div className="space-y-4">
              {r.skillUpdates.map((su) => (
                <div key={su.skill}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-xs font-semibold ${dk ? "text-[#B5AFA6]" : "text-[#4A4036]"}`}>{su.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs mono-num ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>{su.before}%</span>
                      <span className="text-[10px]">→</span>
                      <span className={`text-xs font-bold mono-num ${su.delta >= 0 ? (dk ? "text-[#4ADE80]" : "text-[#2E6B47]") : (dk ? "text-[#FCA5A5]" : "text-[#DC2626]")}`}>
                        {su.after}%
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 rounded ${su.delta >= 0 ? (dk ? "bg-[#052e16] text-[#4ADE80]" : "bg-[#EDF7F0] text-[#2E6B47]") : (dk ? "bg-[#1c0101] text-[#FCA5A5]" : "bg-[#FEE2E2] text-[#DC2626]")}`}>
                        {su.delta >= 0 ? "+" : ""}{su.delta}
                      </span>
                    </div>
                  </div>
                  <div className={`relative h-2 rounded-full ${dk ? "bg-[#2A2722]" : "bg-[#E8E2D7]"}`}>
                    <div className={`absolute left-0 top-0 h-full rounded-full ${dk ? "bg-[#3D3A35]" : "bg-[#D6CEBE]"}`} style={{ width: `${su.before}%` }} />
                    <div className="absolute left-0 top-0 h-full rounded-full bg-[#2E6B47] transition-all" style={{ width: `${su.after}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Industry alignment */}
          <div className={`rounded-2xl border p-6 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
            <div className="flex items-center gap-2 mb-4">
              <Target className={`w-4 h-4 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`} />
              <h2 className={`text-sm font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Industry Skill Alignment</h2>
            </div>
            <div className="space-y-3">
              {industryItems.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`text-xs w-28 shrink-0 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>{item.label}</span>
                  <div className={`flex-1 h-1.5 rounded-full ${dk ? "bg-[#2A2722]" : "bg-[#E8E2D7]"}`}>
                    <div
                      className={`h-full rounded-full ${item.value >= 70 ? "bg-[#2E6B47]" : item.value >= 50 ? "bg-[#1D4ED8]" : "bg-[#B45309]"}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold mono-num w-8 text-right ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Integrity Report ─────────────────────────────────────── */}
        <div className={`rounded-2xl border p-5 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Shield className={`w-4 h-4 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`} />
            <h2 className={`text-sm font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Exam Integrity Report</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: "Protected Mode", value: "Active", ok: true },
              { label: "Tab Violations", value: String(r.integrityStatus.tabViolations), ok: r.integrityStatus.tabViolations === 0 },
              { label: "Fullscreen Exits", value: String(r.integrityStatus.fullscreenExits), ok: r.integrityStatus.fullscreenExits === 0 },
              { label: "Auto-save", value: "Enabled", ok: true },
              { label: "Integrity Status", value: r.integrityStatus.overallStatus, ok: r.integrityStatus.overallStatus === "Clean" },
              { label: "Attempt Status", value: r.submitReason === "MANUAL" ? "Completed" : r.submitReason.replace("_", " "), ok: r.submitReason === "MANUAL" },
            ].map((item) => (
              <div key={item.label} className={`rounded-lg border p-3 ${dk ? "bg-[#161412] border-[#252220]" : "bg-[#F7F5F0] border-[#E8E2D7]"}`}>
                <div className={`text-[10px] ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"} mb-1`}>{item.label}</div>
                <div className={`text-xs font-bold ${item.ok ? (dk ? "text-[#4ADE80]" : "text-[#2E6B47]") : "text-[#F97316]"}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recommended roles ─────────────────────────────────────── */}
        <div className={`rounded-2xl border p-5 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
          <div className="flex items-center gap-2 mb-3">
            <Target className={`w-4 h-4 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`} />
            <h2 className={`text-sm font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>Recommended Next Steps</h2>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {recommendedRoles.map((role) => (
              <span key={role} className={`text-xs font-semibold px-3 py-1 rounded-full border ${dk ? "bg-[#0d1a2e] text-[#93C5FD] border-[#1e3a5f]" : "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]"}`}>
                {role}
              </span>
            ))}
          </div>
          <p className={`text-[11px] italic ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
            These are potential matches based on your assessment. Passing this exam does not guarantee job eligibility.
          </p>
        </div>

        {/* ── Continue button ──────────────────────────────────────── */}
        <div className="text-center pb-6">
          <button
            type="button"
            onClick={onContinue}
            className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg transition-colors cursor-pointer ${
              dk
                ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-white"
                : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732]"
            }`}
          >
            Continue to Career Roadmap
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
