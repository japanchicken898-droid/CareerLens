"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Shield, Flag, ChevronLeft, ChevronRight, Send, AlertTriangle, CheckCircle2, Wifi, WifiOff } from "lucide-react";
import { ProctorCamera } from "./ProctorCamera";
import { ExamTimer } from "./ExamTimer";
import { QuestionCard } from "./QuestionCard";
import { QuestionNavigator } from "./QuestionNavigator";
import type { ClientQuestion, ExamResult, IntegrityEventType } from "@/types/exam";
import {
  saveAnswer,
  submitExam,
  reportIntegrityEvent,
  toggleFlag,
  saveAttemptLocally,
  getRemainingMs,
} from "@/services/examService";

interface ExamInterfaceProps {
  attemptId: string;
  startTime: number;
  durationMinutes: number;
  questions: ClientQuestion[];
  initialAnswers?: Record<string, string | string[]>;
  initialFlagged?: string[];
  onResult: (result: ExamResult) => void;
  darkMode?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";
type ViolationState = "none" | "warned" | "terminated";

export const ExamInterface: React.FC<ExamInterfaceProps> = ({
  attemptId,
  startTime,
  durationMinutes,
  questions,
  initialAnswers = {},
  initialFlagged = [],
  onResult,
  darkMode = false,
}) => {
  const dk = darkMode;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>(initialAnswers);
  const [flagged, setFlagged] = useState<Set<string>>(new Set(initialFlagged));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [violation, setViolation] = useState<ViolationState>("none");
  const [violationMsg, setViolationMsg] = useState<string>("");
  const [violationCount, setViolationCount] = useState(0);
  const [allowedViolations, setAllowedViolations] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [isProtected, setIsProtected] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [selectedLang, setSelectedLang] = useState("JavaScript");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLocked = violation === "terminated" || isSubmitting;

  // ── Fullscreen ────────────────────────────────────────────────────
  useEffect(() => {
    const requestFs = async () => {
      try {
        await document.documentElement.requestFullscreen?.();
        setIsProtected(true);
      } catch {
        setIsProtected(false);
      }
    };
    requestFs();

    const handleFsChange = () => {
      if (!document.fullscreenElement) {
        setIsProtected(false);
        handleIntegrityEvent("FULLSCREEN_EXIT", "Exited full screen mode");
      } else {
        setIsProtected(true);
      }
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFsChange);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  // ── Online/offline ────────────────────────────────────────────────
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  // ── Integrity Event Handler ───────────────────────────────────────
  const handleIntegrityEvent = useCallback(
    async (type: IntegrityEventType, customMsg?: string) => {
      if (isLocked) return;
      if (customMsg) setViolationMsg(customMsg);

      const result = await reportIntegrityEvent(attemptId, type, customMsg ? { reason: customMsg } : undefined);
      setViolationCount(result.violationCount);
      setAllowedViolations(result.allowedViolations);

      // Instant termination ONLY on confirmed tab switch
      if (type === "TAB_SWITCH" || type === "VISIBILITY_HIDDEN") {
        setViolation("terminated");
        try {
          const { result: examResult } = await submitExam(attemptId, "INTEGRITY_VIOLATION");
          onResult(examResult);
        } catch {}
        return;
      }

      // For camera violations — show warn banner, terminate only if server says so
      if (result.action === "TERMINATE") {
        setViolation("terminated");
        try {
          const { result: examResult } = await submitExam(attemptId, "INTEGRITY_VIOLATION");
          onResult(examResult);
        } catch {}
      } else if (result.action === "WARN") {
        setViolation("warned");
      }
    },
    [attemptId, isLocked, onResult]
  );

  useEffect(() => {
    const onVisChange = () => {
      if (document.hidden) {
        handleIntegrityEvent("VISIBILITY_HIDDEN", "Switched browser tabs during active exam");
      }
    };

    document.addEventListener("visibilitychange", onVisChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisChange);
    };
  }, [handleIntegrityEvent]);

  // ── beforeunload ──────────────────────────────────────────────────
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Your exam is in progress. Are you sure you want to leave?";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // ── Persist locally on answer change ─────────────────────────────
  useEffect(() => {
    saveAttemptLocally({
      attemptId,
      startTime,
      durationMinutes,
      questions,
      answers,
      flaggedQuestions: Array.from(flagged),
      status: "IN_PROGRESS",
    });
  }, [answers, flagged, attemptId, startTime, durationMinutes, questions]);

  // ── Answer handler with autosave ─────────────────────────────────
  const handleAnswer = useCallback(
    async (answer: string | string[], language?: string) => {
      if (isLocked) return;
      const qId = questions[currentIndex]?.id;
      if (!qId) return;

      setAnswers((prev) => ({ ...prev, [qId]: answer }));
      setSaveStatus("saving");

      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        try {
          await saveAnswer(attemptId, qId, answer, language);
          setSaveStatus("saved");
          setTimeout(() => setSaveStatus("idle"), 2000);
        } catch {
          setSaveStatus("error");
        }
      }, 600);
    },
    [attemptId, currentIndex, isLocked, questions]
  );

