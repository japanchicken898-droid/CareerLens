/**
 * Next.js API Route: /api/github/[username]
 *
 * Fetches real public GitHub data server-side.
 * Uses GITHUB_TOKEN env var if available (higher rate limit).
 * Never exposes the token to the browser.
 *
 * Returns: GitHubData (see types/extraction.ts)
 */

import { NextRequest, NextResponse } from "next/server";
import type { GitHubRepository, GitHubUserProfile, GitHubActivity } from "@/types/extraction";

const GITHUB_API = "https://api.github.com";

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchGitHubJSON<T>(path: string): Promise<{ data: T | null; error: string | null; rateLimited: boolean }> {
  try {
    const res = await fetch(`${GITHUB_API}${path}`, {
      headers: getHeaders(),
      next: { revalidate: 300 }, // cache for 5 min in Next.js data cache
    });

    if (res.status === 404) {
      return { data: null, error: "GitHub profile not found. Please check the URL.", rateLimited: false };
    }
    if (res.status === 403 || res.status === 429) {
      return { data: null, error: null, rateLimited: true };
    }
    if (!res.ok) {
      return { data: null, error: `GitHub API error: ${res.status} ${res.statusText}`, rateLimited: false };
    }

    const json = await res.json() as T;
    return { data: json, error: null, rateLimited: false };
  } catch {
    return { data: null, error: "Network error while contacting GitHub API.", rateLimited: false };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRepo(repo: any): GitHubRepository {
  return {
    name: repo.name ?? "",
    fullName: repo.full_name ?? "",
    url: repo.html_url ?? "",
    description: repo.description ?? null,
    primaryLanguage: repo.language ?? null,
    languages: [],           // populated separately via languages API call
    stars: repo.stargazers_count ?? 0,
    forks: repo.forks_count ?? 0,
    openIssues: repo.open_issues_count ?? 0,
    topics: Array.isArray(repo.topics) ? repo.topics : [],
    defaultBranch: repo.default_branch ?? "main",
    createdAt: repo.created_at ?? "",
    updatedAt: repo.updated_at ?? "",
    pushedAt: repo.pushed_at ?? null,
    license: repo.license?.name ?? null,
    hasReadme: false,        // checked separately
    readmeContent: null,     // fetched separately for top repos
    isFork: repo.fork ?? false,
    isArchived: repo.archived ?? false,
    size: repo.size ?? 0,
  };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  const { username } = await context.params;

  if (!username || typeof username !== "string" || !/^[a-zA-Z0-9\-_]+$/.test(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username.", rateLimited: false },
      { status: 400 }
    );
  }

  // 1. Fetch user profile
  const userResult = await fetchGitHubJSON<Record<string, unknown>>(`/users/${username}`);
  if (userResult.rateLimited) {
    return NextResponse.json({
      username,
      profile: null,
      repositories: [],
      activity: null,
      fetchError: "GitHub data could not be retrieved right now due to rate limiting. Please try again later.",
      rateLimited: true,
    });
  }
  if (userResult.error) {
    return NextResponse.json({
      username,
      profile: null,
      repositories: [],
      activity: null,
      fetchError: userResult.error,
      rateLimited: false,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = userResult.data as any;
  const profile: GitHubUserProfile = {
    username: u.login ?? username,
    displayName: u.name ?? null,
    bio: u.bio ?? null,
    avatarUrl: u.avatar_url ?? null,
    profileUrl: u.html_url ?? `https://github.com/${username}`,
    publicRepos: u.public_repos ?? 0,
    followers: u.followers ?? 0,
    following: u.following ?? 0,
    company: u.company ?? null,
    location: u.location ?? null,
    blog: u.blog ?? null,
    createdAt: u.created_at ?? null,
    updatedAt: u.updated_at ?? null,
  };

  // 2. Fetch public repositories (up to 100)
  const reposResult = await fetchGitHubJSON<unknown[]>(
    `/users/${username}/repos?type=public&sort=pushed&per_page=100`
  );
  if (reposResult.rateLimited) {
    return NextResponse.json({
      username,
      profile,
      repositories: [],
      activity: null,
      fetchError: "GitHub data could not be retrieved right now due to rate limiting. Please try again later.",
      rateLimited: true,
    });
  }

  const rawRepos = reposResult.data ?? [];
  const repositories: GitHubRepository[] = rawRepos.map(mapRepo);

  // 3. For top 6 non-fork repos, deeply inspect languages, README, and code manifests
  const topRepos = [...repositories]
    .filter((r) => !r.isFork)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6);

  await Promise.allSettled(
    topRepos.map(async (repo) => {
      const fullName = repo.fullName;
      const detectedTech = new Set<string>();

      // Languages
      const langResult = await fetchGitHubJSON<Record<string, number>>(`/repos/${fullName}/languages`);
      if (langResult.data && !langResult.rateLimited) {
        repo.languages = Object.keys(langResult.data);
        for (const l of repo.languages) {
          if (l.toLowerCase().includes("dockerfile")) {
            repo.hasDocker = true;
            detectedTech.add("Docker");
          }
          if (l.toLowerCase().includes("sql")) {
            repo.hasSql = true;
            detectedTech.add("SQL");
          }
        }
      }

      // Root Contents inspection (Dockerfile, package.json, requirements.txt, go.mod, .github)
      const contentsResult = await fetchGitHubJSON<Array<{ name: string; url: string; download_url?: string }>>(
        `/repos/${fullName}/contents`
      );
      if (contentsResult.data && Array.isArray(contentsResult.data) && !contentsResult.rateLimited) {
        const fileNames = new Set(contentsResult.data.map((f) => f.name.toLowerCase()));

        // Docker inspection
        if (fileNames.has("dockerfile") || fileNames.has("docker-compose.yml") || fileNames.has("docker-compose.yaml")) {
          repo.hasDocker = true;
          detectedTech.add("Docker");
          detectedTech.add("Containerization");
        }

        // Database schema / migrations
        if (fileNames.has("migrations") || fileNames.has("schema.sql") || fileNames.has("database.sql")) {
          repo.hasSql = true;
          detectedTech.add("SQL");
          detectedTech.add("Relational Databases");
        }

        // CI/CD Workflows
        if (fileNames.has(".github")) {
          const wfResult = await fetchGitHubJSON<unknown[]>(`/repos/${fullName}/contents/.github/workflows`);
          if (wfResult.data && Array.isArray(wfResult.data) && wfResult.data.length > 0) {
            repo.hasCicd = true;
            detectedTech.add("CI/CD");
            detectedTech.add("GitHub Actions");
          }
        }

        // package.json inspection
        const pkgItem = contentsResult.data.find((f) => f.name.toLowerCase() === "package.json");
        if (pkgItem && pkgItem.download_url) {
          try {
            const rawRes = await fetch(pkgItem.download_url, { next: { revalidate: 300 } });
            if (rawRes.ok) {
              const pkgJson = await rawRes.json() as Record<string, unknown>;
              const allDeps = {
                ...(pkgJson.dependencies as Record<string, string> || {}),
                ...(pkgJson.devDependencies as Record<string, string> || {}),
              };
              for (const dep of Object.keys(allDeps)) {
                const d = dep.toLowerCase();
                if (d.includes("express")) detectedTech.add("Express.js");
                if (d.includes("fastify") || d.includes("nestjs")) detectedTech.add("Backend APIs");
                if (d.includes("react")) detectedTech.add("React.js");
                if (d.includes("next")) detectedTech.add("Next.js");
                if (d.includes("redis")) { repo.hasRedis = true; detectedTech.add("Redis"); }
                if (d.includes("pg") || d.includes("postgres") || d.includes("mysql") || d.includes("prisma") || d.includes("typeorm")) {
                  repo.hasSql = true;
                  detectedTech.add("SQL");
                  detectedTech.add("Relational Databases");
                }
                if (d.includes("socket.io") || d.includes("websocket")) detectedTech.add("WebSockets");
                if (d.includes("tailwind")) detectedTech.add("TailwindCSS");
                if (d.includes("typescript")) detectedTech.add("TypeScript");
                if (d.includes("jest") || d.includes("mocha") || d.includes("cypress")) detectedTech.add("Unit Testing");
              }
            }
          } catch {
            // ignore JSON parse or network errors
          }
        }

        // requirements.txt inspection
        const reqItem = contentsResult.data.find((f) => f.name.toLowerCase() === "requirements.txt");
        if (reqItem && reqItem.download_url) {
          try {
            const rawRes = await fetch(reqItem.download_url, { next: { revalidate: 300 } });
            if (rawRes.ok) {
              const text = await rawRes.text();
              const textLower = text.toLowerCase();
              if (textLower.includes("fastapi")) { detectedTech.add("FastAPI"); detectedTech.add("REST APIs"); }
              if (textLower.includes("flask")) detectedTech.add("Flask");
              if (textLower.includes("django")) detectedTech.add("Django");
              if (textLower.includes("redis")) { repo.hasRedis = true; detectedTech.add("Redis"); }
              if (textLower.includes("psycopg") || textLower.includes("sqlalchemy") || textLower.includes("mysql")) {
                repo.hasSql = true;
                detectedTech.add("SQL");
                detectedTech.add("Relational Databases");
              }
              if (textLower.includes("pytest")) detectedTech.add("PyTest");
              if (textLower.includes("docker")) { repo.hasDocker = true; detectedTech.add("Docker"); }
            }
          } catch {
            // ignore
          }
        }

        // go.mod inspection
        const goModItem = contentsResult.data.find((f) => f.name.toLowerCase() === "go.mod");
        if (goModItem && goModItem.download_url) {
          try {
            const rawRes = await fetch(goModItem.download_url, { next: { revalidate: 300 } });
            if (rawRes.ok) {
              const text = (await rawRes.text()).toLowerCase();
              if (text.includes("gin") || text.includes("fiber")) detectedTech.add("REST APIs");
              if (text.includes("redis")) { repo.hasRedis = true; detectedTech.add("Redis"); }
              if (text.includes("gorm") || text.includes("sql")) { repo.hasSql = true; detectedTech.add("SQL"); }
              if (text.includes("websocket")) detectedTech.add("WebSockets");
            }
          } catch {
            // ignore
          }
        }
      }

      repo.inspectedTechnologies = Array.from(detectedTech);

      // README
      const readmeResult = await fetchGitHubJSON<{ content?: string; encoding?: string }>(
        `/repos/${fullName}/readme`
      );
      if (readmeResult.data && !readmeResult.rateLimited) {
        repo.hasReadme = true;
        const content = readmeResult.data.content;
        const encoding = readmeResult.data.encoding;
        if (content && encoding === "base64") {
          try {
            repo.readmeContent = Buffer.from(content.replace(/\n/g, ""), "base64").toString("utf-8").slice(0, 3000);
          } catch {
            repo.readmeContent = null;
          }
        }
      }
    })
  );

  // 4. Build activity signals from available data
  const now = new Date();
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

  const recentlyPushedRepos = repositories
    .filter((r) => r.pushedAt && new Date(r.pushedAt) > ninetyDaysAgo)
    .map((r) => r.name);

  const lastPushDates = repositories
    .filter((r) => r.pushedAt)
    .map((r) => r.pushedAt as string)
    .sort()
    .reverse();

  const languageDistribution: Record<string, number> = {};
  for (const repo of topRepos) {
    if (repo.primaryLanguage) {
      languageDistribution[repo.primaryLanguage] =
        (languageDistribution[repo.primaryLanguage] ?? 0) + 1;
    }
  }

  const activity: GitHubActivity = {
    recentlyPushedRepos,
    lastPushDate: lastPushDates[0] ?? null,
    totalPublicRepos: profile.publicRepos,
    languageDistribution,
  };

  return NextResponse.json({
    username,
    profile,
    repositories,
    activity,
    fetchError: null,
    rateLimited: false,
  });
}
