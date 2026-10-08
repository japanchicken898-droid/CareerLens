/**
 * CareerLens FastAPI Backend API Client
 *
 * Connects the Next.js frontend to the FastAPI + Groq backend service
 * running on http://localhost:8000 (configurable via NEXT_PUBLIC_API_URL).
 */

export interface SkillVerification {
  name: string;
  status: "Verified" | "Unverified" | "Missing";
  reason: string;
}

export interface RoleMarketData {
  market_demand: number;
  cohort_gap: number;
  weight: number;
}

export interface BenchmarkMetrics {
  precision: number;
  recall: number;
  f1: number;
  sample_size: number;
  role_market_data: Record<string, RoleMarketData>;
  scikit_learn_active: boolean;
}

export interface BackendAnalyzeResponse {
  candidate_name: string;
  target_role: string;
  readiness_score: number;
  verdict: string;
  summary: string;
  skills: SkillVerification[];
  roadmap_steps: string[];
  github_repos_count: number;
  repos_sample: string[];
  leetcode_username?: string;
  deterministic_score: number;
  llm_enhanced: boolean;
  education_count?: number;
  experience_count?: number;
  project_count?: number;
  resume_status_text?: string;
  extracted_skills?: string[];
  benchmark_metrics?: BenchmarkMetrics;
}

export interface BackendHealthResponse {
  status: string;
  service: string;
  groq_configured: boolean;
  groq_model?: string;
}

export interface NameExtractionResult {
  name: string;
  auto_extracted: boolean;
  message: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Checks backend health and Groq configuration status
 */
export async function checkBackendHealth(): Promise<BackendHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/api/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Calls FastAPI POST /api/extract-name to auto-extract candidate name from PDF
 */
export async function extractNameViaBackend(file: File): Promise<NameExtractionResult | null> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/extract-name`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return {
      name: data.name || "",
      auto_extracted: Boolean(data.auto_extracted),
      message: data.message || "",
    };
  } catch (err) {
    console.warn("[backendApiService] FastAPI extract-name unreachable, falling back to local extractor:", err);
    return null;
  }
}

/**
 * Calls FastAPI POST /api/analyze for complete evaluation via Groq + deterministic JRS
 */
export async function analyzeProfileViaBackend(params: {
  resumeFile?: File | null;
  githubUsername: string;
  leetcodeUsername?: string;
  targetRole: string;
  candidateName?: string;
}): Promise<BackendAnalyzeResponse | null> {
  if (!params.resumeFile) {
    console.warn("[backendApiService] Resume file is mandatory. Aborting backend analyze call.");
    return null;
  }

  try {
    const formData = new FormData();
    formData.append("resume", params.resumeFile);
    formData.append("github_username", params.githubUsername);
    if (params.leetcodeUsername) {
      formData.append("leetcode_username", params.leetcodeUsername);
    }
    formData.append("target_role", params.targetRole);
    if (params.candidateName) {
      formData.append("candidate_name", params.candidateName);
    }

    const res = await fetch(`${API_BASE}/api/analyze`, {
      method: "POST",
      body: formData,
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[backendApiService] FastAPI analyze unreachable:", err);
    return null;
  }
}

/**
 * Fetches dynamic scikit-learn calculated benchmark validation metrics & market weights
 */
export async function fetchBenchmarkMetrics(): Promise<BenchmarkMetrics | null> {
  try {
    const res = await fetch(`${API_BASE}/api/benchmark-metrics`, {
      method: "GET",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn("[backendApiService] FastAPI benchmark-metrics unreachable:", err);
    return null;
  }
}

