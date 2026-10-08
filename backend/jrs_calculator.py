"""
Deterministic Job Readiness Score (JRS out of 100) and Role Benchmarks
"""

import re
from typing import Any, Dict, List, Optional, Tuple
from models import SkillVerification


ROLE_BENCHMARKS: Dict[str, Dict[str, List[str]]] = {
    "Backend Developer": {
        "required": [
            "Data Structures & Algorithms",
            "Python/Java/Go/Node.js",
            "REST APIs / Backend Frameworks",
            "Relational Databases (SQL/PostgreSQL)",
            "Git Version Control",
            "Docker / Containerization",
        ],
        "preferred": [
            "Redis / In-Memory Caching",
            "CI/CD Pipelines",
            "System Architecture",
        ],
    },
    "Frontend Developer": {
        "required": [
            "JavaScript / TypeScript",
            "React.js / Next.js",
            "HTML5 & Modern CSS / Tailwind",
            "State Management",
            "Git Version Control",
            "Responsive Web Design",
        ],
        "preferred": [
            "Web Performance Optimization",
            "End-to-End Testing",
            "GraphQL / REST Integration",
        ],
    },
    "ML Engineer": {
        "required": [
            "Python",
            "Data Structures & Algorithms",
            "PyTorch or TensorFlow",
            "NumPy & Pandas",
            "Model Evaluation & Metrics",
            "Git Version Control",
        ],
        "preferred": [
            "FastAPI / Model Serving",
            "Docker",
            "MLOps / Pipeline Automation",
        ],
    },
    "Software Development Engineer (SDE-1)": {
        "required": [
            "Data Structures & Algorithms",
            "Object-Oriented Programming (Java/C++/Python)",
            "Database Design (SQL/NoSQL)",
            "Web APIs & Networking",
            "Git Version Control",
            "Unit Testing & Debugging",
        ],
        "preferred": [
            "Cloud Fundamentals (AWS/GCP)",
            "Docker",
            "System Design Principles",
        ],
    },
}


def normalize_token(text: str) -> str:
    return re.sub(r"[^\w\s]", "", text).lower().strip()


