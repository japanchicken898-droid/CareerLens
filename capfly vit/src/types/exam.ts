// ═══════════════════════════════════════════════════════
//  CAPFLY — Protected DSA Exam — Type Definitions
// ═══════════════════════════════════════════════════════

export type QuestionType =
  | "MCQ"
  | "MULTI_SELECT"
  | "CODE_OUTPUT"
  | "COMPLEXITY"
  | "DEBUGGING"
  | "ALGORITHM_SELECTION"
  | "CODING";

export type Difficulty = "Easy" | "Medium" | "Hard";

export type DsaTopic =
  | "Arrays"
  | "Strings"
  | "Linked Lists"
  | "Stacks"
  | "Queues"
  | "Hashing"
  | "Trees"
  | "Binary Search Trees"
  | "Heaps"
  | "Graphs"
  | "Recursion"
  | "Dynamic Programming"
  | "Searching"
  | "Sorting"
  | "Two Pointers"
  | "Sliding Window"
  | "Time Complexity"
  | "Space Complexity"
  | "Problem Solving";

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  description?: string;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCode?: boolean;
}

export interface ExamQuestion {
  id: string;
  topic: DsaTopic;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  codeSnippet?: string;       // For CODE_OUTPUT, DEBUGGING, CODING
  options?: QuestionOption[];  // For MCQ, MULTI_SELECT, CODE_OUTPUT, COMPLEXITY, DEBUGGING, ALGORITHM_SELECTION
  correctAnswer: string | string[]; // Never sent to client during active exam
  explanation: string;
  marks: number;
  negativeMarks: number;
  timeLimit?: number;          // seconds per question (optional override)
  testCases?: TestCase[];      // For CODING questions
  tags: string[];
  starterCode?: Record<string, string>; // language -> starter code for CODING
}

// ── Exam Configuration ────────────────────────────────────────────

export interface TopicDistribution {
  topic: DsaTopic;
  percentage: number;
  questionCount: number;
}

export interface DifficultyDistribution {
  Easy: number;    // percentage
  Medium: number;
  Hard: number;
}

export interface IntegrityPolicy {
  allowedTabSwitches: number;   // 0 = terminate on first
  warnBeforeTerminate: boolean;
  terminateOnFullscreenExit: boolean;
  strictMode: boolean;
}

export interface ExamConfig {
  id: string;
  name: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  passingPercentage: number;
  negativeMarkingEnabled: boolean;
  defaultNegativeMarks: number;
  topicDistribution: TopicDistribution[];
  difficultyDistribution: DifficultyDistribution;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  maxAttempts: number;
  integrityPolicy: IntegrityPolicy;
  availableLanguages: string[];
  version: string;
}

// ── Attempt State Machine ─────────────────────────────────────────

export type AttemptStatus =
  | "NOT_STARTED"
  | "INITIALIZING"
  | "IN_PROGRESS"
  | "SUBMITTING"
  | "SUBMITTED"
  | "TERMINATED"
  | "TIME_EXPIRED";

export type SubmitReason =
  | "MANUAL"
  | "TIME_EXPIRED"
  | "INTEGRITY_VIOLATION"
  | "AUTO";

export type IntegrityEventType =
  | "TAB_SWITCH"
  | "WINDOW_BLUR"
  | "FULLSCREEN_EXIT"
  | "VISIBILITY_HIDDEN"
  | "PAGE_RELOAD_ATTEMPT"
  | "HEAD_TURNED_AWAY"
  | "FACE_MISSING"
  | "MULTIPLE_FACES"
  | "CAMERA_DISABLED"
  | "MOBILE_DEVICE_DETECTED"
  | "PHONE_GLARE_DETECTED";

export interface IntegrityEvent {
  id: string;
  attemptId: string;
  eventType: IntegrityEventType;
  timestamp: number;
  metadata?: Record<string, string>;
}

export interface SavedAnswer {
  questionId: string;
  answer: string | string[]; // MCQ = string, MULTI_SELECT = string[], CODING = code string
  language?: string;          // for CODING questions
  savedAt: number;
  isSkipped: boolean;
}

export interface ExamAttempt {
  id: string;
  examConfigId: string;
  studentId: string;
  studentName: string;
  status: AttemptStatus;
  startTime: number;           // Unix ms timestamp
  endTime?: number;
  submittedAt?: number;
  submitReason?: SubmitReason;
  questionIds: string[];       // ordered list for this attempt (randomized)
  answers: Record<string, SavedAnswer>; // questionId -> SavedAnswer
  flaggedQuestions: string[];
  integrityEvents: IntegrityEvent[];
  tabViolationCount: number;
  durationMinutes: number;     // from config at time of start
  lastSyncedAt: number;
}

// ── Scoring ───────────────────────────────────────────────────────

export interface QuestionResult {
  questionId: string;
  topic: DsaTopic;
  difficulty: Difficulty;
  type: QuestionType;
  marks: number;
  marksEarned: number;
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  isSkipped: boolean;
  studentAnswer: string | string[];
  correctAnswer: string | string[];
}

export interface TopicScore {
  topic: DsaTopic;
  totalQuestions: number;
  correct: number;
  percentage: number;
  level: "Strong" | "Good" | "Developing" | "Needs Attention";
}

export interface ExamResult {
  attemptId: string;
  examConfigId: string;
  studentId: string;
  studentName: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  skipped: number;
  totalMarks: number;
  marksEarned: number;
  percentage: number;
  passed: boolean;
  submitReason: SubmitReason;
  timeUsedMinutes: number;
  accuracy: number;             // correct / attempted * 100
  topicScores: TopicScore[];
  difficultyBreakdown: {
    Easy: { correct: number; total: number };
    Medium: { correct: number; total: number };
    Hard: { correct: number; total: number };
  };
  integrityStatus: {
    tabViolations: number;
    fullscreenExits: number;
    networkInterruptions: number;
    overallStatus: "Clean" | "Warning" | "Violated";
  };
  industryAlignment: IndustryAlignment;
  skillUpdates: SkillUpdate[];
  questionResults: QuestionResult[];
}

export interface IndustryAlignment {
  problemSolving: number;
  dataStructures: number;
  algorithms: number;
  complexityAnalysis: number;
  codingAccuracy: number;
}

export interface SkillUpdate {
  skill: string;
  before: number;
  after: number;
  delta: number;
}

// ── Client-safe question (no answer key) ─────────────────────────

export interface ClientQuestion {
  id: string;
  topic: DsaTopic;
  difficulty: Difficulty;
  type: QuestionType;
  question: string;
  codeSnippet?: string;
  options?: QuestionOption[];
  marks: number;
  negativeMarks: number;
  timeLimit?: number;
  testCases?: Pick<TestCase, "input" | "expectedOutput" | "description">[];  // only visible test cases
  starterCode?: Record<string, string>;
  tags: string[];
}
