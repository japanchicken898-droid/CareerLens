"""
GitHub REST API Client for public repos, languages, commit activity,
and deep code/manifest inspection (package.json, requirements.txt, go.mod, Dockerfile, CI/CD).
"""

import asyncio
import base64
import json
import os
import re
from typing import Any, Dict, List, Optional, Set
import httpx


def sanitize_github_username(raw: str) -> str:
    """Extract clean username from string or URL."""
    cleaned = raw.strip()
    match = re.search(r"github\.com/([a-zA-Z0-9_\-]+)", cleaned)
    if match:
        return match.group(1)
    return cleaned.replace("@", "").strip()


KNOWN_TECH_MAP = {
    # Web & API Frameworks
    "fastapi": "FastAPI",
    "flask": "Flask",
    "django": "Django",
    "express": "Express.js",
    "react": "React.js",
    "next": "Next.js",
    "vue": "Vue.js",
    "angular": "Angular",
    "nestjs": "NestJS",
    "spring": "Spring Boot",
    "gin": "Gin",
    "fiber": "Fiber",
    # Databases & Caching
    "redis": "Redis",
    "go-redis": "Redis",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "psycopg2": "PostgreSQL",
    "asyncpg": "PostgreSQL",
    "pg": "PostgreSQL",
    "mysql": "MySQL",
    "mysql2": "MySQL",
    "mysqlclient": "MySQL",
    "mongodb": "MongoDB",
    "pymongo": "MongoDB",
    "mongoose": "MongoDB",
    "prisma": "Prisma ORM",
    "sqlalchemy": "SQLAlchemy",
    "sequelize": "Sequelize",
    "typeorm": "TypeORM",
    "gorm": "GORM",
    "sqlite": "SQLite",
    "sqlite3": "SQLite",
    # DevOps & Containers & CI/CD
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "k8s": "Kubernetes",
    # Messaging & Real-time
    "kafka": "Apache Kafka",
    "rabbitmq": "RabbitMQ",
    "celery": "Celery",
    "socket.io": "WebSockets",
    "websockets": "WebSockets",
    "webrtc": "WebRTC",
    "grpc": "gRPC",
    "graphql": "GraphQL",
    # Testing & Tooling
    "pytest": "PyTest",
    "jest": "Jest",
    "tailwind": "TailwindCSS",
    "tailwindcss": "TailwindCSS",
    "typescript": "TypeScript",
}


