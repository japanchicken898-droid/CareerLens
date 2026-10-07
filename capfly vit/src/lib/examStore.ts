import type { ExamAttempt, ExamQuestion } from "@/types/exam";
import { QUESTION_BANK } from "@/data/questionBank";

// Global singleton store across Next.js API routes & dev reloads
const globalForExam = globalThis as unknown as {
  attemptStore: Map<string, ExamAttempt>;
  questionStore: Map<string, ExamQuestion>;
};

export const attemptStore =
  globalForExam.attemptStore || new Map<string, ExamAttempt>();

export const questionStore =
  globalForExam.questionStore || new Map<string, ExamQuestion>();

if (process.env.NODE_ENV !== "production") {
  globalForExam.attemptStore = attemptStore;
  globalForExam.questionStore = questionStore;
}

// Seed question store
if (questionStore.size === 0) {
  QUESTION_BANK.forEach((q) => questionStore.set(q.id, q));
}
