"""
CareerLens FastAPI Backend
Evidence-based Employability Evaluation with Groq LLM (llama-3.3-70b-versatile)
"""

import os
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path

# Load environment variables explicitly from backend/.env
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path=env_path, override=True)

from github_client import fetch_github_profile_data, sanitize_github_username
from groq_engine import analyze_with_groq
from jrs_calculator import calculate_deterministic_jrs
from models import AnalyzeResponse, CareerLensLLMResponse, NameExtractionResponse
from pdf_extractor import extract_pdf_data
from benchmark import get_evaluation_metrics

app = FastAPI(
    title="CareerLens API",
    description="Backend service for CareerLens employability & proof-of-work analysis using FastAPI and Groq",
    version="1.0.0",
)

# ─── CORS Middleware ─────────────────────────────────────────────────────────
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    load_dotenv(dotenv_path=env_path, override=True)
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    return {
        "status": "ok",
        "service": "CareerLens Backend",
        "groq_configured": bool(groq_key),
        "groq_model": "llama-3.3-70b-versatile",
    }


@app.get("/api/benchmark-metrics")
async def benchmark_metrics_endpoint():
    """
    Returns dynamic scikit-learn calculated benchmark validation metrics (precision, recall, f1)
    and empirical role market data.
    """
    return get_evaluation_metrics()


@app.post("/api/extract-name", response_model=NameExtractionResponse)
async def extract_candidate_name_endpoint(file: UploadFile = File(...)):
    """
    Reads an uploaded PDF resume and auto-extracts the candidate's name
    using pdfplumber positional and font-size heuristics.
    """
    if not file or not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Resume PDF is mandatory. Skill extraction cannot proceed without a uploaded resume.",
        )

    try:
        content = await file.read()
        if not content or len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Resume PDF is mandatory. Skill extraction cannot proceed without a uploaded resume.",
            )
        pdf_res = extract_pdf_data(content, filename=file.filename)
        resume_text = pdf_res.get("full_text", "")
        if not resume_text or len(resume_text.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Resume PDF is mandatory. Skill extraction cannot proceed without a uploaded resume.",
            )
        extracted_name = pdf_res.get("candidate_name")

        if extracted_name and extracted_name.strip() and extracted_name != "Candidate":
            return NameExtractionResponse(
                name=extracted_name.strip(),
                auto_extracted=True,
                message="Name successfully extracted from resume.",
            )
        else:
            return NameExtractionResponse(
                name="",
                auto_extracted=False,
                message="Could not auto-detect name from document text.",
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_profile(
    resume: UploadFile = File(...),
    github_username: str = Form(...),
    leetcode_username: Optional[str] = Form(None),
    target_role: str = Form("Backend Developer"),
    candidate_name: Optional[str] = Form(None),
):
    """
    Performs comprehensive employability evaluation:
    1. Extracts resume text via pdfplumber (and auto-extracts name if not provided).
    2. Parses section counts (education, experience, projects).
    3. Extracts normalized skill entities with strict disambiguation.
    4. Fetches public GitHub repositories, languages, and commit metadata.
    5. Computes deterministic Job Readiness Score (JRS out of 100).
    6. Runs Groq LLM (llama-3.3-70b-versatile) in JSON mode for verified skills and 3-step action roadmap.
    7. Returns unified response.
    """
    if not resume or not resume.filename or resume.filename.strip() == "" or not resume.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Resume PDF is mandatory. Skill extraction cannot proceed without a uploaded resume.",
        )

    has_leetcode = bool(leetcode_username and leetcode_username.strip())

    try:
        content = await resume.read()
        if not content or len(content) == 0:
            raise HTTPException(
                status_code=400,
                detail="Resume PDF is mandatory. Skill extraction cannot proceed without a uploaded resume.",
            )
        pdf_res = extract_pdf_data(content, filename=resume.filename, leetcode_active=has_leetcode)
        resume_text = pdf_res.get("full_text", "")
        if not resume_text or len(resume_text.strip()) == 0:
            raise HTTPException(
                status_code=400,
                detail="Resume PDF is mandatory. Skill extraction cannot proceed without a uploaded resume.",
            )
        extracted_name = pdf_res.get("candidate_name", "")
        edu_count = pdf_res.get("education_count", 0)
        exp_count = pdf_res.get("experience_count", 0)
        proj_count = pdf_res.get("project_count", 0)
        resume_status_text = pdf_res.get("resume_status_text", "0 edu • 0 exp • 0 proj")
        extracted_skills = pdf_res.get("skills", [])
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")

    # Determine candidate name
    final_name = (candidate_name or "").strip()
    if not final_name and extracted_name and extracted_name != "Candidate":
        final_name = extracted_name
    if not final_name:
        clean_gh = sanitize_github_username(github_username)
        final_name = clean_gh.capitalize() if clean_gh else "Candidate"

    # 2. Fetch GitHub Repos & Languages
    github_data = await fetch_github_profile_data(github_username)

    # 3. Deterministic Job Readiness Score (JRS)
    jrs_score, verdict, deterministic_skills = calculate_deterministic_jrs(
        target_role=target_role,
        resume_text=resume_text,
        github_data=github_data,
        leetcode_active=has_leetcode,
    )

    # 4. Groq LLM Inference (llama-3.3-70b-versatile with JSON mode)
    groq_res: CareerLensLLMResponse = await analyze_with_groq(
        candidate_name=final_name,
        target_role=target_role,
        resume_text=resume_text,
        github_data=github_data,
        leetcode_username=leetcode_username,
        deterministic_score=jrs_score,
        deterministic_skills=deterministic_skills,
    )

    sample_repos = [
        r.get("name", "") for r in github_data.get("repositories", [])[:5] if r.get("name")
    ]

    has_groq_key = bool(os.getenv("GROQ_API_KEY", "").strip())

    return AnalyzeResponse(
        candidate_name=final_name,
        target_role=target_role,
        readiness_score=jrs_score,
        verdict=verdict,
        summary=groq_res.summary,
        skills=groq_res.skills,
        roadmap_steps=groq_res.roadmap_steps,
        github_repos_count=github_data.get("total_repos", 0),
        repos_sample=sample_repos,
        leetcode_username=leetcode_username,
        deterministic_score=jrs_score,
        llm_enhanced=has_groq_key,
        education_count=edu_count,
        experience_count=exp_count,
        project_count=proj_count,
        resume_status_text=resume_status_text,
        extracted_skills=extracted_skills,
        benchmark_metrics=get_evaluation_metrics(),
    )


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
