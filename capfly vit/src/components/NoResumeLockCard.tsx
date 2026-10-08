"use client";

import React from "react";
import { FileText } from "lucide-react";

interface NoResumeLockCardProps {
  onReturnToStep1: () => void;
  darkMode?: boolean;
}

export const NoResumeLockCard: React.FC<NoResumeLockCardProps> = ({
  onReturnToStep1,
  darkMode = false,
}) => {
  const dk = darkMode;
  return (
    <div
      className={`w-full max-w-4xl mx-auto p-8 sm:p-12 rounded-2xl border text-center space-y-4 shadow-xs transition-all ${
        dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
      }`}
    >
      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
        <FileText className="w-7 h-7" />
      </div>
      <h3 className={`text-xl font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
        No Resume Detected
      </h3>
      <p className={`text-sm max-w-md mx-auto leading-relaxed ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
        No Resume Detected. Please return to Step 1 and upload your resume PDF first.
      </p>
      <div className="pt-2">
        <button
          type="button"
          onClick={onReturnToStep1}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer ${
            dk
              ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-[#FAF8F5]"
              : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732]"
          }`}
        >
          <span>← Return to Step 1 to Upload Resume</span>
        </button>
      </div>
    </div>
  );
};
