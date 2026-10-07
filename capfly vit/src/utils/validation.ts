import { ProfileData, FormErrors } from "@/types/profile";

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(input: string): boolean {
  if (!input || !input.trim()) return true;
  const urlString = normalizeUrl(input);
  try {
    const url = new URL(urlString);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function isValidGithubUrl(input: string): boolean {
  if (!input || !input.trim()) return false;
  const urlString = normalizeUrl(input);
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host !== "github.com" && host !== "www.github.com") return false;
    const pathParts = url.pathname.split("/").filter(Boolean);
    return pathParts.length >= 1;
  } catch {
    return false;
  }
}

export function isValidLeetcodeUrl(input: string): boolean {
  if (!input || !input.trim()) return false;
  const urlString = normalizeUrl(input);
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host !== "leetcode.com" && host !== "www.leetcode.com") return false;
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Should have username e.g. /u/username or /username
    return pathParts.length >= 1;
  } catch {
    return false;
  }
}

export function isValidLinkedinUrl(input: string): boolean {
  if (!input || !input.trim()) return true;
  const urlString = normalizeUrl(input);
  try {
    const url = new URL(urlString);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

export function validateProfileInput(data: {
  name: string;
  resumeFile: File | null;
  resumeFileName?: string;
  githubUrl: string;
  leetcodeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  additionalLinks?: string[];
  targetRole: string;
  jobDescription: string;
}): { isValid: boolean; errors: FormErrors } {
  const errors: FormErrors = {};

  // 1. Student Name validation
  const trimmedName = data.name.trim();
  if (!trimmedName) {
    errors.name = "Student Name is required.";
  }

  // 2. Resume PDF validation
  if (!data.resumeFile && !data.resumeFileName) {
    errors.resume = "Resume PDF file is required.";
  } else if (data.resumeFile) {
    const isPdf =
      data.resumeFile.type === "application/pdf" ||
      data.resumeFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      errors.resume = "Only PDF files (.pdf) are accepted.";
    } else if (data.resumeFile.size > 10 * 1024 * 1024) {
      errors.resume = `File size exceeds 10 MB limit (${formatFileSize(data.resumeFile.size)}).`;
    }
  }

  // 3. GitHub Profile URL validation (Required)
  const trimmedGithub = data.githubUrl.trim();
  if (!trimmedGithub) {
    errors.githubUrl = "GitHub profile URL is required.";
  } else if (!isValidGithubUrl(trimmedGithub)) {
    errors.githubUrl = "Please enter a valid GitHub profile URL (e.g. https://github.com/username).";
  }

  // 4. LeetCode Profile URL validation (Required)
  const trimmedLeetcode = (data.leetcodeUrl || "").trim();
  if (!trimmedLeetcode) {
    errors.leetcodeUrl = "LeetCode profile URL is required.";
  } else if (!isValidLeetcodeUrl(trimmedLeetcode)) {
    errors.leetcodeUrl = "Please enter a valid LeetCode profile URL (e.g. https://leetcode.com/u/username).";
  }

  // 5. Portfolio URL validation (Optional if provided)
  if (data.portfolioUrl && data.portfolioUrl.trim() && !isValidUrl(data.portfolioUrl)) {
    errors.portfolioUrl = "Please enter a valid Portfolio URL (e.g. https://myportfolio.com).";
  }

  // 6. LinkedIn Profile URL validation (Optional if provided)
  if (data.linkedinUrl && data.linkedinUrl.trim() && !isValidLinkedinUrl(data.linkedinUrl)) {
    errors.linkedinUrl = "Please enter a valid LinkedIn URL (e.g. https://linkedin.com/in/username).";
  }

  // 7. Additional Links validation (Optional if provided)
  if (data.additionalLinks && data.additionalLinks.length > 0) {
    const linkErrors: Record<number, string> = {};
    data.additionalLinks.forEach((link, i) => {
      if (link && link.trim() && !isValidUrl(link)) {
        linkErrors[i] = "Please enter a valid URL.";
      }
    });
    if (Object.keys(linkErrors).length > 0) {
      errors.additionalLinks = linkErrors;
    }
  }

  // 8. Target Role OR Job Description validation
  const hasTargetRole = Boolean(data.targetRole && data.targetRole.trim());
  const hasJobDesc = Boolean(data.jobDescription && data.jobDescription.trim());

  if (!hasTargetRole && !hasJobDesc) {
    errors.roleOrJob = "Please select a Target Role or enter a Job Description.";
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}
