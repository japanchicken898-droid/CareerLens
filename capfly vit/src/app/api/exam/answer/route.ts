// ═══════════════════════════════════════════════════════
//  POST /api/exam/answer
//  Saves (or updates) a student's answer for one question
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { attemptStore } from "../start/route";
import type { SavedAnswer } from "@/types/exam";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId, questionId, answer, language } = body;

    const attempt = attemptStore.get(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: `Attempt is ${attempt.status} — answers no longer accepted` },
        { status: 409 }
      );
    }

    // Check time validity
    const elapsed = Date.now() - attempt.startTime;
    const allowed = attempt.durationMinutes * 60 * 1000;
    if (elapsed > allowed) {
      attempt.status = "TIME_EXPIRED";
      attemptStore.set(attemptId, attempt);
      return NextResponse.json(
        { error: "Exam time has expired" },
        { status: 409 }
      );
    }

    const saved: SavedAnswer = {
      questionId,
      answer,
      language,
      savedAt: Date.now(),
      isSkipped: answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0),
    };

    attempt.answers[questionId] = saved;
    attempt.lastSyncedAt = Date.now();
    attemptStore.set(attemptId, attempt);

    return NextResponse.json({ success: true, savedAt: saved.savedAt });
  } catch (err) {
    console.error("[exam/answer]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
