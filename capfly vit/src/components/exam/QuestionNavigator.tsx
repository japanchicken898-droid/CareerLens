"use client";

import React from "react";
import { Flag } from "lucide-react";

interface QuestionNavigatorProps {
  questions: { id: string }[];
  currentIndex: number;
  answeredIds: Set<string>;
  flaggedIds: Set<string>;
  onSelect: (index: number) => void;
  darkMode?: boolean;
}

export const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answeredIds,
  flaggedIds,
  onSelect,
  darkMode = false,
}) => {
  const dk = darkMode;

  return (
    <div className={`rounded-xl border p-3 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-[#FFFFFF] border-[#D6CEBE]"}`}>
      <div className="flex items-center justify-between mb-2.5">
        <span className={`text-[10px] font-bold uppercase tracking-widest ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
          Question Navigator
        </span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-[10px]">
        {[
          { color: dk ? "bg-[#EDE8DF]" : "bg-[#24201D]", label: "Current" },
          { color: dk ? "bg-[#2E6B47]" : "bg-[#2E6B47]", label: "Answered" },
          { color: "bg-[#F97316]", label: "Flagged" },
          { color: dk ? "bg-[#2A2722]" : "bg-[#F0ECE1]", label: "Unanswered", border: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div className={`w-3 h-3 rounded-sm ${item.color} ${item.border ? (dk ? "border border-[#3D3A35]" : "border border-[#D6CEBE]") : ""}`} />
            <span className={dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Grid of question numbers */}
      <div className="grid grid-cols-5 gap-1.5">
        {questions.map((q, i) => {
          const isCurrent = i === currentIndex;
          const isAnswered = answeredIds.has(q.id);
          const isFlagged = flaggedIds.has(q.id);

          let cls = "";
          if (isCurrent) {
            cls = dk
              ? "bg-[#EDE8DF] text-[#0F0E0C] font-black ring-2 ring-[#EDE8DF]/40"
              : "bg-[#24201D] text-[#FAF8F5] font-black ring-2 ring-[#24201D]/30";
          } else if (isFlagged) {
            cls = "bg-[#F97316] text-white font-bold";
          } else if (isAnswered) {
            cls = "bg-[#2E6B47] text-white font-semibold";
          } else {
            cls = dk
              ? "bg-[#2A2722] text-[#9A9183] border border-[#3D3A35]"
              : "bg-[#F0ECE1] text-[#6E6659] border border-[#D6CEBE]";
          }

          return (
            <button
              key={q.id}
              type="button"
              onClick={() => onSelect(i)}
              className={`relative w-full aspect-square flex items-center justify-center text-[11px] rounded-lg transition-all cursor-pointer hover:scale-105 ${cls}`}
            >
              {i + 1}
              {isFlagged && (
                <Flag className="absolute -top-1 -right-1 w-2.5 h-2.5 text-white" />
              )}
            </button>
          );
        })}
      </div>

      {/* Summary counts */}
      <div className={`mt-3 pt-3 border-t space-y-1 ${dk ? "border-[#252220]" : "border-[#E8E2D7]"}`}>
        {[
          { label: "Answered", count: answeredIds.size, color: dk ? "text-[#4ADE80]" : "text-[#2E6B47]" },
          { label: "Flagged", count: flaggedIds.size, color: "text-[#F97316]" },
          { label: "Remaining", count: questions.length - answeredIds.size, color: dk ? "text-[#9A9183]" : "text-[#6E6659]" },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className={`text-[11px] ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>{item.label}</span>
            <span className={`text-xs font-bold ${item.color}`}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
