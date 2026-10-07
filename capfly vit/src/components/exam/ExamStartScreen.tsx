"use client";

import React, { useState } from "react";
import {
  Shield,
  Clock,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Play,
  Wifi,
  Monitor,
  ChevronRight,
} from "lucide-react";
import { DSA_EXAM_CONFIG, EXAM_TOPICS_DISPLAY } from "@/data/examConfig";

interface ExamStartScreenProps {
  studentName: string;
  onStart: () => void;
  darkMode?: boolean;
}

export const ExamStartScreen: React.FC<ExamStartScreenProps> = ({
  studentName,
  onStart,
  darkMode = false,
}) => {
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const dk = darkMode;
  const cfg = DSA_EXAM_CONFIG;

  const handleStart = async () => {
    if (!rulesAcknowledged) return;
    setIsStarting(true);
    await new Promise((r) => setTimeout(r, 300));
    onStart();
  };

  const rules = [
    "Webcam & AI Face Proctoring is active throughout the exam.",
    "You must remain directly facing your screen. Turning your head away or walking away will trigger an integrity violation.",
    "Full-screen mode is required for this assessment.",
    "Switching tabs, changing windows, or exiting full-screen will be recorded.",
    "The exam auto-submits when the timer expires or upon severe violation.",
    "Once submitted, the attempt cannot be restarted.",
  ];

  const checklist = [
    { icon: <Monitor className="w-4 h-4 text-emerald-500" />, text: "Stable screen environment" },
    { icon: <Wifi className="w-4 h-4 text-emerald-500" />, text: "Stable internet connection" },
    { icon: <Shield className="w-4 h-4 text-emerald-500" />, text: "Webcam & AI Head Pose Proctoring" },
    { icon: <BookOpen className="w-4 h-4 text-emerald-500" />, text: "Exam rules understood" },
  ];

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        dk ? "bg-[#0F0E0C]" : "bg-[#F7F5F0]"
      }`}
    >
      <div className="w-full max-w-3xl space-y-5">
        {/* Header Card */}
        <div
          className={`rounded-2xl border p-8 text-center ${
            dk
              ? "bg-[#1C1A17] border-[#2E2B27]"
              : "bg-[#FFFFFF] border-[#D6CEBE]"
          }`}
          style={{ boxShadow: dk ? "0 8px 32px rgba(0,0,0,0.4)" : "0 4px 24px rgba(74,64,54,0.08)" }}
        >
          {/* Shield Icon */}
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
              dk ? "bg-[#2E6B47]/20 border border-[#2E6B47]/30" : "bg-[#EDF7F0] border border-[#B2D8C2]"
            }`}
          >
            <Shield className={`w-8 h-8 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold mb-3 ${
              dk ? "bg-[#2E6B47]/20 text-[#4ADE80] border border-[#2E6B47]/30" : "bg-[#EDF7F0] text-[#2E6B47] border border-[#B2D8C2]"
            }`}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            PROTECTED ASSESSMENT
          </div>

          <h1
            className={`text-3xl font-black tracking-tight mb-2 ${
              dk ? "text-[#EDE8DF]" : "text-[#24201D]"
            }`}
          >
            Protected DSA Assessment
          </h1>
          <p className={`text-sm mb-1 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            Measure your problem-solving and DSA readiness for software engineering roles.
          </p>
          <p className={`text-xs font-semibold ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`}>
            Welcome, {studentName}
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Questions", value: String(cfg.totalQuestions), icon: <BookOpen className="w-4 h-4" /> },
            { label: "Duration", value: `${cfg.durationMinutes} min`, icon: <Clock className="w-4 h-4" /> },
            { label: "Total Marks", value: String(cfg.totalMarks), icon: <CheckCircle2 className="w-4 h-4" /> },
            { label: "Passing", value: `${cfg.passingPercentage}%`, icon: <Shield className="w-4 h-4" /> },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl border p-4 text-center ${
                dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-[#FFFFFF] border-[#D6CEBE]"
              }`}
            >
              <div className={`flex justify-center mb-1 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                {stat.icon}
              </div>
              <div className={`text-xl font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                {stat.value}
              </div>
              <div className={`text-[11px] ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Two Column: Topics + Rules */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Topics */}
          <div
            className={`rounded-xl border p-5 ${
              dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-[#FFFFFF] border-[#D6CEBE]"
            }`}
          >
            <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Topics Covered
            </h3>
            <div className="space-y-1.5">
              {EXAM_TOPICS_DISPLAY.map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <ChevronRight className={`w-3 h-3 shrink-0 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
                  <span className={`text-xs ${dk ? "text-[#B5AFA6]" : "text-[#4A4036]"}`}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Rules */}
          <div
            className={`rounded-xl border p-5 ${
              dk ? "bg-[#1C0101] border-[#7f1d1d]/50" : "bg-[#FFF5F5] border-[#FECACA]"
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className={`w-4 h-4 ${dk ? "text-[#FCA5A5]" : "text-[#DC2626]"}`} />
              <h3 className={`text-xs font-bold uppercase tracking-widest ${dk ? "text-[#FCA5A5]" : "text-[#DC2626]"}`}>
                Exam Rules
              </h3>
            </div>
            <ol className="space-y-1.5">
              {rules.map((rule, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold mt-0.5 shrink-0 ${dk ? "text-[#FCA5A5]" : "text-[#DC2626]"}`}>
                    {i + 1}.
                  </span>
                  <span className={`text-[11px] leading-relaxed ${dk ? "text-[#B5AFA6]" : "text-[#4A4036]"}`}>
                    {rule}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Pre-exam Checklist */}
        <div
          className={`rounded-xl border p-5 ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-[#F7F5F0] border-[#D6CEBE]"
          }`}
        >
          <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            Pre-Exam Checklist
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {checklist.map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <div className={`${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`}>
                  {item.icon}
                </div>
                <span className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Acknowledge + Start */}
        <div
          className={`rounded-xl border p-5 ${
            dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-[#FFFFFF] border-[#D6CEBE]"
          }`}
        >
          <label className="flex items-start gap-3 cursor-pointer mb-5">
            <div className="relative mt-0.5">
              <input
                type="checkbox"
                className="sr-only"
                checked={rulesAcknowledged}
                onChange={(e) => setRulesAcknowledged(e.target.checked)}
              />
              <div
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  rulesAcknowledged
                    ? dk
                      ? "bg-[#2E6B47] border-[#2E6B47]"
                      : "bg-[#2E6B47] border-[#2E6B47]"
                    : dk
                    ? "border-[#3D3A35] bg-[#1C1A17]"
                    : "border-[#D6CEBE] bg-white"
                }`}
              >
                {rulesAcknowledged && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                )}
              </div>
            </div>
            <span className={`text-sm leading-relaxed ${dk ? "text-[#B5AFA6]" : "text-[#4A4036]"}`}>
              I have read and understood the exam rules. I agree to maintain exam
              integrity. I understand this is a protected assessment and my actions
              are monitored.
            </span>
          </label>

          <button
            type="button"
            onClick={handleStart}
            disabled={!rulesAcknowledged || isStarting}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl text-sm font-bold tracking-wide transition-all ${
              rulesAcknowledged && !isStarting
                ? dk
                  ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-white cursor-pointer shadow-lg"
                  : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732] cursor-pointer shadow-lg"
                : "opacity-40 cursor-not-allowed " + (dk ? "bg-[#2A2722] text-[#5C5751]" : "bg-[#E8E2D7] text-[#8A7E6C]")
            }`}
          >
            {isStarting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Initializing Protected Exam…
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Enter Protected Exam
                <Play className="w-4 h-4" />
              </>
            )}
          </button>

          <p className={`text-center text-[11px] mt-3 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
            The exam will request fullscreen mode after clicking the button above.
          </p>
        </div>
      </div>
    </div>
  );
};