def check_evidence(
    skill_name: str,
    resume_text: str,
    github_languages: List[str],
    github_repos: List[Dict[str, Any]],
    leetcode_active: bool,
    manifest_technologies: Optional[List[str]] = None,
    code_evidence_notes: Optional[List[str]] = None,
) -> Tuple[bool, bool, str]:
    """
    Returns (claimed_in_resume, supported_in_code, proof_detail)
    """
    resume_lower = resume_text.lower()
    skill_lower = skill_name.lower()
    manifests = [m.lower() for m in (manifest_technologies or [])]
    notes_str = " ".join(code_evidence_notes or []).lower()

    # LeetCode / DSA special case
    if "data structures" in skill_lower or "algorithm" in skill_lower or "dsa" in skill_lower:
        claimed = "algorithm" in resume_lower or "data structure" in resume_lower or "leetcode" in resume_lower or "dsa" in resume_lower
        if leetcode_active:
            return True, True, "Demonstrated via active LeetCode DSA profile & problem-solving track"
        for r in github_repos:
            r_name = r.get("name", "").lower()
            if "dsa" in r_name or "algo" in r_name or "leetcode" in r_name or "competitive" in r_name:
                return True, True, f"Found dedicated algorithmic repository '{r.get('name')}'"
        if claimed:
            return True, False, "Claimed on resume, but no dedicated DSA repository or verified LeetCode profile found"
        return False, False, "Omitted from resume and lacking algorithmic evidence in repositories"

    # Docker / Containerization
    if "docker" in skill_lower or "container" in skill_lower:
        claimed = "docker" in resume_lower or "container" in resume_lower
        for r in github_repos:
            if r.get("has_docker"):
                return True, True, f"Verified Docker configuration (Dockerfile / compose) in repository '{r.get('name')}'"
        if any("docker" in m for m in manifests) or "docker" in notes_str:
            return True, True, "Verified Docker manifest and container definitions in inspected code"
        if claimed:
            return True, False, f"Mentioned on resume, but absent from GitHub repos ({len(github_repos)} public repos inspected)"
        return False, False, "Not evidenced in observed GitHub repositories or resume profile"

    # CI/CD Pipelines
    if "ci/cd" in skill_lower or "pipeline" in skill_lower or "github action" in skill_lower:
        claimed = "ci/cd" in resume_lower or "github action" in resume_lower or "jenkins" in resume_lower or "pipeline" in resume_lower
        for r in github_repos:
            if r.get("has_cicd"):
                return True, True, f"Verified automated CI/CD workflows (.github/workflows) in repository '{r.get('name')}'"
        if any("ci/cd" in m or "github action" in m for m in manifests) or "workflow" in notes_str:
            return True, True, "Verified CI/CD automation in inspected repository workflows"
        if claimed:
            return True, False, f"Mentioned on resume, but absent from GitHub repos ({len(github_repos)} public repos inspected)"
        return False, False, "Not evidenced in observed GitHub repositories or resume profile"

    # Relational Databases (SQL)
    if "sql" in skill_lower or "relational database" in skill_lower or "database" in skill_lower:
        claimed = any(db in resume_lower for db in ["sql", "postgres", "mysql", "database", "sqlite"])
        for r in github_repos:
            if r.get("has_sql"):
                return True, True, f"Verified SQL / database schema and drivers in repository '{r.get('name')}'"
        sql_match = [m for m in manifests if any(k in m for k in ["sql", "postgres", "mysql", "sqlite", "prisma", "gorm"])]
        if sql_match:
            return True, True, f"Verified database client dependency '{sql_match[0]}' in inspected repository manifests"
        if claimed:
            return True, False, f"Mentioned on resume, but absent from GitHub repos ({len(github_repos)} public repos inspected)"
        return False, False, "Not evidenced in observed GitHub repositories or resume profile"

    # Redis / In-Memory Caching
    if "redis" in skill_lower or "caching" in skill_lower or "in-memory" in skill_lower:
        claimed = "redis" in resume_lower or "cache" in resume_lower
        for r in github_repos:
            if r.get("has_redis"):
                return True, True, f"Verified Redis integration in repository '{r.get('name')}'"
        if any("redis" in m for m in manifests) or "redis" in notes_str:
            return True, True, "Verified Redis dependency in inspected codebase manifests"
        if claimed:
            return True, False, f"Mentioned on resume, but absent from GitHub repos ({len(github_repos)} public repos inspected)"
        return False, False, "Not evidenced in observed GitHub repositories or resume profile"

    # REST APIs / Backend Frameworks
    if "api" in skill_lower or "backend framework" in skill_lower or "rest" in skill_lower:
        claimed = any(k in resume_lower for k in ["api", "rest", "fastapi", "express", "backend", "endpoint"])
        api_match = [m for m in manifests if any(k in m for k in ["fastapi", "express", "django", "flask", "spring", "gin", "fiber", "nestjs"])]
        if api_match:
            return True, True, f"Verified backend framework '{api_match[0]}' in repository code dependencies"
        for r in github_repos:
            techs = r.get("inspected_technologies", [])
            for t in techs:
                if any(k in t.lower() for k in ["fastapi", "express", "django", "flask", "spring", "gin"]):
                    return True, True, f"Verified framework '{t}' in repository '{r.get('name')}'"
        if claimed:
            return True, False, f"Mentioned on resume, but absent from GitHub repos ({len(github_repos)} public repos inspected)"
        return False, False, "Not evidenced in observed GitHub repositories or resume profile"

    # Git Version Control
    if "git" in skill_lower:
        if len(github_repos) > 0:
            return True, True, f"Demonstrated active version control across {len(github_repos)} public repositories"
        return True, True, "Demonstrated active Git repository history"

    # General skill matching
    tokens = [t for t in re.split(r"[/,&() ]+", skill_lower) if len(t) > 2]

    # 1. Check GitHub evidence
    code_evidence: List[str] = []

    # Check manifest technologies
    for m in (manifest_technologies or []):
        m_lower = m.lower()
        if any(t in m_lower or m_lower in t for t in tokens):
            code_evidence.append(f"Detected dependency '{m}' in repository manifests")

    # Match primary and inspected languages
    for lang in github_languages:
        lang_lower = lang.lower()
        if any(t in lang_lower for t in tokens) or any(lang_lower in t for t in tokens):
            code_evidence.append(f"Language '{lang}' verified across public repositories")

    # Match repository descriptions / names / inspected technologies
    for r in github_repos:
        name_desc = (r.get("name", "") + " " + r.get("description", "")).lower()
        for t in tokens:
            if t in name_desc:
                code_evidence.append(f"Repository '{r.get('name')}' utilizes {t.title()}")
                break
        for tech in r.get("inspected_technologies", []):
            if any(t in tech.lower() for t in tokens):
                code_evidence.append(f"Verified '{tech}' in repository '{r.get('name')}'")
                break

    supported_in_code = len(code_evidence) > 0
    proof_str = code_evidence[0] if supported_in_code else ""

    # 2. Check resume claim
    claimed = any(t in resume_lower for t in tokens)

    if supported_in_code:
        return True, True, proof_str
    elif claimed:
        return True, False, f"Mentioned on resume, but absent from GitHub repos ({len(github_repos)} public repos checked)"
    else:
        return False, False, "Not evidenced in observed GitHub repositories or resume profile"


