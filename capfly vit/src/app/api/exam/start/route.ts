// ═══════════════════════════════════════════════════════
//  POST /api/exam/start
//  Creates a new exam attempt. Selects & randomizes
//  questions per config. Returns client-safe questions
//  (no correctAnswer). Stores full attempt in session.
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { QUESTION_BANK } from "@/data/questionBank";
import { DSA_EXAM_CONFIG } from "@/data/examConfig";
import type {
  ExamAttempt,
  ClientQuestion,
  ExamQuestion,
  DsaTopic,
} from "@/types/exam";

import { attemptStore, questionStore } from "@/lib/examStore";
export { attemptStore, questionStore };

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stripAnswer(q: ExamQuestion): ClientQuestion {
  const { correctAnswer, explanation, ...safe } = q;
  // For CODING questions, keep visible test cases only
  if (safe.testCases) {
    safe.testCases = safe.testCases
      .filter((tc) => !tc.isHidden)
      .map(({ input, expectedOutput, description }) => ({
        input,
        expectedOutput,
        description,
        isHidden: false,
      }));
  }
  return safe as ClientQuestion;
}

function selectQuestions(): ExamQuestion[] {
  const config = DSA_EXAM_CONFIG;
  const selected: ExamQuestion[] = [];

  // Select by topic distribution
  config.topicDistribution.forEach(({ topic, questionCount }) => {
    if (questionCount === 0) return;
    const pool = QUESTION_BANK.filter((q) => q.topic === topic);
    const shuffled = shuffleArray(pool);
    selected.push(...shuffled.slice(0, questionCount));
  });

  // If we need more to hit totalQuestions
  const needed = config.totalQuestions - selected.length;
  if (needed > 0) {
    const selectedIds = new Set(selected.map((q) => q.id));
    const remaining = shuffleArray(
      QUESTION_BANK.filter((q) => !selectedIds.has(q.id))
    );
    selected.push(...remaining.slice(0, needed));
  }

  // Trim if over
  const final = selected.slice(0, config.totalQuestions);

  // Randomize option order where safe (not CODING/COMPLEXITY)
  if (config.randomizeOptions) {
    return final.map((q) => {
      if (q.type === "CODING" || !q.options) return q;
      return { ...q, options: shuffleArray(q.options) };
    });
  }

  return config.randomizeQuestions ? shuffleArray(final) : final;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentId, studentName } = body;

    if (!studentId || !studentName) {
      return NextResponse.json(
        { error: "studentId and studentName are required" },
        { status: 400 }
      );
    }

    const questions = selectQuestions();
    const attemptId = generateId();
    const now = Date.now();

    const attempt: ExamAttempt = {
      id: attemptId,
      examConfigId: DSA_EXAM_CONFIG.id,
      studentId,
      studentName,
      status: "IN_PROGRESS",
      startTime: now,
      questionIds: questions.map((q) => q.id),
      answers: {},
      flaggedQuestions: [],
      integrityEvents: [],
      tabViolationCount: 0,
      durationMinutes: DSA_EXAM_CONFIG.durationMinutes,
      lastSyncedAt: now,
    };

    attemptStore.set(attemptId, attempt);

    // Return client-safe questions (no answers)
    const clientQuestions = questions.map(stripAnswer);

    return NextResponse.json({
      attemptId,
      examConfig: {
        id: DSA_EXAM_CONFIG.id,
        name: DSA_EXAM_CONFIG.name,
        totalQuestions: DSA_EXAM_CONFIG.totalQuestions,
        durationMinutes: DSA_EXAM_CONFIG.durationMinutes,
        totalMarks: DSA_EXAM_CONFIG.totalMarks,
        passingMarks: DSA_EXAM_CONFIG.passingMarks,
        passingPercentage: DSA_EXAM_CONFIG.passingPercentage,
        negativeMarkingEnabled: DSA_EXAM_CONFIG.negativeMarkingEnabled,
        integrityPolicy: DSA_EXAM_CONFIG.integrityPolicy,
        availableLanguages: DSA_EXAM_CONFIG.availableLanguages,
      },
      startTime: now,
      questions: clientQuestions,
    });
  } catch (err) {
    console.error("[exam/start]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
