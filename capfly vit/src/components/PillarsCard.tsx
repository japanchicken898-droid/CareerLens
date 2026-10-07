"use client";

import React, { useState } from "react";
import { PillarItem } from "@/data/rolesData";
import {
  Hammer,
  Target,
  ShieldCheck,
  Activity,
  Check,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface PillarsCardProps {
  pillars: PillarItem[];
}

export const PillarsCard: React.FC<PillarsCardProps> = ({ pillars }) => {
  const [expandedPillar, setExpandedPillar] = useState<string | null>(null);

  const getPillarIcon = (id: string) => {
    switch (id) {
      case "proof_of_work":
        return <Hammer className="w-4 h-4 text-[#B8532F]" />;
      case "role_match":
        return <Target className="w-4 h-4 text-[#2E6B47]" />;
      case "code_quality":
        return <ShieldCheck className="w-4 h-4 text-[#3B668B]" />;
      case "activity":
      default:
        return <Activity className="w-4 h-4 text-[#A16207]" />;
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return "bg-[#2E6B47]";
    if (score >= 65) return "bg-[#A16207]";
    return "bg-[#B91C1C]";
  };

  const toggleExpand = (id: string) => {
    setExpandedPillar((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#24201D]">
          4 Core Evaluation Pillars
        </h2>
        <span className="text-xs text-[#6E6659] font-mono">
          Click any card to inspect checklist
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pillars.map((pillar) => {
          const isExpanded = expandedPillar === pillar.id;

          return (
            <div
              key={pillar.id}
              onClick={() => toggleExpand(pillar.id)}
              className="paper-card p-5 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm hover:border-[#8A7E6C] transition-all cursor-pointer space-y-3.5"
            >
              {/* Header: Icon, Titles & Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-[#FAF8F5] border border-[#D6CEBE]/80 mt-0.5">
                    {getPillarIcon(pillar.id)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#24201D] leading-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-[#6E6659] font-normal">
                      {pillar.subtitle}
                    </p>
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold mono-num text-[#24201D]">
                    {pillar.score}
                  </span>
                  <span className="text-xs font-mono text-[#8A7E6C]">/100</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#EFECE6] h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                    pillar.score
                  )}`}
                  style={{ width: `${Math.min(100, pillar.score)}%` }}
                />
              </div>

              {/* Verdict text */}
              <p className="text-xs text-[#4A4036] leading-relaxed">
                {pillar.shortVerdict}
              </p>

              {/* Collapsible Inspection Checklist */}
              <div className="pt-2 border-t border-[#E8E2D7]">
                <div className="flex items-center justify-between text-[11px] text-[#8A7E6C]">
                  <span>
                    {pillar.checklist.filter((c) => c.passed).length} of{" "}
                    {pillar.checklist.length} signals passed
                  </span>
                  <span className="flex items-center gap-0.5 font-medium text-[#4A4036]">
                    {isExpanded ? (
                      <>
                        Hide <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        View signals <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </span>
                </div>

                {isExpanded && (
                  <div className="mt-3 pt-2 space-y-2 border-t border-dashed border-[#D6CEBE]/60 text-xs">
                    {pillar.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2 py-0.5"
                      >
                        <span
                          className={`${
                            item.passed ? "text-[#24201D]" : "text-[#8A7E6C] line-through"
                          }`}
                        >
                          {item.label}
                        </span>
                        {item.passed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#2E6B47] font-semibold">
                            <Check className="w-3 h-3 text-[#2E6B47]" /> Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#991B1B]">
                            <X className="w-3 h-3 text-[#991B1B]" /> Missing
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
