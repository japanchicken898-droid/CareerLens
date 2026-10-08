"use client";

import React, { useRef, useState } from "react";
import { TARGET_ROLES, ProfileData, FormErrors } from "@/types/profile";
import {
  formatFileSize,
  isValidGithubUrl,
  isValidLeetcodeUrl,
  normalizeUrl,
  validateProfileInput,
} from "@/utils/validation";
import { extractCandidateNameFromPdf, extractResumeMetadataFromPdf } from "@/utils/pdfNameExtractor";
import { extractNameViaBackend, checkBackendHealth } from "@/services/backendApiService";
import { GithubIcon, LeetcodeIcon, LinkedinIcon } from "@/components/Icons";
import {
  UploadCloud,
  FileCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileText,
  User,
  Loader2,
  Sparkles,
  Globe,
} from "lucide-react";

interface InputSectionProps {
  initialProfile?: ProfileData | null;
  onSubmitSuccess: (profile: ProfileData) => void;
  isLoading?: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  initialProfile,
  onSubmitSuccess,
  isLoading = false,
}) => {
  // Form State
  const [candidateName, setCandidateName] = useState(initialProfile?.name || "");
  const [isExtractingName, setIsExtractingName] = useState(false);
  const [autoExtracted, setAutoExtracted] = useState(false);
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; groq: boolean } | null>(null);

  React.useEffect(() => {
    checkBackendHealth().then((res) => {
      if (res && res.status === "ok") {
        setBackendStatus({ online: true, groq: Boolean(res.groq_configured) });
      } else {
        setBackendStatus({ online: false, groq: false });
      }
    });
  }, []);

  const [resumeFile, setResumeFile] = useState<File | null>(initialProfile?.resume || null);
  const [resumeFileName, setResumeFileName] = useState(initialProfile?.resumeFileName || "");
  const [resumeFileSize, setResumeFileSize] = useState<number | undefined>(initialProfile?.resumeFileSize);

  const [githubUrl, setGithubUrl] = useState(initialProfile?.githubUrl || "");
  const [leetcodeUrl, setLeetcodeUrl] = useState(initialProfile?.leetcodeUrl || "");
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedinUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolioUrl || "");

  const [targetRole, setTargetRole] = useState(initialProfile?.targetRole || "Backend Developer");
  const [jobDescription, setJobDescription] = useState(initialProfile?.jobDescription || "");

  // Dragging & Validation state
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File Handling & Auto-Extraction
  const processSelectedFile = async (file: File) => {
    // Clear previous resume error
    setErrors((prev) => ({ ...prev, resume: undefined }));

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrors((prev) => ({
        ...prev,
        resume: "Invalid file type. Only PDF files (.pdf) are allowed.",
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        resume: `File size exceeds 10 MB limit (${formatFileSize(file.size)}).`,
      }));
      return;
    }

    setResumeFile(file);
    setResumeFileName(file.name);
    setResumeFileSize(file.size);

    // Auto-extract candidate name and online profiles from PDF page 1
    setIsExtractingName(true);
    try {
      // 1. Try FastAPI backend endpoint (pdfplumber)
      const backendResult = await extractNameViaBackend(file);
      let extractedName = backendResult?.name?.trim() || "";

      // 2. Client-side link and fallback extractor
      const pdfMeta = await extractResumeMetadataFromPdf(file);
      if (!extractedName && pdfMeta.name) {
        extractedName = pdfMeta.name.trim();
      }

      if (extractedName && extractedName.trim()) {
        setCandidateName(extractedName.trim());
        setAutoExtracted(true);
        setErrors((prev) => ({ ...prev, name: undefined }));
      }

      // Pre-fill links if user hasn't typed them yet
      if (pdfMeta.githubUrl) {
        setGithubUrl((prev) => prev.trim() ? prev : pdfMeta.githubUrl!);
      }
      if (pdfMeta.leetcodeUrl) {
        setLeetcodeUrl((prev) => prev.trim() ? prev : pdfMeta.leetcodeUrl!);
      }
      if (pdfMeta.linkedinUrl) {
        setLinkedinUrl((prev) => prev.trim() ? prev : pdfMeta.linkedinUrl!);
      }
      if (pdfMeta.portfolioUrl) {
        setPortfolioUrl((prev) => prev.trim() ? prev : pdfMeta.portfolioUrl!);
      }
    } catch (err) {
      console.warn("Could not auto-extract candidate details:", err);
    } finally {
      setIsExtractingName(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeFile(null);
    setResumeFileName("");
    setResumeFileSize(undefined);
    setAutoExtracted(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isSubmitting || isLoading) return; // Duplicate submission guard

    const formData = {
      name: candidateName,
      resumeFile,
      resumeFileName,
      githubUrl,
      leetcodeUrl,
      portfolioUrl,
      linkedinUrl,
      additionalLinks: [],
      targetRole,
      jobDescription,
    };

    if (!resumeFile) {
      setErrors((prev) => ({
        ...prev,
        resume: "Please upload your resume PDF to proceed.",
      }));
      return;
    }

    const validation = validateProfileInput(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const profileData: ProfileData = {
        name: candidateName.trim(),
        resume: resumeFile,
        resumeFileName: resumeFile ? resumeFile.name : resumeFileName,
        resumeFileSize: resumeFile ? resumeFile.size : resumeFileSize,
        githubUrl: normalizeUrl(githubUrl),
        leetcodeUrl: normalizeUrl(leetcodeUrl),
        portfolioUrl: portfolioUrl.trim() ? normalizeUrl(portfolioUrl) : "",
        linkedinUrl: linkedinUrl.trim() ? normalizeUrl(linkedinUrl) : "",
        additionalLinks: [],
        targetRole: targetRole.trim(),
        jobDescription: jobDescription.trim(),
      };

      await onSubmitSuccess(profileData);
    } catch {
      setErrors((prev) => ({
        ...prev,
        name: "An error occurred while saving profile. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-4xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#24201D]">
            Student Profile Input
          </h1>
          <p className="text-sm text-[#6E6659]">
            Upload your resume PDF and connect your GitHub and LeetCode proofs of work.
          </p>
        </div>

        {backendStatus?.online ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#E2EDE5] text-[#2E6B47] border border-[#A3CFBB]/70 self-start sm:self-center shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E6B47] animate-pulse" />
            <span className="font-semibold">Backend Active: http://localhost:8000</span>
            {backendStatus.groq ? (
              <span className="text-[10px] bg-[#2E6B47] text-[#FAF8F5] px-1.5 py-0.2 rounded-md font-sans font-bold">
                Groq LLM
              </span>
            ) : (
              <span className="text-[10px] bg-[#A2610A] text-[#FAF8F5] px-1.5 py-0.2 rounded-md font-sans font-bold">
                Deterministic
              </span>
            )}
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#FEF8ED] text-[#A2610A] border border-[#F2D79E] self-start sm:self-center">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>Connecting to Backend...</span>
          </div>
        )}
      </div>

      {/* Main Input Form Card */}
      <form
        onSubmit={handleSubmit}
        className="paper-card p-5 sm:p-7 bg-[#FFFFFF] border border-[#D6CEBE] rounded-2xl shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Column 1: Resume Upload (md:col-span-5) */}
          <div className="md:col-span-5 flex flex-col justify-between">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6659] mb-2 flex items-center justify-between">
                <span>1. RESUME PDF</span>
                <span className="text-[#991B1B]">*</span>
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={handleFileChange}
                id="resume-file-input"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer min-h-[220px] ${
                  errors.resume
                    ? "border-[#991B1B] bg-red-50/30"
                    : resumeFile || resumeFileName
                    ? "border-[#48694E] bg-[#F4F9F5]/70"
                    : isDragging
                    ? "border-[#24201D] bg-[#F0ECE1]"
                    : "border-[#D6CEBE] bg-[#FAF8F5] hover:border-[#8A7E6C] hover:bg-[#FAF8F5]/80"
                }`}
              >
                {resumeFile || resumeFileName ? (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#E2EDE5] text-[#2E6B47] flex items-center justify-center mx-auto">
                      <FileCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#24201D] truncate max-w-[220px]">
                        {resumeFile ? resumeFile.name : resumeFileName}
                      </p>
                      {(resumeFile?.size || resumeFileSize) && (
                        <p className="text-[11px] text-[#6E6659] font-mono mt-0.5">
                          {formatFileSize(resumeFile ? resumeFile.size : resumeFileSize!)}
                        </p>
                      )}
                      <span className="text-[11px] text-[#2E6B47] font-medium inline-flex items-center gap-1 mt-1">
                        <CheckCircle2 className="w-3 h-3" /> PDF Selected
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="text-xs text-[#8A7E6C] hover:text-[#991B1B] underline pt-1 block mx-auto cursor-pointer"
                    >
                      Remove or replace file
                    </button>
                  </div>
                ) : (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-[#EFECE6] text-[#6E6659] flex items-center justify-center mx-auto">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#24201D]">
                        Drop your PDF resume here
                      </p>
                      <p className="text-[11px] text-[#8A7E6C] mt-0.5">
                        or click to browse files
                      </p>
                    </div>
                    <span className="inline-block text-[10px] text-[#6E6659] font-mono bg-[#E8E2D7]/60 px-2 py-0.5 rounded border border-[#D6CEBE]">
                      PDF ONLY, max 10MB
                    </span>
                  </div>
                )}
              </div>

              {errors.resume && (
                <p className="text-xs text-[#991B1B] font-medium mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.resume}</span>
                </p>
              )}
            </div>

            <p className="text-[11px] text-[#8A7E6C] mt-3 italic">
              *Candidate name is auto-extracted immediately from the first page.
            </p>
          </div>

          {/* Column 2: Personal & Online Profiles (md:col-span-7) */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6659] mb-2">
                2. Candidate Info & Online Profiles
              </label>

              <div className="space-y-4">
                {/* 1. Student Name (Auto-extracted from Resume) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-[#4A4036] flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-[#5A5144]" />
                      <span>Student Name</span>
                      <span className="text-[#991B1B]">*</span>
                    </label>

                    {/* Auto-extraction status badge or loading indicator */}
                    {isExtractingName ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#B8532F]">
                        <Loader2 className="w-3 h-3 animate-spin text-[#B8532F]" />
                        <span>Reading resume...</span>
                      </span>
                    ) : autoExtracted && candidateName ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-[#2E6B47] bg-[#EDF7F0] border border-[#A3D9B1] px-1.5 py-0.5 rounded">
                        ✓ Auto-extracted from resume
                      </span>
                    ) : null}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={candidateName}
                      onChange={(e) => {
                        setCandidateName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder={
                        isExtractingName
                          ? "Reading resume..."
                          : "Auto-filled from resume or enter name"
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${
                        errors.name ? "border-[#991B1B] bg-red-50/20" : "border-[#D6CEBE] bg-[#FAF8F5]"
                      } text-sm text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-xs text-[#991B1B] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.name}</span>
                    </p>
                  )}
                </div>

                {/* 2. GitHub Profile URL (Required) */}
                <div>
                  <label className="block text-xs font-medium text-[#4A4036] mb-1 flex items-center gap-1.5">
                    <GithubIcon className="w-3.5 h-3.5 text-[#24201D]" />
                    <span>GitHub Profile URL</span>
                    <span className="text-[#991B1B]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => {
                        setGithubUrl(e.target.value);
                        if (errors.githubUrl) setErrors((prev) => ({ ...prev, githubUrl: undefined }));
                      }}
                      placeholder="https://github.com/username"
                      className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl border ${
                        errors.githubUrl ? "border-[#991B1B] bg-red-50/20" : "border-[#D6CEBE] bg-[#FAF8F5]"
                      } text-sm text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all font-mono text-xs sm:text-sm`}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] uppercase font-mono text-[#8A7E6C] bg-[#E8E2D7] px-1.5 py-0.5 rounded">
                      PUBLIC
                    </span>
                  </div>
                  {errors.githubUrl && (
                    <p className="text-xs text-[#991B1B] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.githubUrl}</span>
                    </p>
                  )}
                </div>

                {/* 3. LeetCode Profile URL (Required) */}
                <div>
                  <label className="block text-xs font-medium text-[#4A4036] mb-1 flex items-center gap-1.5">
                    <LeetcodeIcon className="w-3.5 h-3.5 text-[#FFA116]" />
                    <span>LeetCode Profile URL</span>
                    <span className="text-[#991B1B]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={leetcodeUrl}
                      onChange={(e) => {
                        setLeetcodeUrl(e.target.value);
                        if (errors.leetcodeUrl) setErrors((prev) => ({ ...prev, leetcodeUrl: undefined }));
                      }}
                      placeholder="https://leetcode.com/u/username"
                      className={`w-full pl-3.5 pr-24 py-2.5 rounded-xl border ${
                        errors.leetcodeUrl ? "border-[#991B1B] bg-red-50/20" : "border-[#D6CEBE] bg-[#FAF8F5]"
                      } text-sm text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all font-mono text-xs sm:text-sm`}
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] uppercase font-mono font-semibold text-[#B8532F] bg-[#FAF1EC] border border-[#EAC9BC] px-1.5 py-0.5 rounded">
                      DSA PROOF
                    </span>
                  </div>
                  {errors.leetcodeUrl && (
                    <p className="text-xs text-[#991B1B] font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.leetcodeUrl}</span>
                    </p>
                  )}
                </div>

                {/* 4. LinkedIn Profile URL & 5. Portfolio Website URL (Side-by-side grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* LinkedIn Profile URL */}
                  <div>
                    <label className="block text-xs font-medium text-[#4A4036] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <LinkedinIcon className="w-3.5 h-3.5 text-[#0A66C2]" />
                        <span>LinkedIn Profile URL</span>
                      </span>
                      <span className="text-[10px] text-[#8A7E6C] font-mono">Optional</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => {
                          setLinkedinUrl(e.target.value);
                          if (errors.linkedinUrl) setErrors((prev) => ({ ...prev, linkedinUrl: undefined }));
                        }}
                        placeholder="https://linkedin.com/in/username"
                        className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl border ${
                          errors.linkedinUrl ? "border-[#991B1B] bg-red-50/20" : "border-[#D6CEBE] bg-[#FAF8F5]"
                        } text-sm text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all font-mono text-xs`}
                      />
                      <span className="absolute right-2.5 top-2.5 text-[9px] uppercase font-mono font-semibold text-[#0A66C2] bg-[#EBF3FB] border border-[#BFDBFE] px-1.5 py-0.5 rounded">
                        NETWORK
                      </span>
                    </div>
                    {errors.linkedinUrl && (
                      <p className="text-xs text-[#991B1B] font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.linkedinUrl}</span>
                      </p>
                    )}
                  </div>

                  {/* Portfolio Website URL */}
                  <div>
                    <label className="block text-xs font-medium text-[#4A4036] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-[#2E6B47]" />
                        <span>Portfolio Website</span>
                      </span>
                      <span className="text-[10px] text-[#8A7E6C] font-mono">Optional</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => {
                          setPortfolioUrl(e.target.value);
                          if (errors.portfolioUrl) setErrors((prev) => ({ ...prev, portfolioUrl: undefined }));
                        }}
                        placeholder="https://yourportfolio.dev"
                        className={`w-full pl-3.5 pr-20 py-2.5 rounded-xl border ${
                          errors.portfolioUrl ? "border-[#991B1B] bg-red-50/20" : "border-[#D6CEBE] bg-[#FAF8F5]"
                        } text-sm text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all font-mono text-xs`}
                      />
                      <span className="absolute right-2.5 top-2.5 text-[9px] uppercase font-mono font-semibold text-[#2E6B47] bg-[#EDF7F0] border border-[#A3D9B1] px-1.5 py-0.5 rounded">
                        PROJECTS
                      </span>
                    </div>
                    {errors.portfolioUrl && (
                      <p className="text-xs text-[#991B1B] font-medium mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.portfolioUrl}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Target Role & Job Description */}
        <div className="pt-4 border-t border-[#E8E2D7] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Target Role Selector */}
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6659] mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-[#5A5144]" />
                <span>3. Target Role</span>
              </label>
              <select
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  if (errors.roleOrJob) setErrors((prev) => ({ ...prev, roleOrJob: undefined }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.roleOrJob ? "border-[#991B1B] bg-red-50/20" : "border-[#D6CEBE] bg-[#FAF8F5]"
                } text-sm font-semibold text-[#24201D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all cursor-pointer`}
              >
                <option value="">-- Select Target Role --</option>
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Description Textarea */}
            <div className="md:col-span-7">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#6E6659] mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#5A5144]" />
                  <span>4. Job Description (Optional if role selected)</span>
                </span>
              </label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  if (errors.roleOrJob) setErrors((prev) => ({ ...prev, roleOrJob: undefined }));
                }}
                placeholder="Paste job posting details here..."
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.roleOrJob ? "border-[#991B1B] bg-red-50/20" : "border-[#D6CEBE] bg-[#FAF8F5]"
                } text-xs sm:text-sm text-[#24201D] placeholder:text-[#A89E8D] focus:outline-none focus:border-[#24201D] focus:bg-[#FFFFFF] transition-all`}
              />
            </div>
          </div>

          {errors.roleOrJob && (
            <p className="text-xs text-[#991B1B] font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.roleOrJob}</span>
            </p>
          )}
        </div>

        {/* Inline alert if resume is missing or invalid */}
        {errors.resume && (
          <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-800 text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errors.resume}</span>
          </div>
        )}

        {/* Submit Button Row */}
        <div className="pt-3 border-t border-[#E8E2D7] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#8A7E6C]">
            {!resumeFile
              ? "⚠️ Upload your resume PDF to enable profile analysis."
              : "Step 1: Save candidate profile data securely."}
          </p>

          <button
            type="submit"
            disabled={isSubmitting || isLoading || !resumeFile}
            title={!resumeFile ? "Please upload your resume PDF to proceed." : undefined}
            id="submit-profile-btn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#24201D] hover:bg-[#3D3732] active:bg-[#181513] text-[#FAF8F5] font-semibold text-sm shadow-sm transition-all hover:translate-y-[-1px] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting || isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#FAF8F5] border-t-transparent rounded-full animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Save Candidate Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
