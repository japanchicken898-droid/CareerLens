"use client";

/**
 * ExtractionModal — Step 2 progress overlay
 *
 * Reuses the existing ScanningModal visual design.
 * Shows real stage progression driven by actual async work.
 * Never fakes completion — stages are set by the real service.
 */

import React from "react";
import { CheckCircle2, Loader2, FileText, GitBranch, Database, Layers } from "lucide-react";
import type { ExtractionProgress, ExtractionStage } from "@/services/extractionService";

interface ExtractionModalProps {
  progress: ExtractionProgress;
}

interface StageConfig {
  stage: ExtractionStage;
  label: string;
  desc: string;
  icon: React.ReactNode;
}

const STAGES: StageConfig[] = [
  {
    stage: "reading_resume",
    label: "Reading Your Resume",
    desc: "Extracting text from the uploaded PDF file...",
    icon: <FileText className="w-4 h-4 text-[#B8532F]" />,
  },
  {
    stage: "connecting_github",
    label: "Connecting to GitHub",
    desc: "Looking up your public GitHub profile...",
    icon: <GitBranch className="w-4 h-4 text-[#2E6B47]" />,
  },
  {
    stage: "collecting_repositories",
    label: "Collecting Public Repositories",
    desc: "Fetching repository data, languages, and READMEs...",
    icon: <Database className="w-4 h-4 text-[#3B668B]" />,
  },
  {
    stage: "organizing_evidence",
    label: "Organizing Profile Evidence",
    desc: "Normalizing skills and tagging sources...",
    icon: <Layers className="w-4 h-4 text-[#8A7E6C]" />,
  },
];

const STAGE_ORDER: ExtractionStage[] = [
  "reading_resume",
  "connecting_github",
  "collecting_repositories",
  "organizing_evidence",
  "done",
];

export const ExtractionModal: React.FC<ExtractionModalProps> = ({ progress }) => {
  const currentIndex = STAGE_ORDER.indexOf(progress.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="paper-card p-6 sm:p-8 bg-[#FAF8F5] border border-[#D6CEBE] rounded-2xl shadow-xl max-w-md w-full space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 rounded-2xl bg-[#24201D] text-[#FAF8F5] flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
          <h3 className="text-lg font-bold text-[#24201D]">Extracting Profile Data...</h3>
          <p className="text-xs text-[#6E6659]">
            Reading real resume and GitHub data. No fake content.
          </p>
        </div>

        {/* Stage list */}
        <div className="space-y-3.5 bg-[#FFFFFF] p-4 rounded-xl border border-[#E8E2D7]">
          {STAGES.map((s, idx) => {
            const stageIdx = STAGE_ORDER.indexOf(s.stage);
            const isDone = currentIndex > stageIdx;
            const isCurrent = currentIndex === stageIdx;

            return (
              <div key={s.stage} className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
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
                      isDone
                        ? "text-[#24201D]"
                        : isCurrent
                        ? "text-[#24201D] font-bold"
                        : "text-[#A89E8D]"
                    }`}
                  >
                    {s.label}
                  </h4>
                  <p
                    className={`text-[11px] ${
                      isCurrent ? "text-[#5A5144]" : "text-[#8A7E6C]"
                    }`}
                  >
                    {isCurrent ? progress.detail : s.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <span className="text-[11px] font-mono text-[#8A7E6C]">
            Collecting evidence only — no scoring yet.
          </span>
        </div>
      </div>
    </div>
  );
};
