// ═══════════════════════════════════════════════════════
//  CAPFLY — Client-side Exam Service
//  Wraps all API calls, manages localStorage persistence
//  for page-refresh recovery, and handles timing logic.
// ═══════════════════════════════════════════════════════

import type {
  ClientQuestion,
  ExamResult,
  IntegrityEventType,
  AttemptStatus,
} from "@/types/exam";

const LS_KEY = "capfly_exam_attempt";

export interface LocalAttemptState {
  attemptId: string;
  startTime: number;
  durationMinutes: number;
  questions: ClientQuestion[];
  answers: Record<string, string | string[]>;
  flaggedQuestions: string[];
  status: AttemptStatus;
}

// ── Persistence ───────────────────────────────────────────────────

export function saveAttemptLocally(state: LocalAttemptState) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {}
}

export function loadAttemptLocally(): LocalAttemptState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LocalAttemptState;
  } catch {
    return null;
  }
}

export function clearAttemptLocally() {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {}
}

// ── API calls ─────────────────────────────────────────────────────

export async function startExam(studentId: string, studentName: string): Promise<{
  attemptId: string;
  startTime: number;
  questions: ClientQuestion[];
  examConfig: {
    totalQuestions: number;
    durationMinutes: number;
    totalMarks: number;
    passingMarks: number;
    passingPercentage: number;
    negativeMarkingEnabled: boolean;
    integrityPolicy: { allowedTabSwitches: number; warnBeforeTerminate: boolean; terminateOnFullscreenExit: boolean };
    availableLanguages: string[];
  };
}> {
  const res = await fetch("/api/exam/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, studentName }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function saveAnswer(
  attemptId: string,
  questionId: string,
  answer: string | string[],
  language?: string
): Promise<{ success: boolean; savedAt: number }> {
  const res = await fetch("/api/exam/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId, questionId, answer, language }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Save failed");
  }
  return res.json();
}

export async function reportIntegrityEvent(
  attemptId: string,
  eventType: IntegrityEventType,
  metadata?: Record<string, string>
): Promise<{
  action: "WARN" | "TERMINATE" | "NONE";
  violationCount: number;
  allowedViolations: number;
  status: AttemptStatus;
}> {
  try {
    const res = await fetch("/api/exam/integrity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ attemptId, eventType, metadata }),
    });
    if (!res.ok) return { action: "NONE", violationCount: 0, allowedViolations: 1, status: "IN_PROGRESS" };
    return res.json();
  } catch {
    return { action: "NONE", violationCount: 0, allowedViolations: 1, status: "IN_PROGRESS" };
  }
}

export async function submitExam(
  attemptId: string,
  submitReason: "MANUAL" | "TIME_EXPIRED" | "INTEGRITY_VIOLATION" = "MANUAL"
): Promise<{ result: ExamResult }> {
  const res = await fetch("/api/exam/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ attemptId, submitReason }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function recoverAttempt(attemptId: string): Promise<{
  status: AttemptStatus;
  remainingMs: number;
  answeredCount: number;
  flaggedQuestions: string[];
  tabViolationCount: number;
}> {
  const res = await fetch(`/api/exam/attempt/${attemptId}`);
  if (!res.ok) throw new Error("Attempt not found");
  return res.json();
}

export async function toggleFlag(
  attemptId: string,
  questionId: string,
  flagged: boolean
): Promise<string[]> {
  const res = await fetch(`/api/exam/attempt/${attemptId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, flagged }),
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.flaggedQuestions;
}

// ── Timer utilities ───────────────────────────────────────────────

export function getRemainingMs(startTime: number, durationMinutes: number): number {
  const endTime = startTime + durationMinutes * 60 * 1000;
  return Math.max(0, endTime - Date.now());
}

export function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function isTimeExpired(startTime: number, durationMinutes: number): boolean {
  return getRemainingMs(startTime, durationMinutes) === 0;
}
