import {
  StudentBatchRecord,
  BatchAnalytics,
  BatchFilters,
  ReadinessStatusCategory,
} from "@/types/batch";
import { ExtractedProfile } from "@/types/extraction";
import { ExamResult } from "@/types/exam";
import { SkillGapAnalysis } from "@/types/skillGap";
import { VerificationReport } from "@/types/verification";

// Sample initial repository records representing student batch analysis
const INITIAL_BATCH_STUDENTS: StudentBatchRecord[] = [
  {
    id: "std_001",
    name: "Alex Vance",
    institution: "RMK Engineering College",
    department: "Information Technology",
    batchYear: "2026",
    targetRole: "Backend Developer",
    readinessScore: 84,
    readinessStatus: "READY",
    topGap: "System Design",
    evidenceStatus: "Strong",
    roadmapProgress: 75,
    placementStatus: "Applied",
    verifiedSkills: ["Java", "Spring Boot", "SQL", "Git", "REST APIs", "DSA"],
    evidenceGaps: ["Docker", "Redis"],
    skillGaps: ["System Design", "Kubernetes"],
    reasonsNotReady: [],
    analyzedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "std_002",
    name: "Priya Sharma",
    institution: "RMK Engineering College",
    department: "Computer Science",
    batchYear: "2026",
    targetRole: "Full Stack Developer",
    readinessScore: 78,
    readinessStatus: "NEAR READY",
    topGap: "AWS",
    evidenceStatus: "Strong",
    roadmapProgress: 60,
    placementStatus: "Interviewing",
    verifiedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "HTML/CSS"],
    evidenceGaps: ["AWS Cloud Deployment"],
    skillGaps: ["System Design Basics"],
    reasonsNotReady: ["AWS Cloud Deployment: Required for target role but no repository evidence found"],
    analyzedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "std_003",
    name: "Rahul Verma",
    institution: "RMK Engineering College",
    department: "Information Technology",
    batchYear: "2026",
    targetRole: "Data Scientist",
    readinessScore: 62,
    readinessStatus: "DEVELOPING",
    topGap: "Machine Learning",
    evidenceStatus: "Moderate",
    roadmapProgress: 45,
    placementStatus: "Not Applied",
    verifiedSkills: ["Python", "SQL", "Data Analysis", "Pandas"],
    evidenceGaps: ["Machine Learning Models", "Big Data / PySpark"],
    skillGaps: ["Machine Learning", "Deep Learning Frameworks"],
    reasonsNotReady: [
      "Machine Learning: Required for Data Scientist role",
      "Low DSA proctored exam score (under 50%)",
    ],
    analyzedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "std_004",
    name: "Kavya Nair",
    institution: "RMK Engineering College",
    department: "Electronics & Communication",
    batchYear: "2026",
    targetRole: "Frontend Developer",
    readinessScore: 88,
    readinessStatus: "READY",
    topGap: "Next.js SSR",
    evidenceStatus: "Strong",
    roadmapProgress: 85,
    placementStatus: "Offer Received",
    verifiedSkills: ["JavaScript", "React", "Tailwind CSS", "Redux", "Git", "Figma"],
    evidenceGaps: ["Next.js SSR"],
    skillGaps: ["GraphQL"],
    reasonsNotReady: [],
    analyzedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "std_005",
    name: "Siddharth Das",
    institution: "RMK Engineering College",
    department: "Computer Science",
    batchYear: "2026",
    targetRole: "Backend Developer",
    readinessScore: 48,
    readinessStatus: "HIGH SUPPORT NEEDED",
    topGap: "SQL & Databases",
    evidenceStatus: "Weak",
    roadmapProgress: 20,
    placementStatus: "Not Applied",
    verifiedSkills: ["C++", "Basic Data Structures"],
    evidenceGaps: ["Node.js API", "SQL Databases", "Git Repositories"],
    skillGaps: ["SQL & Databases", "Docker", "REST API Architecture"],
    reasonsNotReady: [
      "SQL & Databases: Core requirement missing",
      "No GitHub proof-of-work repositories found",
      "Protected DSA Exam score below 50%",
    ],
    analyzedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "std_006",
    name: "Ananya Iyer",
    institution: "RMK Engineering College",
    department: "Information Technology",
    batchYear: "2026",
    targetRole: "Cloud Engineer",
    readinessScore: 71,
    readinessStatus: "NEAR READY",
    topGap: "Kubernetes",
    evidenceStatus: "Moderate",
    roadmapProgress: 55,
    placementStatus: "Applied",
    verifiedSkills: ["Linux", "AWS", "Docker", "Python", "Shell Scripting"],
    evidenceGaps: ["Kubernetes Cluster Admin"],
    skillGaps: ["Kubernetes", "Terraform IaC"],
    reasonsNotReady: ["Kubernetes: Advanced container orchestration evidence missing"],
    analyzedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

const STORAGE_KEY = "careerlens_batch_students_db";

class DashboardService {
  private students: StudentBatchRecord[] = [];

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          this.students = JSON.parse(stored);
        } else {
          this.students = INITIAL_BATCH_STUDENTS;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
        }
      } catch {
        this.students = INITIAL_BATCH_STUDENTS;
      }
    } else {
      this.students = INITIAL_BATCH_STUDENTS;
    }
  }

  private saveStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.students));
      } catch {
        // Fallback
      }
    }
  }

  /**
   * Register or update active student analysis from CareerLens steps 1-6
   */
  public registerStudentAnalysis(
    studentName: string,
    extractedProfile: ExtractedProfile | null,
    verificationReport: VerificationReport | null,
    skillGapAnalysis: SkillGapAnalysis | null,
    examResult: ExamResult | null,
    department: string = "Information Technology",
    institution: string = "RMK Engineering College",
    batchYear: string = "2026"
  ): StudentBatchRecord {
    const targetRole = extractedProfile?.profile.targetRole || "Backend Developer";
    
    let readinessScore = 50;
    if (skillGapAnalysis) {
      readinessScore = skillGapAnalysis.summary.readinessScore;
    } else if (verificationReport) {
      readinessScore = Math.round(
        (verificationReport.skills.filter((s) => s.status === "VERIFIED").length /
          Math.max(verificationReport.skills.length, 1)) *
          100
      );
    }

    let readinessStatus: ReadinessStatusCategory = "DEVELOPING";
    if (readinessScore >= 80) readinessStatus = "READY";
    else if (readinessScore >= 65) readinessStatus = "NEAR READY";
    else if (readinessScore >= 50) readinessStatus = "DEVELOPING";
    else readinessStatus = "HIGH SUPPORT NEEDED";

    const topGap =
      skillGapAnalysis?.skillGaps[0]?.normalizedSkill ||
      skillGapAnalysis?.evidenceGaps[0]?.normalizedSkill ||
      "Cloud Deployment";

    const verifiedSkills = verificationReport
      ? verificationReport.skills.filter((s) => s.status === "VERIFIED").map((s) => s.normalizedSkill)
      : ["JavaScript", "React", "DSA"];

    const evidenceGaps = skillGapAnalysis
      ? skillGapAnalysis.evidenceGaps.map((g) => g.normalizedSkill)
      : ["AWS Cloud Deployment"];

    const skillGaps = skillGapAnalysis
      ? skillGapAnalysis.skillGaps.map((g) => g.normalizedSkill)
      : ["System Design"];

    const reasonsNotReady = skillGapAnalysis
      ? skillGapAnalysis.gaps
          .filter((g) => g.priority === "CRITICAL" || g.priority === "HIGH")
          .map((g) => `${g.normalizedSkill}: ${g.explanation}`)
      : [];

    const existingIndex = this.students.findIndex(
      (s) => s.name.toLowerCase() === studentName.toLowerCase()
    );

    const record: StudentBatchRecord = {
      id: existingIndex >= 0 ? this.students[existingIndex].id : `std_${Date.now()}`,
      name: studentName,
      institution,
      department,
      batchYear,
      targetRole,
      readinessScore,
      readinessStatus,
      topGap,
      evidenceStatus: verifiedSkills.length >= 4 ? "Strong" : verifiedSkills.length >= 2 ? "Moderate" : "Weak",
      roadmapProgress: examResult?.passed ? 75 : 40,
      placementStatus: existingIndex >= 0 ? this.students[existingIndex].placementStatus : "Not Applied",
      verifiedSkills,
      evidenceGaps,
      skillGaps,
      reasonsNotReady,
      analyzedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.students[existingIndex] = record;
    } else {
      this.students.unshift(record);
    }

    this.saveStorage();
    return record;
  }

  /**
   * Get filtered student records
   */
  public getStudents(filters: BatchFilters = {}): StudentBatchRecord[] {
    return this.students.filter((student) => {
      if (filters.institution && filters.institution !== "All" && student.institution !== filters.institution) {
        return false;
      }
      if (filters.department && filters.department !== "All" && student.department !== filters.department) {
        return false;
      }
      if (filters.batchYear && filters.batchYear !== "All" && student.batchYear !== filters.batchYear) {
        return false;
      }
      if (filters.targetRole && filters.targetRole !== "All" && student.targetRole !== filters.targetRole) {
        return false;
      }
      if (filters.readinessStatus && filters.readinessStatus !== "All" && student.readinessStatus !== filters.readinessStatus) {
        return false;
      }
      if (filters.searchQuery && filters.searchQuery.trim() !== "") {
        const q = filters.searchQuery.toLowerCase();
        const matchesName = student.name.toLowerCase().includes(q);
        const matchesRole = student.targetRole.toLowerCase().includes(q);
        const matchesDept = student.department.toLowerCase().includes(q);
        const matchesGap = student.topGap.toLowerCase().includes(q);
        if (!matchesName && !matchesRole && !matchesDept && !matchesGap) return false;
      }
      return true;
    });
  }

  /**
   * Get Batch Analytics summary and dynamic aggregate statistics
   */
  public getBatchAnalytics(filters: BatchFilters = {}): BatchAnalytics {
    const records = this.getStudents(filters);
    const totalStudents = records.length;

    if (totalStudents === 0) {
      return {
        institution: filters.institution || "RMK Engineering College",
        departmentFilter: filters.department || "All",
        batchFilter: filters.batchYear || "All",
        totalStudents: 0,
        analyzedStudentsCount: 0,
        readyStudentsCount: 0,
        needsSupportCount: 0,
        criticalGapCount: 0,
        averageReadiness: 0,
        averageRoadmapProgress: 0,
        readinessDistribution: [],
        topSkillGaps: [],
        mostVerifiedSkills: [],
        roleAnalytics: [],
        departmentAnalytics: [],
        trainingPriorities: [],
        industryVsStudentGap: [],
        hasPlacementData: false,
      };
    }

    const readyStudentsCount = records.filter((s) => s.readinessStatus === "READY").length;
    const needsSupportCount = records.filter((s) => s.readinessStatus === "HIGH SUPPORT NEEDED" || s.readinessStatus === "DEVELOPING").length;
    const criticalGapCount = records.filter((s) => s.readinessStatus === "HIGH SUPPORT NEEDED" || s.reasonsNotReady.length >= 2).length;

    const totalReadinessSum = records.reduce((acc, curr) => acc + curr.readinessScore, 0);
    const averageReadiness = Math.round(totalReadinessSum / totalStudents);

    const totalRoadmapSum = records.reduce((acc, curr) => acc + curr.roadmapProgress, 0);
    const averageRoadmapProgress = Math.round(totalRoadmapSum / totalStudents);

    // Readiness distribution
    const categories: ReadinessStatusCategory[] = ["READY", "NEAR READY", "DEVELOPING", "HIGH SUPPORT NEEDED"];
    const readinessDistribution = categories.map((cat) => {
      const count = records.filter((s) => s.readinessStatus === cat).length;
      return {
        category: cat,
        count,
        percentage: Math.round((count / totalStudents) * 100),
      };
    });

    // Top Skill Gaps aggregation
    const gapMap: Record<string, { count: number; type: "Skill Gap" | "Evidence Gap" }> = {};
    records.forEach((s) => {
      s.skillGaps.forEach((sg) => {
        if (!gapMap[sg]) gapMap[sg] = { count: 0, type: "Skill Gap" };
        gapMap[sg].count += 1;
      });
      s.evidenceGaps.forEach((eg) => {
        if (!gapMap[eg]) gapMap[eg] = { count: 0, type: "Evidence Gap" };
        gapMap[eg].count += 1;
      });
    });

    const topSkillGaps = Object.entries(gapMap)
      .map(([skill, val]) => ({
        skill,
        affectedStudents: val.count,
        percentage: Math.round((val.count / totalStudents) * 100),
        gapType: val.type,
      }))
      .sort((a, b) => b.affectedStudents - a.affectedStudents)
      .slice(0, 6);

    // Most verified skills aggregation
    const verifiedMap: Record<string, number> = {};
    records.forEach((s) => {
      s.verifiedSkills.forEach((vs) => {
        verifiedMap[vs] = (verifiedMap[vs] || 0) + 1;
      });
    });

    const mostVerifiedSkills = Object.entries(verifiedMap)
      .map(([skill, count]) => ({
        skill,
        count,
        percentage: Math.round((count / totalStudents) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Role analytics aggregation
    const roleMap: Record<string, { count: number; scoreSum: number }> = {};
    records.forEach((s) => {
      if (!roleMap[s.targetRole]) roleMap[s.targetRole] = { count: 0, scoreSum: 0 };
      roleMap[s.targetRole].count += 1;
      roleMap[s.targetRole].scoreSum += s.readinessScore;
    });

    const roleAnalytics = Object.entries(roleMap).map(([role, val]) => ({
      role,
      count: val.count,
      avgReadiness: Math.round(val.scoreSum / val.count),
    }));

    // Department analytics aggregation
    const deptMap: Record<string, { count: number; scoreSum: number }> = {};
    records.forEach((s) => {
      if (!deptMap[s.department]) deptMap[s.department] = { count: 0, scoreSum: 0 };
      deptMap[s.department].count += 1;
      deptMap[s.department].scoreSum += s.readinessScore;
    });

    const departmentAnalytics = Object.entries(deptMap).map(([department, val]) => ({
      department,
      count: val.count,
      avgReadiness: Math.round(val.scoreSum / val.count),
    }));

    // Training Priorities
    const trainingPriorities = topSkillGaps.slice(0, 4).map((g) => ({
      skill: g.skill,
      affectedStudents: g.affectedStudents,
      priority: g.percentage >= 40 ? ("HIGH" as const) : ("MEDIUM" as const),
      recommendedAction: `Organize institutional ${g.skill} practical bootcamp for ${g.affectedStudents} students`,
    }));

    // Industry demand vs student gap comparison
    const industrySkills = [
      { skill: "Docker & Containerization", demandPct: 78 },
      { skill: "System Design", demandPct: 82 },
      { skill: "AWS / Cloud Deployment", demandPct: 75 },
      { skill: "SQL & Databases", demandPct: 90 },
      { skill: "Data Structures & Algorithms", demandPct: 95 },
    ];

    const industryVsStudentGap = industrySkills.map((item) => {
      const studentCount = records.filter((s) =>
        s.verifiedSkills.some((vs) => vs.toLowerCase().includes(item.skill.split(" ")[0].toLowerCase()))
      ).length;
      const studentVerifiedPct = Math.round((studentCount / totalStudents) * 100);
      return {
        skill: item.skill,
        industryDemandPct: item.demandPct,
        studentVerifiedPct,
        gapPct: Math.max(item.demandPct - studentVerifiedPct, 0),
      };
    });

    return {
      institution: filters.institution || "RMK Engineering College",
      departmentFilter: filters.department || "All",
      batchFilter: filters.batchYear || "All",
      totalStudents,
      analyzedStudentsCount: totalStudents,
      readyStudentsCount,
      needsSupportCount,
      criticalGapCount,
      averageReadiness,
      averageRoadmapProgress,
      readinessDistribution,
      topSkillGaps,
      mostVerifiedSkills,
      roleAnalytics,
      departmentAnalytics,
      trainingPriorities,
      industryVsStudentGap,
      hasPlacementData: true,
      placementRate: Math.round(
        (records.filter((s) => s.placementStatus === "Placed" || s.placementStatus === "Offer Received").length /
          totalStudents) *
          100
      ),
    };
  }

  /**
   * Export batch data as CSV string
   */
  public exportBatchCSV(filters: BatchFilters = {}): string {
    const records = this.getStudents(filters);
    const headers = [
      "Student ID",
      "Name",
      "Institution",
      "Department",
      "Batch Year",
      "Target Role",
      "Readiness Score (%)",
      "Readiness Status",
      "Top Gap",
      "Evidence Status",
      "Roadmap Progress (%)",
      "Placement Status",
      "Verified Skills",
    ];

    const rows = records.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.institution}"`,
      `"${s.department}"`,
      s.batchYear,
      `"${s.targetRole}"`,
      s.readinessScore,
      s.readinessStatus,
      `"${s.topGap}"`,
      s.evidenceStatus,
      s.roadmapProgress,
      s.placementStatus,
      `"${s.verifiedSkills.join("; ")}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  public getAvailableInstitutions(): string[] {
    const set = new Set(this.students.map((s) => s.institution));
    return ["All", ...Array.from(set)];
  }

  public getAvailableDepartments(): string[] {
    const set = new Set(this.students.map((s) => s.department));
    return ["All", ...Array.from(set)];
  }

  public getAvailableBatches(): string[] {
    const set = new Set(this.students.map((s) => s.batchYear));
    return ["All", ...Array.from(set)];
  }

  public getAvailableRoles(): string[] {
    const set = new Set(this.students.map((s) => s.targetRole));
    return ["All", ...Array.from(set)];
  }
}

export const dashboardService = new DashboardService();
