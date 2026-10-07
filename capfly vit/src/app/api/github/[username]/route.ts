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

  // 3. For top 5 non-fork repos by stars, fetch languages + README
  const topRepos = [...repositories]
    .filter((r) => !r.isFork)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 5);

  await Promise.allSettled(
    topRepos.map(async (repo) => {
      const fullName = repo.fullName;

      // Languages
      const langResult = await fetchGitHubJSON<Record<string, number>>(`/repos/${fullName}/languages`);
      if (langResult.data && !langResult.rateLimited) {
        repo.languages = Object.keys(langResult.data);
      }

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
            // Decode base64 safely
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
