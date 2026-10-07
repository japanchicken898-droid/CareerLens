// ═══════════════════════════════════════════════════════
//  CAPFLY — Protected DSA Exam Configuration
//  Change this file to reconfigure exam without touching UI
// ═══════════════════════════════════════════════════════

import type { ExamConfig } from "@/types/exam";

export const DSA_EXAM_CONFIG: ExamConfig = {
  id: "capfly-dsa-v1",
  name: "Protected DSA Assessment",
  description:
    "Measure your problem-solving and Data Structures & Algorithms readiness for software engineering roles.",
  totalQuestions: 25,
  durationMinutes: 45,
  totalMarks: 100,
  passingMarks: 50,
  passingPercentage: 50,
  negativeMarkingEnabled: true,
  defaultNegativeMarks: 0.25,
  topicDistribution: [
    { topic: "Arrays",            percentage: 12, questionCount: 3 },
    { topic: "Strings",           percentage: 8,  questionCount: 2 },
    { topic: "Linked Lists",      percentage: 8,  questionCount: 2 },
    { topic: "Stacks",            percentage: 4,  questionCount: 1 },
    { topic: "Queues",            percentage: 4,  questionCount: 1 },
    { topic: "Hashing",           percentage: 8,  questionCount: 2 },
    { topic: "Trees",             percentage: 8,  questionCount: 2 },
    { topic: "Binary Search Trees", percentage: 4, questionCount: 1 },
    { topic: "Heaps",             percentage: 4,  questionCount: 1 },
    { topic: "Graphs",            percentage: 8,  questionCount: 2 },
    { topic: "Sorting",           percentage: 8,  questionCount: 2 },
    { topic: "Searching",         percentage: 4,  questionCount: 1 },
    { topic: "Recursion",         percentage: 4,  questionCount: 1 },
    { topic: "Dynamic Programming", percentage: 4, questionCount: 1 },
    { topic: "Two Pointers",      percentage: 4,  questionCount: 1 },
    { topic: "Sliding Window",    percentage: 4,  questionCount: 1 },
    { topic: "Time Complexity",   percentage: 4,  questionCount: 1 },
    { topic: "Space Complexity",  percentage: 2,  questionCount: 0 },
    { topic: "Problem Solving",   percentage: 4,  questionCount: 1 },
  ],
  difficultyDistribution: {
    Easy: 40,
    Medium: 40,
    Hard: 20,
  },
  randomizeQuestions: true,
  randomizeOptions: true,
  maxAttempts: 1,
  integrityPolicy: {
    allowedTabSwitches: 0,
    warnBeforeTerminate: false,
    terminateOnFullscreenExit: false,
    strictMode: true,
  },
  availableLanguages: ["JavaScript", "Python", "Java", "C++"],
  version: "1.0.0",
};

export const MARKS_PER_QUESTION = Math.round(
  DSA_EXAM_CONFIG.totalMarks / DSA_EXAM_CONFIG.totalQuestions
);

export const EXAM_TOPICS_DISPLAY = [
  "Arrays & Strings",
  "Linked Lists",
  "Stacks & Queues",
  "Trees & BST",
  "Graphs",
  "Sorting & Searching",
  "Hashing",
  "Recursion & DP",
  "Two Pointers & Sliding Window",
  "Complexity Analysis",
];
