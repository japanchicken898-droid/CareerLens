// ═══════════════════════════════════════════════════════
//  POST /api/exam/submit
//  Scores the attempt server-side using the full question
//  bank (answer keys never visible to client).
// ═══════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { attemptStore, questionStore } from "@/lib/examStore";
import { DSA_EXAM_CONFIG } from "@/data/examConfig";
import type {
  ExamResult,
  QuestionResult,
  TopicScore,
  SubmitReason,
  DsaTopic,
} from "@/types/exam";

type ScoreLevel = "Strong" | "Good" | "Developing" | "Needs Attention";

function scoreLevel(pct: number): ScoreLevel {
  if (pct >= 80) return "Strong";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Developing";
  return "Needs Attention";
}

function isCorrect(
  studentAns: string | string[],
  correctAns: string | string[]
): boolean {
  if (Array.isArray(correctAns) && Array.isArray(studentAns)) {
    const a = [...studentAns].sort();
    const b = [...correctAns].sort();
    return JSON.stringify(a) === JSON.stringify(b);
  }
  return String(studentAns).trim() === String(correctAns).trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { attemptId, submitReason = "MANUAL" } = body as {
      attemptId: string;
      submitReason?: SubmitReason;
    };

    const attempt = attemptStore.get(attemptId);
    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Accept submission only if IN_PROGRESS or TERMINATED/TIME_EXPIRED (for auto-submit)
    const acceptableStatuses = ["IN_PROGRESS", "TERMINATED", "TIME_EXPIRED"];
    if (!acceptableStatuses.includes(attempt.status)) {
      return NextResponse.json(
        { error: "Attempt already submitted" },
        { status: 409 }
      );
    }

    const now = Date.now();
    const config = DSA_EXAM_CONFIG;

    // Determine final submit reason
    let finalReason: SubmitReason = submitReason;
    if (attempt.status === "TERMINATED") finalReason = "INTEGRITY_VIOLATION";
    else if (attempt.status === "TIME_EXPIRED") finalReason = "TIME_EXPIRED";
    else {
      // Check if time expired
      const elapsed = now - attempt.startTime;
      const allowed = attempt.durationMinutes * 60 * 1000;
      if (elapsed >= allowed) finalReason = "TIME_EXPIRED";
    }

    attempt.status = "SUBMITTED";
    attempt.endTime = now;
    attempt.submittedAt = now;
    attempt.submitReason = finalReason;

    // ── Score calculation ───────────────────────────────────────────
    let totalMarksEarned = 0;
    let correct = 0;
    let incorrect = 0;
    let skipped = 0;

    const questionResults: QuestionResult[] = [];
    const topicMap = new Map<DsaTopic, { total: number; correct: number }>();

    for (const qId of attempt.questionIds) {
      const question = questionStore.get(qId);
      if (!question) continue;

      const savedAnswer = attempt.answers[qId];
      const isSkipped =
        !savedAnswer ||
        savedAnswer.isSkipped ||
        savedAnswer.answer === null ||
        savedAnswer.answer === "";

      let marksEarned = 0;
      let correct_q = false;
      let partial = false;

      if (!isSkipped) {
        if (question.type === "CODING") {
          // Coding: partial credit based on test cases passing
          // In this demo, award full marks for non-empty submission
          // A real system would run the code against test cases
          const hasCode =
            typeof savedAnswer.answer === "string" &&
            savedAnswer.answer.trim().length > 20;
          if (hasCode) {
            marksEarned = Math.round(question.marks * 0.6); // demo: 60% for attempt
            correct_q = false;
            partial = true;
          }
        } else {
          correct_q = isCorrect(savedAnswer.answer, question.correctAnswer);
          if (correct_q) {
            marksEarned = question.marks;
            correct += 1;
          } else {
            if (config.negativeMarkingEnabled) {
              marksEarned = -question.negativeMarks;
            }
            incorrect += 1;
          }
        }
      } else {
        skipped += 1;
      }

      totalMarksEarned += marksEarned;

      questionResults.push({
        questionId: qId,
        topic: question.topic,
        difficulty: question.difficulty,
        type: question.type,
        marks: question.marks,
        marksEarned,
        isCorrect: correct_q,
        isPartiallyCorrect: partial,
        isSkipped,
        studentAnswer: savedAnswer?.answer ?? "",
        correctAnswer: question.correctAnswer,
      });

      // Track per-topic
      if (!topicMap.has(question.topic)) {
        topicMap.set(question.topic, { total: 0, correct: 0 });
      }
      const ts = topicMap.get(question.topic)!;
      ts.total += 1;
      if (correct_q) ts.correct += 1;
    }

    // Clamp marks to [0, totalMarks]
    totalMarksEarned = Math.max(0, Math.min(config.totalMarks, Math.round(totalMarksEarned)));

    const percentage = Math.round((totalMarksEarned / config.totalMarks) * 100);
    const passed = totalMarksEarned >= config.passingMarks;
    const attempted = correct + incorrect; // non-coding, non-skipped
    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const timeUsedMinutes = Math.round((now - attempt.startTime) / 60000);

    // Topic scores
    const topicScores: TopicScore[] = Array.from(topicMap.entries()).map(
      ([topic, { total, correct: c }]) => ({
        topic,
        totalQuestions: total,
        correct: c,
        percentage: total > 0 ? Math.round((c / total) * 100) : 0,
        level: scoreLevel(total > 0 ? (c / total) * 100 : 0),
      })
    );

    // Difficulty breakdown
    const diffBreakdown = { Easy: { correct: 0, total: 0 }, Medium: { correct: 0, total: 0 }, Hard: { correct: 0, total: 0 } };
    questionResults.forEach((r) => {
      diffBreakdown[r.difficulty].total += 1;
      if (r.isCorrect) diffBreakdown[r.difficulty].correct += 1;
    });

    // Integrity status
    const fsExits = attempt.integrityEvents.filter((e) => e.eventType === "FULLSCREEN_EXIT").length;
    const netInterruptions = attempt.integrityEvents.filter((e) => e.eventType === "PAGE_RELOAD_ATTEMPT").length;
    const integrityOverall =
      attempt.tabViolationCount === 0 && fsExits === 0
        ? "Clean"
        : attempt.status === "SUBMITTED" && finalReason !== "INTEGRITY_VIOLATION"
        ? "Warning"
        : "Violated";

    // Industry alignment
    const dsaTopics: DsaTopic[] = ["Arrays", "Linked Lists", "Stacks", "Queues", "Trees", "Binary Search Trees", "Heaps", "Graphs"];
    const algoTopics: DsaTopic[] = ["Sorting", "Searching", "Recursion", "Dynamic Programming", "Two Pointers", "Sliding Window"];
    const complexityTopics: DsaTopic[] = ["Time Complexity", "Space Complexity"];

    function avgScore(topics: DsaTopic[]) {
      const relevant = topicScores.filter((ts) => topics.includes(ts.topic));
      if (!relevant.length) return 50;
      return Math.round(relevant.reduce((s, ts) => s + ts.percentage, 0) / relevant.length);
    }

    const industryAlignment = {
      problemSolving: percentage,
      dataStructures: avgScore(dsaTopics),
      algorithms: avgScore(algoTopics),
      complexityAnalysis: avgScore(complexityTopics),
      codingAccuracy: accuracy,
    };

    // Skill updates
    const dsaScore = Math.round(
      (industryAlignment.dataStructures * 0.4 +
        industryAlignment.algorithms * 0.3 +
        industryAlignment.complexityAnalysis * 0.3)
    );
    const skillUpdates = [
      { skill: "Data Structures & Algorithms", before: 55, after: Math.min(95, Math.max(20, dsaScore)), delta: 0 },
      { skill: "Problem Solving", before: 50, after: Math.min(95, Math.max(20, industryAlignment.problemSolving)), delta: 0 },
    ];
    skillUpdates.forEach((s) => { s.delta = s.after - s.before; });

    const result: ExamResult = {
      attemptId,
      examConfigId: config.id,
      studentId: attempt.studentId,
      studentName: attempt.studentName,
      totalQuestions: attempt.questionIds.length,
      attempted: attempted + questionResults.filter((r) => r.isPartiallyCorrect).length,
      correct,
      incorrect,
      skipped,
      totalMarks: config.totalMarks,
      marksEarned: totalMarksEarned,
      percentage,
      passed,
      submitReason: finalReason,
      timeUsedMinutes,
      accuracy,
      topicScores,
      difficultyBreakdown: diffBreakdown,
      integrityStatus: {
        tabViolations: attempt.tabViolationCount,
        fullscreenExits: fsExits,
        networkInterruptions: netInterruptions,
        overallStatus: integrityOverall,
      },
      industryAlignment,
      skillUpdates,
      questionResults,
    };

    attemptStore.set(attemptId, attempt);

    return NextResponse.json({ result });
  } catch (err) {
    console.error("[exam/submit]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
