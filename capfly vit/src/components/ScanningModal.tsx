"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Search, FileText, GitBranch, Cpu } from "lucide-react";

interface ScanningModalProps {
  role: string;
  onComplete: () => void;
}

export const ScanningModal: React.FC<ScanningModalProps> = ({ role, onComplete }) => {
  const steps = [
    {
      title: "Parsing Resume Structure",
      desc: "Extracting declared skills, project titles, and tools...",
      icon: <FileText className="w-4 h-4 text-[#B8532F]" />,
    },
    {
      title: "Inspecting GitHub Profile",
      desc: "Checking public repos, commit frequency, and branch history...",
      icon: <GitBranch className="w-4 h-4 text-[#2E6B47]" />,
    },
    {
      title: "Verifying Architecture & Tests",
      desc: "Scanning for test runners, Dockerfiles, and database migrations...",
      icon: <Cpu className="w-4 h-4 text-[#3B668B]" />,
    },
    {
      title: `Benchmarking for ${role}`,
      desc: "Calculating Proof of Work, Role Match, Code Quality & Activity...",
      icon: <Search className="w-4 h-4 text-[#8A7E6C]" />,
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStepIndex(1), 500);
    const timer2 = setTimeout(() => setCurrentStepIndex(2), 1050);
    const timer3 = setTimeout(() => setCurrentStepIndex(3), 1600);
    const timer4 = setTimeout(() => {
      onComplete();
    }, 2100);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="paper-card p-6 sm:p-8 bg-[#FAF8F5] border border-[#D6CEBE] rounded-2xl shadow-xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#24201D] text-[#FAF8F5] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-[#24201D]">
            Auditing Readiness...
          </h3>
          <p className="text-xs text-[#6E6659]">
            Cross-referencing claimed skills against public code.
          </p>
        </div>

        {/* Steps sequence */}
        <div className="space-y-3.5 bg-[#FFFFFF] p-4 rounded-xl border border-[#E8E2D7]">
          {steps.map((step, idx) => {
            const isFinished = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isFinished ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2E6B47]" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-[#24201D] animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D6CEBE] bg-[#FAF8F5]" />
                  )}
                </div>
                <div>
                  <h4
                    className={`text-xs font-semibold leading-tight ${
                      isFinished
                        ? "text-[#24201D]"
                        : isCurrent
                        ? "text-[#24201D] font-bold"
                        : "text-[#A89E8D]"
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p
                    className={`text-[11px] ${
                      isCurrent ? "text-[#5A5144]" : "text-[#8A7E6C]"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <span className="text-[11px] font-mono text-[#8A7E6C]">
            Analyzing against 2026 industry benchmarks...
          </span>
        </div>
      </div>
    </div>
  );
};
