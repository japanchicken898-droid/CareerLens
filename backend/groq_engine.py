"""
Groq LLM Engine using llama-3.3-70b-versatile with native JSON mode
"""

import json
import os
from typing import Any, Dict, List, Optional
from groq import Groq
from models import CareerLensLLMResponse, SkillVerification


SYSTEM_PROMPT = """You are an evidence-based employability evaluator for CareerLens.
Your mission is to compare candidate resume claims against real proof-of-work signals (GitHub code, repos, LeetCode profile) and industry role benchmarks.

Rules for evaluating each skill:
- Mark a skill "Verified" if supported by repository code, dependencies, or LeetCode activity.
- Mark a skill "Unverified" if claimed on the resume but missing from observed code.
- Mark a skill "Missing" if required for the selected role benchmark but omitted by the candidate.
- Provide plain-English, one-line reasons without corporate buzzwords.
- The summary must be exactly 2 clear, informative sentences describing employability alignment and main gaps.
- The roadmap_steps must be a list of EXACTLY 3 concrete, numbered action items (e.g. "1. ...", "2. ...", "3. ...") focused on closing identified gaps with project work.

You must output valid JSON strictly conforming to this schema:
{
  "summary": "First sentence here. Second sentence here.",
  "skills": [
    {
      "name": "Skill Name",
      "status": "Verified" | "Unverified" | "Missing",
      "reason": "1-line direct reason"
    }
  ],
  "roadmap_steps": [
    "1. Concrete step one with technology and goal.",
    "2. Concrete step two with project evidence to build.",
    "3. Concrete step three with practice or proof needed."
  ]
}
"""


def build_user_prompt(
    candidate_name: str,
    target_role: str,
    resume_text: str,
    github_data: Dict[str, Any],
    leetcode_username: Optional[str],
    deterministic_score: int,
    deterministic_skills: List[SkillVerification],
) -> str:
    repos_summary = []
    for r in github_data.get("repositories", [])[:12]:
        repos_summary.append(
            f"- {r.get('name')} (Lang: {r.get('language')}, Stars: {r.get('stars')}): {r.get('description', 'No description')}"
        )

    repos_text = "\n".join(repos_summary) if repos_summary else "No public repositories found."
    langs_text = ", ".join(github_data.get("languages", [])) or "None identified"

    manifest_tech_str = ", ".join(github_data.get("manifest_technologies", [])) or "None detected"
    code_evidence_notes = github_data.get("code_evidence", [])
    evidence_text = "\n".join([f"- {note}" for note in code_evidence_notes[:15]]) or "No specific package manifests detected"

    det_skills_summary = [
        f"- {s.name}: {s.status} ({s.reason})" for s in deterministic_skills
    ]

    return f"""Candidate Evaluation Request:
Candidate Name: {candidate_name}
Target Role: {target_role}
Deterministic Job Readiness Score: {deterministic_score}/100
LeetCode Profile: {leetcode_username or 'Not provided'}
GitHub Languages Observed: {langs_text}
Inspected Technologies & Manifests: {manifest_tech_str}
Inspected Code & Infrastructure Findings:
{evidence_text}

GitHub Repositories Sample:
{repos_text}

Baseline Verified Skills:
{chr(10).join(det_skills_summary)}

Resume Excerpt (first 2500 characters):
\"\"\"
{resume_text[:2500]}
\"\"\"

Please evaluate the candidate's skills against the target role benchmark, confirm or refine the verification statuses and reasons, provide a 2-sentence summary, and deliver exactly 3 prioritized, numbered action items for the roadmap.
"""


def generate_fallback_response(
    candidate_name: str,
    target_role: str,
    deterministic_score: int,
    deterministic_skills: List[SkillVerification],
) -> CareerLensLLMResponse:
    """Deterministic fallback if GROQ_API_KEY is not configured or rate limited."""
    verified = [s.name for s in deterministic_skills if s.status == "Verified"]
    missing = [s.name for s in deterministic_skills if s.status in ("Missing", "Unverified")]

    first_missing = missing[0] if missing else "system architecture"
    second_missing = missing[1] if len(missing) > 1 else "database indexing"
    third_missing = missing[2] if len(missing) > 2 else "Docker deployment"

    summary = (
        f"{candidate_name} demonstrates a {deterministic_score}% readiness score for {target_role} with proven experience in {', '.join(verified[:2]) if verified else 'core fundamentals'}. "
        f"Key growth opportunities include developing hands-on project proof for {first_missing} and {second_missing}."
    )

    roadmap_steps = [
        f"1. Build a full-stack {target_role} portfolio project implementing {first_missing} with clean documentation and tests.",
        f"2. Add comprehensive unit testing, Docker containerization, and CI/CD pipelines showcasing {second_missing}.",
        f"3. Practice 25 core algorithmic patterns on LeetCode focusing on arrays, trees, and graphs to solidify DSA readiness.",
    ]

    return CareerLensLLMResponse(
        summary=summary,
        skills=deterministic_skills,
        roadmap_steps=roadmap_steps,
    )


async def analyze_with_groq(
    candidate_name: str,
    target_role: str,
    resume_text: str,
    github_data: Dict[str, Any],
    leetcode_username: Optional[str],
    deterministic_score: int,
    deterministic_skills: List[SkillVerification],
) -> CareerLensLLMResponse:
    """
    Calls Groq API using llama-3.3-70b-versatile with native JSON mode and temperature 0.2.
    """
    # Reload .env to immediately catch any newly configured keys
    from pathlib import Path
    from dotenv import load_dotenv
    env_file = Path(__file__).resolve().parent / ".env"
    load_dotenv(dotenv_path=env_file, override=True)

    api_key = os.getenv("GROQ_API_KEY", "").strip()

    # Graceful fallback if no API key is provided
    if not api_key:
        print("[groq_engine] GROQ_API_KEY not configured. Using deterministic engine fallback.")
        return generate_fallback_response(
            candidate_name, target_role, deterministic_score, deterministic_skills
        )

    try:
        client = Groq(api_key=api_key)
        user_prompt = build_user_prompt(
            candidate_name=candidate_name,
            target_role=target_role,
            resume_text=resume_text,
            github_data=github_data,
            leetcode_username=leetcode_username,
            deterministic_score=deterministic_score,
            deterministic_skills=deterministic_skills,
        )

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=1500,
        )

        response_content = completion.choices[0].message.content or "{}"
        data = json.loads(response_content)

        # Validate against strict Pydantic model
        validated = CareerLensLLMResponse.model_validate(data)

        # Ensure exactly 3 roadmap steps
        if len(validated.roadmap_steps) != 3:
            # Normalize to 3
            if len(validated.roadmap_steps) < 3:
                fb = generate_fallback_response(candidate_name, target_role, deterministic_score, deterministic_skills)
                while len(validated.roadmap_steps) < 3:
                    idx = len(validated.roadmap_steps)
                    validated.roadmap_steps.append(fb.roadmap_steps[idx])
            else:
                validated.roadmap_steps = validated.roadmap_steps[:3]

        return validated

    except Exception as e:
        print(f"[groq_engine] Error during Groq inference: {e}. Falling back to deterministic analysis.")
        return generate_fallback_response(
            candidate_name, target_role, deterministic_score, deterministic_skills
        )
