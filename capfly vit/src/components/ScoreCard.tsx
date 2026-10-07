"use client";

import React from "react";
import { ReadinessResult } from "@/data/rolesData";
import { Award, AlertTriangle, AlertCircle, CheckCircle, Share2, Printer, RotateCcw } from "lucide-react";

interface ScoreCardProps {
  result: ReadinessResult;
  onReset: () => void;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ result, onReset }) => {
  const { overallScore, statusLabel, statusDescription, role, candidateName } = result;

  // Determine badge and color themes based on the status
  const getStatusStyles = () => {
    switch (statusLabel) {
      case "Job Ready":
        return {
          badgeBg: "bg-[#EDF7F0]",
          badgeBorder: "border-[#A3D9B1]",
          badgeText: "text-[#1C5B36]",
          circleColor: "#2E6B47",
          icon: <CheckCircle className="w-4 h-4 text-[#2E6B47]" />,
          barBg: "bg-[#2E6B47]",
        };
      case "Almost Ready":
        return {
          badgeBg: "bg-[#FEF9C3]",
          badgeBorder: "border-[#FDE047]",
          badgeText: "text-[#854D0E]",
          circleColor: "#A16207",
          icon: <AlertTriangle className="w-4 h-4 text-[#A16207]" />,
          barBg: "bg-[#A16207]",
        };
      case "Needs Work":
      default:
        return {
          badgeBg: "bg-[#FEE2E2]",
          badgeBorder: "border-[#FCA5A5]",
          badgeText: "text-[#991B1B]",
          circleColor: "#B91C1C",
          icon: <AlertCircle className="w-4 h-4 text-[#B91C1C]" />,
          barBg: "bg-[#B91C1C]",
        };
    }
  };

  const statusStyle = getStatusStyles();

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="paper-card p-6 sm:p-8 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm relative overflow-hidden">
      {/* Subtle top indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${statusStyle.barBg}`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Side: Score & Status */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-7">
          {/* Big Score Dial / Badge */}
          <div className="flex items-baseline gap-2">
            <span className="text-6xl sm:text-7xl font-bold tracking-tight text-[#24201D] mono-num">
              {overallScore}
            </span>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-mono text-[#8A7E6C] font-normal">
                /100
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#A89E8D]">
                Score
              </span>
            </div>
          </div>

          <div className="h-10 w-[1px] bg-[#D6CEBE] hidden sm:block" />

          {/* Label & Description */}
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2.5">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider border ${statusStyle.badgeBg} ${statusStyle.badgeBorder} ${statusStyle.badgeText}`}
              >
                {statusStyle.icon}
                {statusLabel}
              </span>
              <span className="text-xs text-[#8A7E6C] font-mono">
                for {role}
              </span>
            </div>

            <p className="text-sm sm:text-base text-[#24201D] font-medium leading-snug">
              {statusDescription}
            </p>

            <p className="text-xs text-[#6E6659]">
              Evaluated profile: <span className="font-semibold text-[#24201D]">{candidateName}</span> • Resume + GitHub history.
            </p>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 self-start md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-[#E8E2D7] w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handlePrint}
            title="Print or save as PDF"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#4A4036] bg-[#FAF8F5] hover:bg-[#F0ECE1] border border-[#D6CEBE] transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#6E6659]" />
            <span>Print Report</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            title="Check another candidate or role"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#FAF8F5] bg-[#24201D] hover:bg-[#3D3732] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Check Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
