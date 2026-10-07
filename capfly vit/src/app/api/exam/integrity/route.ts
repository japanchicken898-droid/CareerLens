// ═══════════════════════════════════════════════════════
//  POST /api/exam/integrity
//  Records an integrity event (tab switch, fullscreen exit)
//  Returns current violation count and policy action
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { attemptStore } from "@/lib/examStore";
import type { IntegrityEvent, IntegrityEventType } from "@/types/exam";
import { DSA_EXAM_CONFIG } from "@/data/examConfig";

function generateId() {
  return `ie-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId, eventType, metadata } = body as {
      attemptId: string;
      eventType: IntegrityEventType;
      metadata?: Record<string, string>;
    };

    const attempt = attemptStore.get(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json({ status: attempt.status, action: "NONE" });
    }

    const event: IntegrityEvent = {
      id: generateId(),
      attemptId,
      eventType,
      timestamp: Date.now(),
      metadata,
    };

    attempt.integrityEvents.push(event);

    const policy = DSA_EXAM_CONFIG.integrityPolicy;
    let action: "WARN" | "TERMINATE" | "NONE" = "NONE";

    // ── Only real tab switches trigger instant termination ──
    if (eventType === "TAB_SWITCH" || eventType === "VISIBILITY_HIDDEN") {
      attempt.tabViolationCount += 1;
      attempt.status = "TERMINATED";
      attempt.endTime = Date.now();
      attempt.submitReason = "INTEGRITY_VIOLATION";
      action = "TERMINATE";
    }

    // ── Camera / cheating violations: warn only (no auto-terminate) ──
    if (
      eventType === "MOBILE_DEVICE_DETECTED" ||
      eventType === "MULTIPLE_FACES" ||
      eventType === "FACE_MISSING"
    ) {
      attempt.tabViolationCount += 1;
      if (attempt.tabViolationCount >= policy.allowedTabSwitches + 1) {
        attempt.status = "TERMINATED";
        attempt.endTime = Date.now();
        attempt.submitReason = "INTEGRITY_VIOLATION";
        action = "TERMINATE";
      } else {
        action = "WARN";
      }
    }

    if (eventType === "FULLSCREEN_EXIT" && policy.terminateOnFullscreenExit) {
      attempt.status = "TERMINATED";
      attempt.endTime = Date.now();
      attempt.submitReason = "INTEGRITY_VIOLATION";
      action = "TERMINATE";
    }

    attempt.lastSyncedAt = Date.now();
    attemptStore.set(attemptId, attempt);

    return NextResponse.json({
      action,
      violationCount: attempt.tabViolationCount,
      allowedViolations: policy.allowedTabSwitches,
      status: attempt.status,
    });
  } catch (err) {
    console.error("[exam/integrity]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