  // ── Flag toggle ───────────────────────────────────────────────────
  const handleToggleFlag = async () => {
    if (isLocked) return;
    const qId = questions[currentIndex]?.id;
    if (!qId) return;
    const nowFlagged = !flagged.has(qId);
    const updated = new Set(flagged);
    nowFlagged ? updated.add(qId) : updated.delete(qId);
    setFlagged(updated);
    await toggleFlag(attemptId, qId, nowFlagged);
  };

  // ── Timer expire ──────────────────────────────────────────────────
  const handleTimerExpire = useCallback(async () => {
    if (isLocked) return;
    setIsSubmitting(true);
    try {
      const { result } = await submitExam(attemptId, "TIME_EXPIRED");
      onResult(result);
    } catch {
      setIsSubmitting(false);
    }
  }, [attemptId, isLocked, onResult]);

  // ── Final submit ──────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowSubmitConfirm(false);
    try {
      const { result } = await submitExam(attemptId, "MANUAL");
      onResult(result);
    } catch {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentIndex];
  const answeredIds = new Set(
    Object.entries(answers)
      .filter(([, v]) => v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k]) => k)
  );
  const flaggedIds = flagged;

  if (!currentQ) return null;

  // ── Violation overlay ─────────────────────────────────────────────
  if (violation === "terminated") {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dk ? "bg-[#0F0E0C]" : "bg-[#F7F5F0]"}`}>
        <div className={`max-w-md w-full mx-4 rounded-2xl border p-8 text-center ${dk ? "bg-[#1C1A17] border-[#7f1d1d]" : "bg-white border-[#FECACA]"}`}>
          <AlertTriangle className="w-12 h-12 text-[#DC2626] mx-auto mb-4" />
          <h2 className={`text-xl font-black mb-2 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
            Exam Terminated
          </h2>
          <p className={`text-sm ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
            The protected exam environment was exited multiple times. Your saved answers
            have been automatically submitted.
          </p>
          <div className={`mt-4 text-xs font-mono px-3 py-2 rounded-lg ${dk ? "bg-[#1c0101] text-[#FCA5A5]" : "bg-[#FEE2E2] text-[#DC2626]"}`}>
            AUTO-SUBMITTED — INTEGRITY VIOLATION
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${dk ? "bg-[#0F0E0C]" : "bg-[#F7F5F0]"}`}>
      {/* ── Exam Header ───────────────────────────────────────────── */}
      <header className={`sticky top-0 z-30 border-b backdrop-blur-md ${dk ? "bg-[#0F0E0C]/90 border-[#2E2B27]" : "bg-[#FAF8F5]/90 border-[#D6CEBE]"}`}>
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Brand + Assessment name */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
              <Shield className={`w-4 h-4 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
              <span className="font-black text-sm tracking-tight">CAPFLY</span>
            </div>
            <div className={`w-px h-4 ${dk ? "bg-[#2E2B27]" : "bg-[#D6CEBE]"}`} />
            <span className={`text-xs font-semibold ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              Protected DSA Assessment
            </span>
          </div>

          {/* Center: Progress */}
          <div className="hidden sm:flex items-center gap-3 flex-1 max-w-xs mx-4">
            <span className={`text-xs font-mono whitespace-nowrap ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
              {currentIndex + 1} / {questions.length}
            </span>
            <div className={`flex-1 h-1.5 rounded-full ${dk ? "bg-[#2A2722]" : "bg-[#E8E2D7]"}`}>
              <div
                className="h-full rounded-full bg-[#2E6B47] transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Right: Status badges + Timer */}
          <div className="flex items-center gap-2">
            {/* Network status */}
            {!isOnline && (
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${dk ? "bg-[#1c1500] text-[#FCD34D] border border-[#92400e]" : "bg-[#FEF9C3] text-[#B45309] border border-[#FDE68A]"}`}>
                <WifiOff className="w-3 h-3" />
                Offline
              </div>
            )}

            {/* Protected status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border ${
              isProtected
                ? dk ? "bg-[#052e16] text-[#4ADE80] border-[#166534]" : "bg-[#EDF7F0] text-[#2E6B47] border-[#86EFAC]"
                : dk ? "bg-[#1c1500] text-[#FCD34D] border-[#92400e]" : "bg-[#FEF9C3] text-[#B45309] border-[#FDE68A]"
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full bg-current ${isProtected ? "animate-pulse" : ""}`} />
              {isProtected ? "Protected" : "Unprotected"}
            </div>

            {/* Save status */}
            <div className={`text-[10px] font-mono ${
              saveStatus === "saved" ? (dk ? "text-[#4ADE80]" : "text-[#2E6B47]")
              : saveStatus === "saving" ? (dk ? "text-[#9A9183]" : "text-[#6E6659]")
              : saveStatus === "error" ? "text-[#DC2626]"
              : "opacity-0"
            }`}>
              {saveStatus === "saved" ? "✓ Saved" : saveStatus === "saving" ? "saving…" : saveStatus === "error" ? "⚠ Error" : "·"}
            </div>

            {/* Timer */}
            <ExamTimer
              startTime={startTime}
              durationMinutes={durationMinutes}
              onExpire={handleTimerExpire}
              darkMode={dk}
            />
          </div>
        </div>
      </header>

      {/* ── Violation Warning Banner ─────────────────────────────── */}
      {violation === "warned" && (
        <div className={`sticky top-[49px] z-20 flex items-center justify-between px-4 py-2.5 animate-bounce ${
          dk ? "bg-[#281815] border-b border-[#4A201A] text-[#FCA5A5]" : "bg-[#FEF2F2] border-b border-[#FCA5A5] text-[#991B1B]"
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 animate-pulse" />
            <span className="text-xs font-bold">
              ⚠️ PROCTORING VIOLATION: {violationMsg || "Leaving the protected exam environment or turning head is not allowed."}{" "}
              <strong>Violation {violationCount} of {allowedViolations}.</strong>{" "}
              Another violation will immediately terminate your exam.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setViolation("none")}
            className="text-xs underline font-bold cursor-pointer hover:opacity-80"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex gap-0">
        {/* Question area */}
        <div className="flex-1 p-4 sm:p-6 min-w-0">
          <QuestionCard
            question={currentQ}
            questionNumber={currentIndex + 1}
            totalQuestions={questions.length}
            savedAnswer={answers[currentQ.id]}
            selectedLanguage={selectedLang}
            onAnswer={handleAnswer}
            darkMode={dk}
          />

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((i) => i - 1)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                dk
                  ? "bg-[#2A2722] text-[#EDE8DF] border border-[#3D3A35] hover:bg-[#3D3A35]"
                  : "bg-[#FFFFFF] text-[#24201D] border border-[#D6CEBE] hover:bg-[#FAF8F5]"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {/* Flag */}
              <button
                type="button"
                onClick={handleToggleFlag}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                  flaggedIds.has(currentQ.id)
                    ? "bg-[#F97316] text-white border-[#F97316]"
                    : dk
                    ? "bg-[#2A2722] text-[#9A9183] border-[#3D3A35] hover:bg-[#3D3A35]"
                    : "bg-[#FFFFFF] text-[#6E6659] border-[#D6CEBE] hover:bg-[#FAF8F5]"
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                {flaggedIds.has(currentQ.id) ? "Flagged" : "Flag"}
              </button>

              {/* Submit exam */}
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(true)}
                disabled={isSubmitting}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                  dk
                    ? "bg-[#2E6B47]/80 text-[#EDE8DF] hover:bg-[#2E6B47]"
                    : "bg-[#2E6B47] text-white hover:bg-[#1a5c38]"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                Submit Exam
              </button>
            </div>

            <button
              type="button"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((i) => i + 1)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                dk
                  ? "bg-[#2A2722] text-[#EDE8DF] border border-[#3D3A35] hover:bg-[#3D3A35]"
                  : "bg-[#FFFFFF] text-[#24201D] border border-[#D6CEBE] hover:bg-[#FAF8F5]"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Sidebar: Camera + Question Navigator */}
        <div className={`hidden lg:flex w-64 shrink-0 p-4 border-l flex-col gap-4 overflow-y-auto ${
          dk ? "border-[#2E2B27]" : "border-[#D6CEBE]/60"
        }`}>
          {/* Real-Time Proctoring Camera */}
          <ProctorCamera
            onViolation={(type, msg) => handleIntegrityEvent(type, msg)}
            darkMode={dk}
          />

          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answeredIds={answeredIds}
            flaggedIds={flaggedIds}
            onSelect={setCurrentIndex}
            darkMode={dk}
          />
        </div>
      </div>

      {/* ── Submit Confirmation Modal ─────────────────────────────── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`w-full max-w-sm rounded-2xl border p-6 space-y-5 ${dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"}`}>
            <div className="text-center">
              <CheckCircle2 className={`w-10 h-10 mx-auto mb-3 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
              <h3 className={`text-lg font-black mb-1 ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                Submit Assessment?
              </h3>
              <p className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                This action is final and cannot be undone.
              </p>
            </div>

            <div className={`rounded-xl border p-4 space-y-2 text-sm ${dk ? "bg-[#161412] border-[#2E2B27]" : "bg-[#F7F5F0] border-[#D6CEBE]"}`}>
              {[
                { label: "Answered", value: answeredIds.size, color: dk ? "text-[#4ADE80]" : "text-[#2E6B47]" },
                { label: "Unanswered", value: questions.length - answeredIds.size, color: dk ? "text-[#FCA5A5]" : "text-[#DC2626]" },
                { label: "Flagged", value: flaggedIds.size, color: "text-[#F97316]" },
                { label: "Total Questions", value: questions.length, color: dk ? "text-[#EDE8DF]" : "text-[#24201D]" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className={dk ? "text-[#9A9183]" : "text-[#6E6659]"}>{row.label}</span>
                  <span className={`font-bold ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                  dk
                    ? "bg-[#2A2722] text-[#EDE8DF] border-[#3D3A35] hover:bg-[#3D3A35]"
                    : "bg-[#F0ECE1] text-[#24201D] border-[#D6CEBE] hover:bg-[#E8E2D7]"
                }`}
              >
                Continue Exam
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className={`flex-1 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors disabled:opacity-60 ${
                  dk
                    ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-white"
                    : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732]"
                }`}
              >
                {isSubmitting ? "Submitting…" : "Submit Assessment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
