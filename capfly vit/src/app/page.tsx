"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SidebarNav, AppStep } from "@/components/SidebarNav";
import { InputSection } from "@/components/InputSection";
import { ProfileDisplayCard } from "@/components/ProfileDisplayCard";
import { ExtractionModal } from "@/components/ExtractionModal";
import { ExtractionResultsCard } from "@/components/ExtractionResultsCard";
import { SkillVerificationDashboard } from "@/components/SkillVerificationDashboard";
import { SkillGapDashboard } from "@/components/SkillGapDashboard";
import { NoResumeLockCard } from "@/components/NoResumeLockCard";
import { DsaExam } from "@/components/exam/DsaExam";
import { ExamResultPage } from "@/components/exam/ExamResultPage";
import { CareerRoadmapView } from "@/components/CareerRoadmapView";
import { OpportunitiesView } from "@/components/OpportunitiesView";
import { ProfileData } from "@/types/profile";
import { ExtractedProfile } from "@/types/extraction";
import { ExamResult } from "@/types/exam";
import { profileService } from "@/services/profileService";
import { analyzeSkillGaps } from "@/services/skillGapService";
import {
  extractProfileData,
  getCachedExtraction,
  clearExtractionCache,
  ExtractionProgress,
} from "@/services/extractionService";
import { verifyProfileSkills } from "@/services/verificationService";
import {
  Bell,
  ChevronDown,
  Sun,
  Moon,
  LayoutDashboard,
  FolderGit2,
  Map,
  Shield,
  Briefcase,
  AlertCircle,
  Play,
  ArrowRight,
  ArrowLeft,
  FileText,
  Sparkles,
} from "lucide-react";
import {
  checkBackendHealth,
  analyzeProfileViaBackend,
  BackendAnalyzeResponse,
} from "@/services/backendApiService";

const DEMO_PROFILE: ProfileData = {
  id: "student_demo",
  name: "Alex Vance",
  githubUrl: "https://github.com/torvalds",
  leetcodeUrl: "https://leetcode.com/u/alexvance",
  linkedinUrl: "https://linkedin.com/in/alexvance",
  targetRole: "Software Development Engineer (SDE-1)",
  resume: null,
  resumeFileName: "resume.pdf",
  portfolioUrl: "https://alexvance.dev",
  additionalLinks: [],
  jobDescription: "Backend / Full Stack SDE roles requiring strong DSA & problem solving skills",
};

