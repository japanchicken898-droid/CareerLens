"use client";

import React, { useState } from "react";
import { Code2, ChevronDown, Play, Send } from "lucide-react";
import type { ClientQuestion } from "@/types/exam";

interface QuestionCardProps {
  question: ClientQuestion;
  questionNumber: number;
  totalQuestions: number;
  savedAnswer: string | string[] | undefined;
  selectedLanguage: string;
  onAnswer: (answer: string | string[], language?: string) => void;
  darkMode?: boolean;
}

const COMPLEXITY_OPTIONS = [
  { id: "O(1)", text: "O(1) — Constant" },
  { id: "O(log n)", text: "O(log n) — Logarithmic" },
  { id: "O(n)", text: "O(n) — Linear" },
  { id: "O(n log n)", text: "O(n log n) — Linearithmic" },
  { id: "O(n²)", text: "O(n²) — Quadratic" },
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  savedAnswer,
  selectedLanguage,
  onAnswer,
  darkMode = false,
}) => {
  const dk = darkMode;
  const [codeValue, setCodeValue] = useState<string>(
    typeof savedAnswer === "string" && question.type === "CODING"
      ? savedAnswer
      : question.starterCode?.[selectedLanguage] ?? ""
  );
  const [lang, setLang] = useState(selectedLanguage);

  const AVAILABLE_LANGS = question.starterCode
    ? Object.keys(question.starterCode)
    : ["JavaScript", "Python", "Java", "C++"];

  const diffColor = {
    Easy: dk ? "text-[#4ADE80] bg-[#052e16] border-[#166534]" : "text-[#15803D] bg-[#F0FDF4] border-[#86EFAC]",
    Medium: dk ? "text-[#FCD34D] bg-[#1c1500] border-[#92400e]" : "text-[#B45309] bg-[#FEF9C3] border-[#FDE68A]",
    Hard: dk ? "text-[#FCA5A5] bg-[#1c0101] border-[#7f1d1d]" : "text-[#DC2626] bg-[#FEE2E2] border-[#FECACA]",
  }[question.difficulty];

  const typeLabel = {
    MCQ: "MCQ",
    MULTI_SELECT: "Multi-Select",
    CODE_OUTPUT: "Code Output",
    COMPLEXITY: "Complexity",
    DEBUGGING: "Debugging",
    ALGORITHM_SELECTION: "Algorithm",
    CODING: "Coding",
  }[question.type];

  // ── Option click handler ──────────────────────────────────────────
  const handleOptionClick = (optId: string) => {
    if (question.type === "MULTI_SELECT") {
      const current = Array.isArray(savedAnswer) ? savedAnswer : [];
      const next = current.includes(optId)
        ? current.filter((x) => x !== optId)
        : [...current, optId];
      onAnswer(next);
    } else {
      onAnswer(optId);
    }
  };

  const isSelected = (optId: string) => {
    if (Array.isArray(savedAnswer)) return savedAnswer.includes(optId);
    return savedAnswer === optId;
  };

  // ── Effective options (COMPLEXITY uses fixed set) ─────────────────
  const displayOptions =
    question.type === "COMPLEXITY" ? COMPLEXITY_OPTIONS : question.options ?? [];

  // ── Card base classes ─────────────────────────────────────────────
  const card = `rounded-2xl border p-6 space-y-5 ${
    dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-[#FFFFFF] border-[#D6CEBE]"
  }`;

  return (
    <div className={card} style={{ boxShadow: dk ? "0 4px 24px rgba(0,0,0,0.3)" : "0 2px 12px rgba(74,64,54,0.06)" }}>
      {/* Question header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${diffColor}`}>
            {question.difficulty}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
            dk ? "bg-[#2A2722] text-[#9A9183] border-[#3D3A35]" : "bg-[#F0ECE1] text-[#6E6659] border-[#D6CEBE]"
          }`}>
            {typeLabel}
          </span>
          <span className={`text-xs ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
            {question.topic}
          </span>
        </div>
        <span className={`text-xs font-bold ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
          {question.marks} marks
        </span>
      </div>

      {/* Question text */}
      <div>
        <p className={`text-sm leading-relaxed whitespace-pre-wrap font-medium ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
          {question.question}
        </p>
      </div>

      {/* Code snippet (for CODE_OUTPUT, DEBUGGING, COMPLEXITY with code) */}
      {question.codeSnippet && question.type !== "CODING" && (
        <div className={`rounded-xl border overflow-hidden ${dk ? "border-[#2E2B27]" : "border-[#D6CEBE]"}`}>
          <div className={`flex items-center gap-2 px-4 py-2 border-b ${dk ? "bg-[#161412] border-[#2E2B27]" : "bg-[#F0ECE1] border-[#D6CEBE]"}`}>
            <Code2 className={`w-3.5 h-3.5 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`} />
            <span className={`text-[11px] font-mono ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>Code</span>
          </div>
          <pre className={`p-4 text-xs font-mono leading-relaxed overflow-x-auto ${dk ? "bg-[#0F0E0C] text-[#EDE8DF]" : "bg-[#F9FAFB] text-[#24201D]"}`}>
            {question.codeSnippet}
          </pre>
        </div>
      )}

      {/* Options for MCQ / MULTI_SELECT / CODE_OUTPUT / COMPLEXITY / DEBUGGING / ALGORITHM_SELECTION */}
      {question.type !== "CODING" && displayOptions.length > 0 && (
        <div className="space-y-2.5">
          {question.type === "MULTI_SELECT" && (
            <p className={`text-xs font-semibold ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              ☑ Select all that apply
            </p>
          )}
          {displayOptions.map((opt) => {
            const sel = isSelected(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleOptionClick(opt.id)}
                className={`w-full flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  sel
                    ? dk
                      ? "bg-[#2E6B47]/20 border-[#2E6B47] text-[#4ADE80]"
                      : "bg-[#EDF7F0] border-[#2E6B47] text-[#2E6B47]"
                    : dk
                    ? "bg-[#161412] border-[#2E2B27] text-[#B5AFA6] hover:bg-[#242119] hover:border-[#3D3A35]"
                    : "bg-[#FAF8F5] border-[#D6CEBE] text-[#4A4036] hover:bg-[#F0ECE1] hover:border-[#B8AC97]"
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 text-[10px] font-bold transition-colors ${
                  sel
                    ? "bg-[#2E6B47] border-[#2E6B47] text-white"
                    : dk
                    ? "border-[#3D3A35] text-[#5C5751]"
                    : "border-[#D6CEBE] text-[#8A7E6C]"
                }`}>
                  {opt.id.toUpperCase()}
                </div>
                <span className={`text-sm leading-relaxed ${'isCode' in opt && opt.isCode ? "font-mono text-xs" : ""}`}>
                  {opt.text}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* CODING interface */}
      {question.type === "CODING" && (
        <div className="space-y-3">
          {/* Visible test cases */}
          {question.testCases && question.testCases.length > 0 && (
            <div className="space-y-2">
              <p className={`text-xs font-bold ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                Sample Test Cases
              </p>
              {question.testCases.map((tc, i) => (
                <div key={i} className={`rounded-lg border p-3 grid grid-cols-2 gap-3 text-xs font-mono ${dk ? "bg-[#161412] border-[#2E2B27]" : "bg-[#F9FAFB] border-[#E8E2D7]"}`}>
                  <div>
                    <span className={`font-bold text-[10px] block mb-1 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>INPUT</span>
                    <span className={dk ? "text-[#EDE8DF]" : "text-[#24201D]"}>{tc.input}</span>
                  </div>
                  <div>
                    <span className={`font-bold text-[10px] block mb-1 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>OUTPUT</span>
                    <span className={dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}>{tc.expectedOutput}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Language selector */}
          <div className="flex items-center gap-2">
            <label className={`text-xs font-semibold ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Language:
            </label>
            <div className={`flex items-center gap-1 rounded-lg border px-2 py-1 ${dk ? "bg-[#161412] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
              <select
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  setCodeValue(question.starterCode?.[e.target.value] ?? "");
                }}
                className={`text-xs font-semibold bg-transparent focus:outline-none cursor-pointer ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}
              >
                {AVAILABLE_LANGS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
              <ChevronDown className={`w-3 h-3 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`} />
            </div>
          </div>

          {/* Code editor */}
          <div className={`rounded-xl border overflow-hidden ${dk ? "border-[#2E2B27]" : "border-[#D6CEBE]"}`}>
            <div className={`flex items-center justify-between px-4 py-2 border-b ${dk ? "bg-[#161412] border-[#2E2B27]" : "bg-[#F0ECE1] border-[#D6CEBE]"}`}>
              <div className="flex items-center gap-2">
                <Code2 className={`w-3.5 h-3.5 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`} />
                <span className={`text-[11px] font-mono ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                  {lang} Editor
                </span>
              </div>
              <span className={`text-[10px] ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
                Hidden test cases will run on submission
              </span>
            </div>
            <textarea
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              spellCheck={false}
              rows={14}
              className={`w-full p-4 text-xs font-mono leading-relaxed focus:outline-none resize-none ${
                dk
                  ? "bg-[#0F0E0C] text-[#EDE8DF] caret-[#EDE8DF]"
                  : "bg-[#F9FAFB] text-[#24201D] caret-[#24201D]"
              }`}
              placeholder="Write your solution here…"
            />
          </div>

          {/* Submit code */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAnswer(codeValue, lang)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                dk
                  ? "bg-[#2A2722] text-[#EDE8DF] border border-[#3D3A35] hover:bg-[#3D3A35]"
                  : "bg-[#F0ECE1] text-[#24201D] border border-[#D6CEBE] hover:bg-[#E8E2D7]"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              Save Answer
            </button>
            <button
              type="button"
              onClick={() => onAnswer(codeValue, lang)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                dk
                  ? "bg-[#2E6B47]/80 text-[#EDE8DF] hover:bg-[#2E6B47]"
                  : "bg-[#2E6B47] text-white hover:bg-[#1a5c38]"
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              Submit Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
