export const TARGET_ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "UI/UX Designer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
] as const;

export type TargetRoleOption = (typeof TARGET_ROLES)[number];

export interface ProfileData {
  id?: string;
  name: string;
  resume: File | null;
  resumeFileName: string;
  resumeFileSize?: number;
  githubUrl: string;
  leetcodeUrl: string;
  portfolioUrl: string;
  linkedinUrl: string;
  additionalLinks: string[];
  targetRole: string;
  jobDescription: string;
  createdAt?: string;
}

export interface FormErrors {
  name?: string;
  resume?: string;
  githubUrl?: string;
  leetcodeUrl?: string;
  portfolioUrl?: string;
  linkedinUrl?: string;
  additionalLinks?: Record<number, string>;
  roleOrJob?: string;
}
