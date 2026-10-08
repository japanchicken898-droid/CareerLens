"""
Pydantic Data Models for CareerLens Backend
"""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class SkillVerification(BaseModel):
    name: str = Field(..., description="Name of the skill, e.g. Python, Docker, LeetCode DSA")
    status: Literal["Verified", "Unverified", "Missing"] = Field(
        ...,
        description="Status: Verified (supported by code/LeetCode), Unverified (claimed on resume but missing from code), or Missing (required for role benchmark but omitted)",
    )
    reason: str = Field(..., description="Concise 1-line explanation in plain English without buzzwords")


class CareerLensLLMResponse(BaseModel):
    summary: str = Field(..., description="Concise 2-sentence summary of candidate employability profile and primary gaps")
    skills: List[SkillVerification] = Field(..., description="List of verified, unverified, and missing skill evaluations")
    roadmap_steps: List[str] = Field(
        ...,
        description="List of exactly 3 concrete, numbered action items (e.g. '1. ...', '2. ...', '3. ...')",
    )


class NameExtractionResponse(BaseModel):
    name: str
    auto_extracted: bool
    message: str


class BenchmarkMetrics(BaseModel):
    precision: float
    recall: float
    f1: float
    sample_size: int
    role_market_data: dict = {}
    scikit_learn_active: bool = True


class AnalyzeResponse(BaseModel):
    candidate_name: str
    target_role: str
    readiness_score: int = Field(..., ge=0, le=100, description="Deterministic Job Readiness Score (0-100)")
    verdict: str
    summary: str
    skills: List[SkillVerification]
    roadmap_steps: List[str]
    github_repos_count: int
    repos_sample: List[str] = []
    leetcode_username: Optional[str] = None
    deterministic_score: int
    llm_enhanced: bool = True
    education_count: int = 0
    experience_count: int = 0
    project_count: int = 0
    resume_status_text: str = "0 edu • 0 exp • 0 proj"
    extracted_skills: List[str] = []
    benchmark_metrics: Optional[BenchmarkMetrics] = None