async def inspect_repo_code(
    client: httpx.AsyncClient,
    username: str,
    repo_name: str,
    headers: Dict[str, str],
) -> Dict[str, Any]:
    """
    Deeply inspects a repository for languages breakdown, root manifests,
    and key infrastructure files (Dockerfile, CI/CD, package.json, requirements.txt, go.mod).
    """
    repo_info = {
        "languages": {},
        "detected_tech": set(),
        "has_docker": False,
        "has_cicd": False,
        "has_sql": False,
        "has_redis": False,
        "evidence_notes": [],
    }

    try:
        # 1. Fetch exact language byte counts
        lang_url = f"https://api.github.com/repos/{username}/{repo_name}/languages"
        lang_res = await client.get(lang_url, headers=headers)
        if lang_res.status_code == 200:
            repo_info["languages"] = lang_res.json()
            for lang in repo_info["languages"].keys():
                lang_lower = lang.lower()
                if "dockerfile" in lang_lower:
                    repo_info["has_docker"] = True
                    repo_info["detected_tech"].add("Docker")
                    repo_info["evidence_notes"].append(f"Dockerfile detected in repo '{repo_name}'")
                if "sql" in lang_lower:
                    repo_info["has_sql"] = True
                    repo_info["detected_tech"].add("SQL")

        # 2. Fetch root directory contents
        contents_url = f"https://api.github.com/repos/{username}/{repo_name}/contents"
        contents_res = await client.get(contents_url, headers=headers)
        if contents_res.status_code != 200:
            return repo_info

        root_items = contents_res.json()
        if not isinstance(root_items, list):
            return repo_info

        file_names = {item.get("name", "").lower(): item for item in root_items}

        # Check Docker
        if any(f in file_names for f in ["dockerfile", "docker-compose.yml", "docker-compose.yaml", "containerfile"]):
            repo_info["has_docker"] = True
            repo_info["detected_tech"].add("Docker")
            repo_info["detected_tech"].add("Docker Compose")
            repo_info["evidence_notes"].append(f"Docker configuration (Dockerfile/compose) in repo '{repo_name}'")

        # Check Database / SQL migrations
        if any(f in file_names for f in ["migrations", "schema.sql", "database.sql"]):
            repo_info["has_sql"] = True
            repo_info["detected_tech"].add("SQL")
            repo_info["evidence_notes"].append(f"Database schema / migrations found in repo '{repo_name}'")

        # Check CI/CD (.github folder)
        if ".github" in file_names:
            workflows_url = f"https://api.github.com/repos/{username}/{repo_name}/contents/.github/workflows"
            wf_res = await client.get(workflows_url, headers=headers)
            if wf_res.status_code == 200 and isinstance(wf_res.json(), list) and len(wf_res.json()) > 0:
                repo_info["has_cicd"] = True
                repo_info["detected_tech"].add("CI/CD")
                repo_info["detected_tech"].add("GitHub Actions")
                repo_info["evidence_notes"].append(f"CI/CD GitHub Actions workflows in repo '{repo_name}'")

        # Check & inspect package.json (Node/TypeScript)
        if "package.json" in file_names:
            raw_headers = {**headers, "Accept": "application/vnd.github.v3.raw"}
            pkg_url = file_names["package.json"].get("url") or f"https://api.github.com/repos/{username}/{repo_name}/contents/package.json"
            pkg_res = await client.get(pkg_url, headers=raw_headers)
            if pkg_res.status_code == 200:
                try:
                    pkg_data = json.loads(pkg_res.text)
                    deps = {**pkg_data.get("dependencies", {}), **pkg_data.get("devDependencies", {})}
                    for dep_name in deps.keys():
                        dep_clean = dep_name.lower().replace("@types/", "")
                        for keyword, canonical in KNOWN_TECH_MAP.items():
                            if keyword in dep_clean:
                                repo_info["detected_tech"].add(canonical)
                                repo_info["evidence_notes"].append(f"Dependency '{dep_name}' in repo '{repo_name}'")
                                if "redis" in keyword:
                                    repo_info["has_redis"] = True
                                if keyword in ("pg", "mysql", "mysql2", "prisma", "sequelize", "typeorm"):
                                    repo_info["has_sql"] = True
                except Exception:
                    pass

        # Check & inspect requirements.txt (Python)
        if "requirements.txt" in file_names:
            raw_headers = {**headers, "Accept": "application/vnd.github.v3.raw"}
            req_url = file_names["requirements.txt"].get("url") or f"https://api.github.com/repos/{username}/{repo_name}/contents/requirements.txt"
            req_res = await client.get(req_url, headers=raw_headers)
            if req_res.status_code == 200:
                for line in req_res.text.splitlines():
                    line_clean = line.strip().lower()
                    if not line_clean or line_clean.startswith("#"):
                        continue
                    pkg_token = re.split(r"[=<>~!]", line_clean)[0].strip()
                    for keyword, canonical in KNOWN_TECH_MAP.items():
                        if keyword == pkg_token or keyword in pkg_token:
                            repo_info["detected_tech"].add(canonical)
                            repo_info["evidence_notes"].append(f"Python package '{pkg_token}' in repo '{repo_name}'")
                            if "redis" in keyword:
                                repo_info["has_redis"] = True
                            if keyword in ("psycopg2", "asyncpg", "sqlalchemy", "mysqlclient"):
                                repo_info["has_sql"] = True

        # Check & inspect go.mod (Go)
        if "go.mod" in file_names:
            raw_headers = {**headers, "Accept": "application/vnd.github.v3.raw"}
            mod_url = file_names["go.mod"].get("url") or f"https://api.github.com/repos/{username}/{repo_name}/contents/go.mod"
            mod_res = await client.get(mod_url, headers=raw_headers)
            if mod_res.status_code == 200:
                for line in mod_res.text.splitlines():
                    line_lower = line.strip().lower()
                    for keyword, canonical in KNOWN_TECH_MAP.items():
                        if keyword in line_lower:
                            repo_info["detected_tech"].add(canonical)
                            repo_info["evidence_notes"].append(f"Go module containing '{keyword}' in repo '{repo_name}'")
                            if "redis" in keyword:
                                repo_info["has_redis"] = True
                            if "gorm" in keyword or "sql" in keyword:
                                repo_info["has_sql"] = True

    except Exception as e:
        print(f"[github_client] Repo inspection error on {username}/{repo_name}: {e}")

    return repo_info


