// ═══════════════════════════════════════════════════════
//  GET /api/exam/attempt/[id]
//  Recover attempt state after page refresh
//  Returns: status, timeRemaining, answered count
//  Does NOT return correct answers
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { attemptStore, questionStore } from "@/lib/examStore";
import { DSA_EXAM_CONFIG } from "@/data/examConfig";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attempt = attemptStore.get(id);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const now = Date.now();
  const elapsed = now - attempt.startTime;
  const allowedMs = attempt.durationMinutes * 60 * 1000;
  const remaining = Math.max(0, allowedMs - elapsed);

  // Auto-expire if time is up
  if (remaining === 0 && attempt.status === "IN_PROGRESS") {
    attempt.status = "TIME_EXPIRED";
    attemptStore.set(id, attempt);
  }

  const answeredCount = Object.keys(attempt.answers).filter(
    (qId) => !attempt.answers[qId].isSkipped
  ).length;

  return NextResponse.json({
    attemptId: id,
    status: attempt.status,
    startTime: attempt.startTime,
    durationMinutes: attempt.durationMinutes,
    remainingMs: remaining,
    answeredCount,
    totalQuestions: attempt.questionIds.length,
    flaggedQuestions: attempt.flaggedQuestions,
    tabViolationCount: attempt.tabViolationCount,
    allowedTabSwitches: DSA_EXAM_CONFIG.integrityPolicy.allowedTabSwitches,
    submitReason: attempt.submitReason,
  });
}

// PATCH — toggle flag on a question
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const attempt = attemptStore.get(id);
  if (!attempt) {
    return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  }

  const { questionId, flagged } = await req.json();
  if (flagged) {
    if (!attempt.flaggedQuestions.includes(questionId)) {
      attempt.flaggedQuestions.push(questionId);
    }
  } else {
    attempt.flaggedQuestions = attempt.flaggedQuestions.filter(
      (q) => q !== questionId
    );
  }
  attemptStore.set(id, attempt);
  return NextResponse.json({ flaggedQuestions: attempt.flaggedQuestions });
}
