"use client";

import React from "react";
import { CheckCircle2, Shield, TrendingUp } from "lucide-react";

export type AppStep = 1 | 2 | 3 | 4 | 5 | 6;

interface SidebarNavProps {
  currentStep: AppStep;
  completedSteps: number[];
  onSelectStep: (step: AppStep) => void;
  darkMode?: boolean;
  candidateName?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentStep,
  completedSteps,
  onSelectStep,
  darkMode = false,
  candidateName = "Student",
}) => {
  const dk = darkMode;
  const progressPct = Math.round((completedSteps.length / 6) * 100);

  const steps = [
    { step: 1, title: "Build Your Profile", subtitle: "Resume, GitHub & Links" },
    { step: 2, title: "Data Extraction", subtitle: "Resume & GitHub Analysis" },
    { step: 3, title: "Skill Verification", subtitle: "Claim vs Proof of Work" },
    { step: 4, title: "Protected DSA Exam", subtitle: "Proctored DSA Exam", isExam: true },
    { step: 5, title: "Skill Gap Analysis", subtitle: "What's Missing for Your Role" },
    { step: 6, title: "Career Roadmap", subtitle: "Personalized Growth Plan" },
  ];

  return (
    <aside
      className={`w-full lg:w-68 shrink-0 flex flex-col justify-between p-4 border-b lg:border-b-0 lg:border-r min-h-full transition-colors duration-300 relative ${
        dk
          ? "border-[#2E2B27]/80 bg-[#161412]/95 text-[#EDE8DF]"
          : "border-[#D6CEBE]/80 bg-[#FAF8F5] text-[#24201D]"
      }`}
    >
      <div className="space-y-5">
        {/* Brand Header with Emerald & Slate Accents */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs text-white bg-gradient-to-br from-[#2E6B47] to-[#1E4E32] ring-2 ring-[#2E6B47]/30`}
            >
              CL
            </div>
            <div>
              <span className={`font-black text-sm tracking-tight block leading-tight ${
                dk ? "text-[#EDE8DF]" : "text-[#1C241E]"
              }`}>
                CareerLens
              </span>
              <span className="text-[9px] uppercase font-bold tracking-wider text-[#2E6B47] block">
                Employability Engine
              </span>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E6B47]/10 text-[#2E6B47] border border-[#2E6B47]/20">
            Step {currentStep} of 6
          </span>
        </div>

        {/* Vertical Connected Timeline Navigation */}
        <div className="relative pt-1">
          {/* Continuous vertical progress timeline line */}
          <div
            className={`absolute left-[23px] top-5 bottom-5 w-0.5 z-0 ${
              dk ? "bg-[#3D3A35]" : "bg-[#D6CEBE]"
            }`}
          />
          <div
            className="absolute left-[23px] top-5 w-0.5 z-0 bg-[#2E6B47] transition-all duration-500"
            style={{ height: `${Math.min(((currentStep - 1) / 5) * 100, 100)}%` }}
          />

          <nav className="space-y-2 relative z-10">
            {steps.map((item) => {
              const isActive = currentStep === item.step;
              const isCompleted = completedSteps.includes(item.step) && !isActive;

              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => onSelectStep(item.step as AppStep)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all cursor-pointer relative group ${
                    isActive
                      ? dk
                        ? "bg-[#2A2722] border-l-4 border-l-[#4ADE80] border-y border-r border-[#3D3A35] shadow-xs"
                        : "bg-white border-l-4 border-l-[#2E6B47] border-y border-r border-[#D6CEBE] shadow-xs"
                      : isCompleted
                      ? dk
                        ? "hover:bg-[#2A2722]/60"
                        : "hover:bg-[#F4EFE6]"
                      : dk
                      ? "hover:bg-[#2A2722]/30 text-[#8A7E6C]"
                      : "hover:bg-[#F4EFE6]/60 text-[#6E6659]"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {/* Step Circle */}
                    {isCompleted ? (
                      <div className="w-7 h-7 rounded-full bg-[#2E6B47] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-2 ring-[#2E6B47]/20">
                        {item.step}
                      </div>
                    ) : isActive ? (
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ring-4 ring-[#2E6B47]/20 ${
                          dk ? "bg-[#EDE8DF] text-[#0F0E0C]" : "bg-[#1E293B] text-white"
                        }`}
                      >
                        {item.step}
                      </div>
                    ) : (
                      <div
                        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          dk
                            ? "border-[#3D3A35] text-[#8A7E6C] bg-[#161412]"
                            : "border-[#D6CEBE] text-[#8A7E6C] bg-white"
                        }`}
                      >
                        {item.step}
                      </div>
                    )}

                    {/* Step Titles */}
                    <div className="overflow-hidden">
                      <span
                        className={`text-xs font-bold block truncate leading-tight ${
                          isActive
                            ? dk
                              ? "text-[#EDE8DF]"
                              : "text-[#1C241E]"
                            : isCompleted
                            ? dk
                              ? "text-[#EDE8DF]"
                              : "text-[#24201D]"
                            : dk
                            ? "text-[#8A7E6C]"
                            : "text-[#5C5449]"
                        }`}
                      >
                        {item.title}
                      </span>
                      <span
                        className={`text-[10px] truncate block ${
                          isActive
                            ? "text-[#2E6B47] dark:text-[#4ADE80] font-bold"
                            : isCompleted
                            ? "text-[#2E6B47] dark:text-[#4ADE80] font-semibold"
                            : dk
                            ? "text-[#6E6659]"
                            : "text-[#8A7E6C]"
                        }`}
                      >
                        {isCompleted
                          ? item.subtitle
                          : isActive
                          ? item.subtitle
                          : "Coming Next"}
                      </span>
                    </div>
                  </div>

                  {/* Completion Checkmark Badge */}
                  {isCompleted && (
                    <div className="w-5 h-5 rounded-full bg-[#2E6B47] text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sleek Bottom Progress Card */}
      <div className="pt-4 mt-4 border-t border-[#D6CEBE]/60 dark:border-[#2E2B27] space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold">
          <span className="text-[#2E6B47] dark:text-[#4ADE80] uppercase tracking-wider flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            Overall Analysis
          </span>
          <span className={dk ? "text-[#EDE8DF]" : "text-[#24201D]"}>
            {completedSteps.length}/7 Completed
          </span>
        </div>
        <div className="w-full h-2 bg-[#EFE9DD] dark:bg-[#2A2722] rounded-full overflow-hidden p-0.5 border border-[#D6CEBE]/60 dark:border-[#3D3A35]">
          <div
            className="h-full bg-gradient-to-r from-[#2E6B47] to-[#2563EB] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