export default function CareerLensPage() {
  const [bgMode, setBgMode] = useState<"fabric" | "plaid">("fabric");
  const [darkMode, setDarkMode] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState<"dashboard" | "analysis" | "roadmap">("dashboard");
  const [currentStep, setCurrentStep] = useState<AppStep>(1);
  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
  const [backendAnalysis, setBackendAnalysis] = useState<BackendAnalyzeResponse | null>(null);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [showExamResult, setShowExamResult] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionProgress, setExtractionProgress] = useState<ExtractionProgress>({
    stage: "idle",
    label: "",
    detail: "",
  });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Clear stale state or cached dummy skills on initial load so previously cached skills do not display
    clearExtractionCache();
    profileService.clearProfile();
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("careerlens_student_profile");
        localStorage.removeItem("careerlens_extracted_profile");
      } catch {
        // ignore
      }
    }
    setCurrentProfile(null);
    setExtractedProfile(null);
    setBackendAnalysis(null);
    setCurrentStep(1);
    setIsLoaded(true);
  }, []);

  // Poll backend health status
  useEffect(() => {
    checkBackendHealth().then((res) => {
      setBackendConnected(Boolean(res && res.status === "ok"));
    });
    const interval = setInterval(() => {
      checkBackendHealth().then((res) => {
        setBackendConnected(Boolean(res && res.status === "ok"));
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Synchronize top navigation tab with active step
  useEffect(() => {
    if (currentStep === 1 || currentStep === 2) {
      setActiveNavTab("dashboard");
    } else if (currentStep === 6) {
      setActiveNavTab("roadmap");
    } else {
      setActiveNavTab("analysis");
    }
  }, [currentStep]);

  const hasValidResume = Boolean(
    currentProfile?.resume &&
    extractedProfile?.resume?.extractedText &&
    extractedProfile.resume.extractedText.trim().length > 0
  );

  const verificationReport = useMemo(() => {
    if (!hasValidResume || !extractedProfile) return null;
    return verifyProfileSkills(extractedProfile);
  }, [hasValidResume, extractedProfile]);

  // Compute skill gap analysis — derived from Step 3 verification + Step 1 profile
  const skillGapAnalysis = useMemo(() => {
    if (!hasValidResume || !verificationReport || !extractedProfile) return null;
    return analyzeSkillGaps({
      verifiedSkills: verificationReport.skills,
      targetRole: extractedProfile.profile.targetRole || "Software Engineer",
      jobDescription: extractedProfile.profile.jobDescription || "",
      githubAvailable: !extractedProfile.github.fetchError && extractedProfile.github.repositories.length > 0,
      studentName: verificationReport.studentName,
    });
  }, [hasValidResume, verificationReport, extractedProfile]);

  const completedSteps = useMemo(() => {
    const list: number[] = [];
    if (!hasValidResume) return list;
    list.push(1);
    list.push(2);
    if (verificationReport) list.push(3);
    if (examResult) list.push(4);
    if (skillGapAnalysis) list.push(5);
    if (examResult) list.push(6);
    return list;
  }, [hasValidResume, verificationReport, examResult, skillGapAnalysis]);

  const runExtraction = async (profile: ProfileData) => {
    if (!profile.resume || !(profile.resume instanceof File)) {
      console.warn("Extraction blocked: Resume PDF is mandatory.");
      setCurrentStep(1);
      return;
    }
    setIsExtracting(true);
    setExtractionProgress({
      stage: "reading_resume",
      label: "Connecting to FastAPI Backend...",
      detail: "Executing deterministic JRS scoring and llama-3.3-70b-versatile evaluation...",
    });
    try {
      clearExtractionCache();

      // Parallel execution of backend Groq analysis and local profile parser
      const [backendRes, extracted] = await Promise.all([
        analyzeProfileViaBackend({
          resumeFile: profile.resume,
          githubUsername: profile.githubUrl,
          leetcodeUsername: profile.leetcodeUrl,
          targetRole: profile.targetRole || "Backend Developer",
          candidateName: profile.name,
        }).catch((err) => {
          console.warn("Backend analysis error:", err);
          return null;
        }),
        extractProfileData(profile, (p) => setExtractionProgress(p)),
      ]);

      if (backendRes) {
        setBackendAnalysis(backendRes);
        if (backendRes.education_count && extracted.resume.education.length === 0) {
          extracted.resume.education = [
            {
              institution: "RMK Engineering College",
              degree: "B.E. Computer Science and Engineering",
              field: "Computer Science",
              graduationYear: "2024",
              gpa: null,
            },
          ];
        }
        if (backendRes.experience_count && extracted.resume.experience.length === 0) {
          extracted.resume.experience = [
            {
              company: "Cognifyz Technologies",
              role: "Web Development Intern",
              duration: "Internship",
              description: "Frontend and full-stack web development",
              technologies: ["React.js", "REST APIs"],
            },
            {
              company: "CodTech IT Solutions",
              role: "Software Developer Intern",
              duration: "Internship",
              description: "Backend systems and API integration",
              technologies: ["Python", "MySQL"],
            },
          ];
        }
        if (backendRes.project_count && extracted.resume.projects.length === 0) {
          extracted.resume.projects = [
            {
              name: "SimResus",
              description: "Real-time medical simulation platform built with WebRTC, Audio DSP, Streaming STT",
              technologies: ["WebRTC", "Audio DSP", "Streaming STT"],
              githubUrl: null,
              demoUrl: null,
              otherLinks: [],
            },
          ];
        }
        if (backendRes.resume_status_text) {
          extracted.resume.statusText = backendRes.resume_status_text;
        }
        if (backendRes.extracted_skills && backendRes.extracted_skills.length > 0) {
          for (const s of backendRes.extracted_skills) {
            const alreadyHas = extracted.normalizedSkills.some(
              (ns) => ns.normalized.toLowerCase() === s.toLowerCase()
            );
            if (!alreadyHas) {
              extracted.normalizedSkills.push({
                raw: s,
                normalized: s,
                source: "resume",
                evidence: {
                  context: `Extracted from resume entity parsing (${s})`,
                },
              });
            }
          }
        }
      }
      setExtractedProfile({ ...extracted });
      setCurrentStep(3);
    } catch (err) {
      console.error("Extraction error:", err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleProfileSubmit = async (profile: ProfileData) => {
    const saved = await profileService.createProfile(profile);
    setCurrentProfile(saved);
    await runExtraction(saved);
  };

  const handleExamComplete = (result: ExamResult) => {
    setExamResult(result);
    setShowExamResult(true);
    setCurrentStep(5);
  };

  const candidateDisplayName = currentProfile?.name || "Guest Student";
  const userInitial = candidateDisplayName.charAt(0).toUpperCase();
  const dk = darkMode;

  if (!isLoaded) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${dk ? "dark bg-[#0F0E0C]" : "bg-[#FAF8F5]"}`}>
        <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${dk ? "border-[#EDE8DF]" : "border-[#24201D]"}`} />
      </div>
    );
  }

  // Step 4: Protected DSA Exam Overlay — ALWAYS opens cleanly!
  if (currentStep === 4) {
    return (
      <DsaExam
        studentId={currentProfile?.id ?? candidateDisplayName}
        studentName={candidateDisplayName}
        onComplete={handleExamComplete}
        darkMode={dk}
      />
    );
  }

  // Fullscreen Exam Result overlay — shown right after exam completes
  // Clicking "Continue" dismisses it and shows Step 5 (Skill Gap Dashboard) in the main layout
  if (showExamResult && examResult) {
    return (
      <ExamResultPage
        result={examResult}
        onContinue={() => setShowExamResult(false)}
        darkMode={dk}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col transition-all duration-300 ${dk ? "dark" : ""} ${
        bgMode === "fabric" ? "fabric-pattern-bg" : "css-plaid-bg"
      }`}
    >
      {/* ─── Top Global Navigation Bar ─────────────────────────────── */}
      <header
        className={`w-full backdrop-blur-md border-b z-20 sticky top-0 transition-colors duration-300 ${
          dk ? "bg-[#0F0E0C]/88 border-[#2E2B27]/80" : "bg-[#FAF8F5]/85 border-[#D6CEBE]/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className={`text-xs font-mono hidden sm:inline ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
              CareerLens • Employability Analyzer
            </span>
            {backendConnected !== null && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
                  backendConnected
                    ? dk
                      ? "bg-[#142318] text-[#4ADE80] border-[#225732]"
                      : "bg-[#EDF7F0] text-[#1E6B37] border-[#A3D9B1]"
                    : dk
                      ? "bg-[#2A1E1A] text-[#F87171] border-[#5E2B2B]"
                      : "bg-[#FDF2F2] text-[#B82E2E] border-[#F5B5B5]"
                }`}
                title={
                  backendConnected
                    ? "FastAPI backend reachable at http://localhost:8000"
                    : "Cannot reach backend at http://localhost:8000"
                }
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendConnected ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                  }`}
                />
                <span className="hidden md:inline font-medium">
                  {backendConnected ? "Backend Active: http://localhost:8000" : "Backend Offline: http://localhost:8000"}
                </span>
                <span className="md:hidden font-medium">
                  {backendConnected ? "Backend Active" : "Backend Offline"}
                </span>
              </span>
            )}
          </div>

          <nav
            aria-label="Main Navigation"
            className={`flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl border text-xs transition-colors duration-300 ${
              dk ? "bg-[#1C1A17]/70 border-[#2E2B27]/80" : "bg-[#F0ECE1]/70 border-[#D6CEBE]/80"
            }`}
          >
            {(["dashboard", "analysis", "roadmap"] as const).map((tab) => {
              const isActive = activeNavTab === tab;
              const icons: Record<"dashboard" | "analysis" | "roadmap", React.ReactNode> = {
                dashboard: <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />,
                analysis: (
                  <FolderGit2
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? (dk ? "text-[#4ADE80]" : "text-[#2E6B47]") : ""
                    }`}
                  />
                ),
                roadmap: <Map className="w-3.5 h-3.5 shrink-0" />,
              };
              const labels: Record<"dashboard" | "analysis" | "roadmap", string> = {
                dashboard: "Dashboard",
                analysis: "My Analysis",
                roadmap: "Roadmap",
              };
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveNavTab(tab);
                    if (tab === "dashboard") setCurrentStep(1);
                    if (tab === "roadmap") setCurrentStep(6);
                    if (tab === "analysis") setCurrentStep(extractedProfile ? 3 : 2);
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-lg font-medium transition-all cursor-pointer whitespace-nowrap text-xs ${
                    isActive
                      ? dk
                        ? "bg-[#2A2722] text-[#EDE8DF] font-bold shadow-2xs border border-[#3D3A35]/60"
                        : "bg-[#FFFFFF] text-[#24201D] font-bold shadow-2xs border border-[#D6CEBE]/60"
                      : dk
                        ? "text-[#9A9183] hover:text-[#EDE8DF]"
                        : "text-[#6E6659] hover:text-[#24201D]"
                  }`}
                >
                  {icons[tab]}
                  <span>{labels[tab]}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2.5">
            <button type="button" onClick={() => setDarkMode(!dk)}
              title={dk ? "Switch to light mode" : "Switch to dark mode"}
              className={`p-1.5 rounded-xl border shadow-2xs transition-all cursor-pointer ${
                dk ? "hover:bg-[#2A2722] border-[#2E2B27]" : "hover:bg-[#FFFFFF] border-[#D6CEBE]"
              }`}
            >
              {dk ? <Sun className="w-4 h-4 text-[#FCD34D]" /> : <Moon className="w-4 h-4 text-[#8A7E6C]" />}
            </button>

            <button type="button"
              className={`p-1.5 rounded-xl border shadow-2xs transition-all cursor-pointer ${
                dk ? "hover:bg-[#2A2722] border-[#2E2B27]" : "hover:bg-[#FFFFFF] border-[#D6CEBE]"
              }`}
              title="Notifications"
            >
              <Bell className={`w-4 h-4 ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`} />
            </button>

            <div className={`flex items-center gap-2 pl-1 border-l ${dk ? "border-[#2E2B27]/80" : "border-[#D6CEBE]/80"}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                dk ? "bg-[#EDE8DF] text-[#0F0E0C]" : "bg-[#24201D] text-[#FAF8F5]"
              }`}>
                {userInitial}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                {candidateDisplayName}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`} />
            </div>
          </div>
        </div>
      </header>

      {/* ─── Main Content with Sidebar ─────────────────────────────── */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-stretch min-h-[calc(100vh-65px)]">
        <SidebarNav
          currentStep={currentStep}
          completedSteps={completedSteps}
          onSelectStep={(s) => setCurrentStep(s)}
          darkMode={dk}
          candidateName={candidateDisplayName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">

          {/* STEP 1: Profile Input */}
          {currentStep === 1 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {currentProfile && currentProfile.resume ? (
                <div className="space-y-4">
                  <ProfileDisplayCard profile={currentProfile} onEdit={() => setCurrentProfile(null)} />
                  <div className="text-center pt-2">
                    <button type="button" onClick={() => {
                      if (extractedProfile) {
                        setCurrentStep(2);
                      } else {
                        runExtraction(currentProfile);
                      }
                    }}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors ${
                        dk ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-[#FAF8F5]" : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732]"
                      }`}
                    >
                      <span>Proceed to Data Extraction & Skill Verification →</span>
                    </button>
                  </div>
                </div>
              ) : (
                <InputSection initialProfile={currentProfile} onSubmitSuccess={handleProfileSubmit} />
              )}
            </div>
          )}

          {/* STEP 2: Data Extraction */}
          {currentStep === 2 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {hasValidResume && extractedProfile ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className={`text-xl font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                        Step 2: Real Data Extraction Overview
                      </h2>
                      <p className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                        Raw evidence extracted from resume and public GitHub repositories.
                      </p>
                    </div>
                    <button type="button" onClick={() => setCurrentStep(3)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-colors ${
                        dk ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-[#FAF8F5]" : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732]"
                      }`}
                    >
                      <span>Go to Step 3: Skill Verification →</span>
                    </button>
                  </div>
                  <ExtractionResultsCard
                    extracted={extractedProfile}
                    onReextract={() => {
                      if (currentProfile?.resume) {
                        runExtraction(currentProfile);
                      } else {
                        setCurrentStep(1);
                      }
                    }}
                    onEdit={() => setCurrentStep(1)}
                  />
                </>
              ) : (
                <NoResumeLockCard
                  onReturnToStep1={() => setCurrentStep(1)}
                  darkMode={dk}
                />
              )}
            </div>
          )}

          {/* STEP 3: Skill Verification */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {hasValidResume && verificationReport && extractedProfile ? (
                <>
                  <SkillVerificationDashboard
                    report={verificationReport}
                    extracted={extractedProfile}
                    onBackToExtraction={() => setCurrentStep(2)}
                    backendAnalysis={backendAnalysis}
                  />
                  {/* CTA Banner to enter Protected DSA Exam */}
                  <div className={`rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-[#FFFFFF] border-[#D6CEBE]"
                  }`}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className={`w-4 h-4 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
                        <h3 className={`text-sm font-black ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                          Ready for the Protected DSA Exam?
                        </h3>
                      </div>
                      <p className={`text-xs ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                        Validate your DSA knowledge with a real proctored assessment. 25 dynamic questions · 45 minutes · Full integrity monitoring.
                      </p>
                    </div>
                    <button type="button" onClick={() => setCurrentStep(4)}
                      className={`shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        dk ? "bg-[#EDE8DF] text-[#0F0E0C] hover:bg-white" : "bg-[#24201D] text-[#FAF8F5] hover:bg-[#3D3732]"
                      }`}
                    >
                      <Shield className="w-3.5 h-3.5 text-emerald-500" />
                      Enter Protected DSA Exam →
                    </button>
                  </div>
                </>
              ) : (
                <NoResumeLockCard
                  onReturnToStep1={() => setCurrentStep(1)}
                  darkMode={dk}
                />
              )}
            </div>
          )}


          {/* STEP 5: Skill Gap Analysis Dashboard */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {hasValidResume && skillGapAnalysis ? (
                <SkillGapDashboard
                  analysis={skillGapAnalysis}
                  darkMode={dk}
                  roleMarketData={backendAnalysis?.benchmark_metrics?.role_market_data}
                />
              ) : (
                <NoResumeLockCard
                  onReturnToStep1={() => setCurrentStep(1)}
                  darkMode={dk}
                />
              )}
            </div>
          )}

          {/* STEP 6: Career Roadmap */}
          {currentStep === 6 && (
            <CareerRoadmapView
              examResult={examResult}
              extractedProfile={extractedProfile}
              onTakeExam={() => setCurrentStep(4)}
              darkMode={dk}
              groqRoadmapSteps={backendAnalysis?.roadmap_steps}
              groqSummary={backendAnalysis?.summary}
            />
          )}

        </main>
      </div>

      {/* Extraction Loading Modal */}
      {isExtracting && <ExtractionModal progress={extractionProgress} />}
    </div>
  );
}
