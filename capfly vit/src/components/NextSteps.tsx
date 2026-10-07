"use client";

import React, { useState } from "react";
import { ActionItem } from "@/data/rolesData";
import {
  ListChecks,
  CheckCircle2,
  Circle,
  TrendingUp,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

interface NextStepsProps {
  steps: ActionItem[];
  onToggleStep: (stepId: number) => void;
}

export const NextSteps: React.FC<NextStepsProps> = ({ steps, onToggleStep }) => {
  const [copied, setCopied] = useState(false);

  const completedCount = steps.filter((s) => s.completed).length;
  const potentialTotalGain = steps
    .filter((s) => !s.completed)
    .reduce((acc, curr) => acc + curr.potentialGain, 0);

  const handleCopyRoadmap = () => {
    const text = steps
      .map(
        (s, idx) =>
          `${idx + 1}. ${s.title}\n   ${s.detail} (${s.completed ? "[Done]" : `+${s.potentialGain} pts`})`
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="paper-card p-5 sm:p-7 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#24201D]">
              Next Steps (Personal Roadmap)
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#FAF8F5] border border-[#D6CEBE] text-[#6E6659]">
              3 High-Impact Fixes
            </span>
          </div>
          <p className="text-xs text-[#6E6659] mt-0.5">
            Complete these 3 tasks to turn unverified and missing signals into proof.
          </p>
        </div>

        {/* Copy Roadmap */}
        <button
          type="button"
          onClick={handleCopyRoadmap}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-mono text-[#4A4036] bg-[#FAF8F5] hover:bg-[#F0ECE1] border border-[#D6CEBE] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#2E6B47]" />
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#8A7E6C]" />
              <span>Copy Action List</span>
            </>
          )}
        </button>
      </div>

      {/* Progress pill if any tasks are checked */}
      {potentialTotalGain > 0 ? (
        <div className="bg-[#FAF8F5] border border-[#E8E2D7] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-[#5A5144]">
          <span className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#B8532F]" />
            <span>
              Checking off all 3 items will boost your readiness by{" "}
              <strong className="text-[#24201D] mono-num">+{potentialTotalGain} pts</strong>.
            </span>
          </span>
          <span className="font-mono text-[11px] text-[#8A7E6C]">
            {completedCount}/{steps.length} completed
          </span>
        </div>
      ) : (
        <div className="bg-[#EDF7F0] border border-[#A3D9B1] rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs text-[#1C5B36]">
          <Sparkles className="w-4 h-4 text-[#2E6B47]" />
          <span>All 3 recommended actions completed! Your profile is in prime hiring shape.</span>
        </div>
      )}

      {/* 3 Numbered Action Items */}
      <div className="space-y-3">
        {steps.map((step, idx) => (
          <div
            key={step.id}
            onClick={() => onToggleStep(step.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
              step.completed
                ? "bg-[#F4F9F5] border-[#A3D9B1] opacity-80"
                : "bg-[#FAF8F5] hover:bg-[#FFFFFF] border-[#D6CEBE] hover:border-[#8A7E6C] shadow-xs"
            }`}
          >
            {/* Number Indicator & Checkbox */}
            <div className="flex items-center gap-2 pt-0.5">
              <span className="w-6 h-6 rounded-full bg-[#24201D] text-[#FAF8F5] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <button
                type="button"
                className="focus:outline-none"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStep(step.id);
                }}
              >
                {step.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#2E6B47]" />
                ) : (
                  <Circle className="w-5 h-5 text-[#B8AC97] hover:text-[#24201D]" />
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3
                  className={`text-sm font-semibold ${
                    step.completed
                      ? "text-[#2E6B47] line-through"
                      : "text-[#24201D]"
                  }`}
                >
                  {step.title}
                </h3>

                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded shrink-0 self-start sm:self-auto ${
                    step.completed
                      ? "bg-[#E2EDE5] text-[#2E6B47] font-semibold"
                      : "bg-[#E8E2D7] text-[#4A4036] font-medium"
                  }`}
                >
                  {step.completed ? "Resolved" : `+${step.potentialGain} pts readiness`}
                </span>
              </div>

              <p
                className={`text-xs leading-relaxed ${
                  step.completed ? "text-[#6E6659]" : "text-[#4A4036]"
                }`}
              >
                {step.detail}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
