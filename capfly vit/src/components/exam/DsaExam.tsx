"use client";

import React, { useState, useCallback } from "react";
import { ExamStartScreen } from "./ExamStartScreen";
import { ExamInterface } from "./ExamInterface";
import { ExamResultPage } from "./ExamResultPage";
import type { ClientQuestion, ExamResult } from "@/types/exam";
import {
  startExam,
  saveAttemptLocally,
  clearAttemptLocally,
} from "@/services/examService";

type ExamPhase = "START" | "IN_PROGRESS" | "RESULT";

interface DsaExamProps {
  studentId: string;
  studentName: string;
  onComplete: (result: ExamResult) => void;
  darkMode?: boolean;
}

export const DsaExam: React.FC<DsaExamProps> = ({
  studentId,
  studentName,
  onComplete,
  darkMode = false,
}) => {
  const dk = darkMode;
  const [phase, setPhase] = useState<ExamPhase>("START");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [questions, setQuestions] = useState<ClientQuestion[]>([]);
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await startExam(studentId, studentName);
      setAttemptId(data.attemptId);
      setStartTime(data.startTime);
      setDurationMinutes(data.examConfig.durationMinutes);
      setQuestions(data.questions);

      // Persist to localStorage for refresh recovery
      saveAttemptLocally({
        attemptId: data.attemptId,
        startTime: data.startTime,
        durationMinutes: data.examConfig.durationMinutes,
        questions: data.questions,
        answers: {},
        flaggedQuestions: [],
        status: "IN_PROGRESS",
      });

      setPhase("IN_PROGRESS");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start exam. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [studentId, studentName]);

  const handleResult = useCallback(
    (examResult: ExamResult) => {
      clearAttemptLocally();
      setResult(examResult);
      setPhase("RESULT");
    },
    []
  );

  const handleContinue = useCallback(() => {
    if (result) {
      onComplete(result);
    }
  }, [result, onComplete]);

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-4 ${dk ? "bg-[#0F0E0C]" : "bg-[#F7F5F0]"}`}>
        <div className={`w-10 h-10 border-2 border-t-transparent rounded-full animate-spin ${dk ? "border-[#EDE8DF]" : "border-[#24201D]"}`} />
        <p className={`text-sm font-semibold ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
          Initializing protected exam environment…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${dk ? "bg-[#0F0E0C]" : "bg-[#F7F5F0]"}`}>
        <div className={`max-w-md w-full rounded-2xl border p-8 text-center ${dk ? "bg-[#1C1A17] border-[#7f1d1d]" : "bg-white border-[#FECACA]"}`}>
          <p className={`text-sm font-semibold mb-4 ${dk ? "text-[#FCA5A5]" : "text-[#DC2626]"}`}>{error}</p>
          <button
            type="button"
            onClick={() => { setError(null); }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer ${dk ? "bg-[#EDE8DF] text-[#0F0E0C]" : "bg-[#24201D] text-white"}`}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (phase === "START") {
    return (
      <ExamStartScreen
        studentName={studentName}
        onStart={handleStart}
        darkMode={dk}
      />
    );
  }

  if (phase === "IN_PROGRESS" && attemptId) {
    return (
      <ExamInterface
        attemptId={attemptId}
        startTime={startTime}
        durationMinutes={durationMinutes}
        questions={questions}
        onResult={handleResult}
        darkMode={dk}
      />
    );
  }

  if (phase === "RESULT" && result) {
    return (
      <ExamResultPage
        result={result}
        onContinue={handleContinue}
        darkMode={dk}
      />
    );
  }

  return null;
};
