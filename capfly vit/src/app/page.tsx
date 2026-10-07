"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SidebarNav, AppStep } from "@/components/SidebarNav";
import { InputSection } from "@/components/InputSection";
import { ProfileDisplayCard } from "@/components/ProfileDisplayCard";
import { ExtractionModal } from "@/components/ExtractionModal";
import { ExtractionResultsCard } from "@/components/ExtractionResultsCard";
import { SkillVerificationDashboard } from "@/components/SkillVerificationDashboard";
import { SkillGapDashboard } from "@/components/SkillGapDashboard";
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
  TrendingUp,
  BookOpen,
  Shield,
  Briefcase,
  AlertCircle,
  Play,
  ArrowRight,
} from "lucide-react";

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
  const [activeNavTab, setActiveNavTab] = useState<
    "dashboard" | "analysis" | "roadmap" | "progress" | "resources"
  >("analysis");
  const [currentStep, setCurrentStep] = useState<AppStep>(1);
  const [currentProfile, setCurrentProfile] = useState<ProfileData | null>(null);
  const [extractedProfile, setExtractedProfile] = useState<ExtractedProfile | null>(null);
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
    const stored = profileService.getProfile();
    if (stored) {
      setCurrentProfile(stored);
      const cachedExtraction = getCachedExtraction();
      if (cachedExtraction) {
        setExtractedProfile(cachedExtraction);
        setCurrentStep(3);
      } else {
        setCurrentStep(1);
      }
    } else {
      const cachedExtraction = getCachedExtraction();
      if (cachedExtraction) {
        setExtractedProfile(cachedExtraction);
        setCurrentStep(3);
      }
    }
    setIsLoaded(true);
  }, []);

  const verificationReport = useMemo(() => {
    if (!extractedProfile) return null;
    return verifyProfileSkills(extractedProfile);
  }, [extractedProfile]);

  // Compute skill gap analysis — derived from Step 3 verification + Step 1 profile
  const skillGapAnalysis = useMemo(() => {
    if (!verificationReport || !extractedProfile) return null;
    return analyzeSkillGaps({
      verifiedSkills: verificationReport.skills,
      targetRole: extractedProfile.profile.targetRole || "Software Engineer",
      jobDescription: extractedProfile.profile.jobDescription || "",
      githubAvailable: !extractedProfile.github.fetchError && extractedProfile.github.repositories.length > 0,
      studentName: verificationReport.studentName,
    });
  }, [verificationReport, extractedProfile]);

  const completedSteps = useMemo(() => {
    const list: number[] = [];
    if (currentProfile) list.push(1);
    if (extractedProfile) list.push(2);
    if (verificationReport) list.push(3);
    if (examResult) list.push(4);
    if (skillGapAnalysis) list.push(5);
    if (examResult) { list.push(6); list.push(7); }
    return list;
  }, [currentProfile, extractedProfile, verificationReport, examResult, skillGapAnalysis]);

  const runExtraction = async (profile: ProfileData) => {
    setIsExtracting(true);
    setExtractionProgress({ stage: "reading_resume", label: "Reading Your Resume", detail: "Extracting text from profile data..." });
    try {
      clearExtractionCache();
      const extracted = await extractProfileData(profile, (p) => setExtractionProgress(p));
      setExtractedProfile(extracted);
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

  const activeStudentProfile = currentProfile || DEMO_PROFILE;
  const candidateDisplayName = activeStudentProfile.name;
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
        studentId={activeStudentProfile.id ?? activeStudentProfile.name}
        studentName={activeStudentProfile.name}
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
          <div className="flex items-center gap-3">
            <span className={`text-xs font-mono hidden sm:inline ${dk ? "text-[#5C5751]" : "text-[#8A7E6C]"}`}>
              CareerLens • Employability Analyzer
            </span>
          </div>

          <nav className={`flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl border text-xs transition-colors duration-300 ${
            dk ? "bg-[#1C1A17]/70 border-[#2E2B27]/80" : "bg-[#F0ECE1]/70 border-[#D6CEBE]/80"
          }`}>
            {(["dashboard", "analysis", "roadmap", "progress", "resources"] as const).map((tab) => {
              const isActive = activeNavTab === tab;
              const icons: Record<string, React.ReactNode> = {
                dashboard: <LayoutDashboard className="w-3.5 h-3.5" />,
                analysis: <FolderGit2 className={`w-3.5 h-3.5 ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />,
                roadmap: <Map className="w-3.5 h-3.5" />,
                progress: <TrendingUp className="w-3.5 h-3.5" />,
                resources: <BookOpen className="w-3.5 h-3.5" />,
              };
              const labels: Record<string, string> = {
                dashboard: "Dashboard", analysis: "My Analysis", roadmap: "Roadmap",
                progress: "Progress", resources: "Resources",
              };
              return (
                <button key={tab} type="button" onClick={() => {
                  setActiveNavTab(tab);
                  if (tab === "dashboard") setCurrentStep(1);
                  if (tab === "roadmap") setCurrentStep(6);
                  if (tab === "analysis") setCurrentStep(3);
                }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    isActive
                      ? dk ? "bg-[#2A2722] text-[#EDE8DF] font-bold shadow-2xs border border-[#3D3A35]/60"
                           : "bg-[#FFFFFF] text-[#24201D] font-bold shadow-2xs border border-[#D6CEBE]/60"
                      : dk ? "text-[#9A9183] hover:text-[#EDE8DF]"
                           : "text-[#6E6659] hover:text-[#24201D]"
                  }`}
                >
                  {icons[tab]}
                  <span className={tab === "analysis" ? "" : "hidden md:inline"}>{labels[tab]}</span>
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
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
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
              {currentProfile ? (
                <div className="space-y-4">
                  <ProfileDisplayCard profile={currentProfile} onEdit={() => setCurrentProfile(null)} />
                  <div className="text-center pt-2">
                    <button type="button" onClick={() => {
                      if (extractedProfile) {
                        setCurrentStep(3);
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
              {extractedProfile ? (
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
                    onReextract={() => runExtraction(activeStudentProfile)}
                    onEdit={() => setCurrentStep(1)}
                  />
                </>
              ) : (
                <div className={`p-8 rounded-2xl border text-center space-y-4 ${
                  dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
                }`}>
                  <AlertCircle className={`w-10 h-10 mx-auto ${dk ? "text-[#FCD34D]" : "text-[#B45309]"}`} />
                  <h3 className={`text-lg font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                    No Data Extracted Yet
                  </h3>
                  <p className={`text-xs max-w-md mx-auto ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                    Submit your profile details in Step 1 or run extraction on demo data to see GitHub repositories and skills analysis.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button type="button" onClick={() => setCurrentStep(1)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border ${
                        dk ? "border-[#3D3A35] text-[#EDE8DF] hover:bg-[#2A2722]" : "border-[#D6CEBE] text-[#24201D] hover:bg-[#FAF8F5]"
                      }`}
                    >
                      Fill Step 1 Profile
                    </button>
                    <button type="button" onClick={() => runExtraction(activeStudentProfile)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer`}
                    >
                      Run Extraction on Demo Profile →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Skill Verification */}
          {currentStep === 3 && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {verificationReport && extractedProfile ? (
                <>
                  <SkillVerificationDashboard
                    report={verificationReport}
                    extracted={extractedProfile}
                    onBackToExtraction={() => setCurrentStep(2)}
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
                <div className={`p-8 rounded-2xl border text-center space-y-4 ${
                  dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
                }`}>
                  <AlertCircle className={`w-10 h-10 mx-auto ${dk ? "text-[#FCD34D]" : "text-[#B45309]"}`} />
                  <h3 className={`text-lg font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                    Skill Verification Requires Profile Data
                  </h3>
                  <p className={`text-xs max-w-md mx-auto ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                    Click below to generate skill verification report and proof-of-work evidence analysis.
                  </p>
                  <button type="button" onClick={() => runExtraction(activeStudentProfile)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer`}
                  >
                    Generate Verification Report Now →
                  </button>
                </div>
              )}
            </div>
          )}


          {/* STEP 5: Skill Gap Analysis Dashboard */}
          {currentStep === 5 && (
            <div className="max-w-4xl mx-auto space-y-6">
              {skillGapAnalysis ? (
                <SkillGapDashboard
                  analysis={skillGapAnalysis}
                  darkMode={dk}
                />
              ) : (
                <div className={`p-8 rounded-2xl border text-center space-y-4 ${
                  dk ? "bg-[#1C1A17] border-[#2E2B27]" : "bg-white border-[#D6CEBE]"
                }`}>
                  <Shield className={`w-12 h-12 mx-auto ${dk ? "text-[#4ADE80]" : "text-[#2E6B47]"}`} />
                  <h3 className={`text-xl font-bold ${dk ? "text-[#EDE8DF]" : "text-[#24201D]"}`}>
                    Skill Gap Analysis Requires Profile Verification
                  </h3>
                  <p className={`text-xs max-w-md mx-auto ${dk ? "text-[#9A9183]" : "text-[#6E6659]"}`}>
                    Complete Step 1 (Profile) and allow data extraction and skill verification to generate your personalized skill gap report.
                  </p>
                  <button type="button" onClick={() => runExtraction(activeStudentProfile)}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                  >
                    Generate My Skill Gap Analysis →
                  </button>
                </div>
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
            />
          )}

        </main>
      </div>

      {/* Extraction Loading Modal */}
      {isExtracting && <ExtractionModal progress={extractionProgress} />}
    </div>
  );
}