async def fetch_github_profile_data(username_or_url: str) -> Dict[str, Any]:
    """
    Fetches public repositories, primary languages, commit activity,
    and conducts deep code/manifest inspection across top projects.
    """
    username = sanitize_github_username(username_or_url)
    if not username:
        return {
            "username": "",
            "repositories": [],
            "languages": [],
            "manifest_technologies": [],
            "code_evidence": [],
            "total_repos": 0,
            "error": "Invalid username",
        }

    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CareerLens-FastAPI-Service",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    repos_result: List[Dict[str, Any]] = []
    languages_set: Set[str] = set()
    manifest_tech_set: Set[str] = set()
    all_evidence_notes: List[str] = []
    total_stars = 0

    async with httpx.AsyncClient(timeout=12.0) as client:
        try:
            # 1. Fetch public repos
            repos_url = f"https://api.github.com/users/{username}/repos?per_page=30&sort=pushed"
            res = await client.get(repos_url, headers=headers)

            if res.status_code == 200:
                raw_repos = res.json()
                original_repos = [r for r in raw_repos if not r.get("fork")]

                # Select top original repos for deep code inspection (up to 8 repos)
                top_to_inspect = sorted(
                    original_repos,
                    key=lambda r: (r.get("stargazers_count", 0), r.get("pushed_at", "")),
                    reverse=True,
                )[:8]

                # Run parallel deep inspection on top repos
                inspection_tasks = [
                    inspect_repo_code(client, username, r.get("name", ""), headers)
                    for r in top_to_inspect
                    if r.get("name")
                ]
                inspection_results = await asyncio.gather(*inspection_tasks, return_exceptions=True)

                inspections_map: Dict[str, Dict[str, Any]] = {}
                for idx, r in enumerate(top_to_inspect):
                    r_name = r.get("name", "")
                    if idx < len(inspection_results) and isinstance(inspection_results[idx], dict):
                        inspections_map[r_name] = inspection_results[idx]

                for repo in original_repos:
                    r_name = repo.get("name", "")
                    primary_lang = repo.get("language")
                    if primary_lang:
                        languages_set.add(primary_lang)

                    stars = repo.get("stargazers_count", 0)
                    total_stars += stars

                    # Attach inspection details if available
                    insp = inspections_map.get(r_name, {})
                    repo_langs = list(insp.get("languages", {}).keys())
                    for l in repo_langs:
                        languages_set.add(l)

                    detected_tech = sorted(list(insp.get("detected_tech", set())))
                    for t in detected_tech:
                        manifest_tech_set.add(t)

                    for note in insp.get("evidence_notes", []):
                        all_evidence_notes.append(note)

                    repos_result.append({
                        "name": r_name,
                        "description": repo.get("description") or "",
                        "language": primary_lang or "Unknown",
                        "languages": repo_langs,
                        "stars": stars,
                        "pushed_at": repo.get("pushed_at", ""),
                        "html_url": repo.get("html_url", ""),
                        "inspected_technologies": detected_tech,
                        "has_docker": insp.get("has_docker", False),
                        "has_cicd": insp.get("has_cicd", False),
                        "has_sql": insp.get("has_sql", False),
                        "has_redis": insp.get("has_redis", False),
                    })

            elif res.status_code == 404:
                return {
                    "username": username,
                    "repositories": [],
                    "languages": [],
                    "manifest_technologies": [],
                    "code_evidence": [],
                    "total_repos": 0,
                    "error": f"GitHub user '{username}' not found",
                }
            elif res.status_code == 403:
                return {
                    "username": username,
                    "repositories": [],
                    "languages": [],
                    "manifest_technologies": [],
                    "code_evidence": [],
                    "total_repos": 0,
                    "error": "GitHub API rate limit exceeded",
                }

        except Exception as e:
            print(f"[github_client] Network error fetching repos for {username}: {e}")
            return {
                "username": username,
                "repositories": [],
                "languages": [],
                "manifest_technologies": [],
                "code_evidence": [],
                "total_repos": 0,
                "error": str(e),
            }

    return {
        "username": username,
        "repositories": repos_result,
        "languages": sorted(list(languages_set)),
        "manifest_technologies": sorted(list(manifest_tech_set)),
        "code_evidence": all_evidence_notes[:30],
        "total_repos": len(repos_result),
        "total_stars": total_stars,
        "error": None,
    }