def calculate_deterministic_jrs(
    target_role: str,
    resume_text: str,
    github_data: Dict[str, Any],
    leetcode_active: bool,
) -> Tuple[int, str, List[SkillVerification]]:
    """
    Computes strict Job Readiness Score (JRS 0-100) and initial deterministic SkillVerification list.
    """
    benchmark = ROLE_BENCHMARKS.get(target_role)
    if not benchmark:
        for key in ROLE_BENCHMARKS:
            if key.lower() in target_role.lower() or target_role.lower() in key.lower():
                benchmark = ROLE_BENCHMARKS[key]
                break
        if not benchmark:
            benchmark = ROLE_BENCHMARKS["Software Development Engineer (SDE-1)"]

    required_skills = benchmark["required"]
    preferred_skills = benchmark["preferred"]

    github_languages = github_data.get("languages", [])
    github_repos = github_data.get("repositories", [])
    manifest_technologies = github_data.get("manifest_technologies", [])
    code_evidence_notes = github_data.get("code_evidence", [])

    verified_list: List[SkillVerification] = []
    points = 0
    max_points = len(required_skills) * 3

    for skill in required_skills:
        claimed, supported, detail = check_evidence(
            skill,
            resume_text,
            github_languages,
            github_repos,
            leetcode_active,
            manifest_technologies,
            code_evidence_notes,
        )
        if supported:
            status = "Verified"
            reason = detail or f"Verified in public repositories and code commits."
            points += 3
        elif claimed:
            status = "Unverified"
            reason = detail or f"Claimed on resume, but unobserved in submitted code repositories."
            points += 1
        else:
            status = "Missing"
            reason = f"Required benchmark skill omitted from both resume claims and GitHub code."
            points += 0

        verified_list.append(SkillVerification(name=skill, status=status, reason=reason))

    # Evaluate preferred skills for extra context
    for skill in preferred_skills:
        claimed, supported, detail = check_evidence(
            skill,
            resume_text,
            github_languages,
            github_repos,
            leetcode_active,
            manifest_technologies,
            code_evidence_notes,
        )
        if supported:
            verified_list.append(SkillVerification(name=skill, status="Verified", reason=detail or "Supported by code evidence."))
        elif claimed:
            verified_list.append(SkillVerification(name=skill, status="Unverified", reason=detail or "Claimed in resume without observed proof."))
        else:
            verified_list.append(SkillVerification(name=skill, status="Missing", reason="Preferred skill currently unevidenced in portfolio."))

    readiness_score = int(round((points / max(max_points, 1)) * 100))
    readiness_score = max(0, min(100, readiness_score))

    missing_count = sum(1 for s in verified_list if s.status == "Missing")
    unverified_count = sum(1 for s in verified_list if s.status == "Unverified")

    if readiness_score >= 80:
        verdict = "Strong role alignment with solid evidence across primary competencies."
    elif readiness_score >= 60:
        verdict = f"Moderate employability baseline. Resolve {unverified_count} unverified claim(s) and {missing_count} core gap(s)."
    else:
        verdict = f"Early stage readiness. Needs concrete proof-of-work across {missing_count} benchmark competencies."

    return readiness_score, verdict, verified_list
