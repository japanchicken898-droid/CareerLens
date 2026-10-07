/**
 * GitHub Client Service (browser-side)
 *
 * Calls the internal Next.js API route /api/github/[username].
 * Parses the GitHub URL to extract the username.
 * Returns typed GitHubData.
 */

import type { GitHubData } from "@/types/extraction";

export function extractUsernameFromGitHubUrl(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    if (!url.hostname.toLowerCase().includes("github.com")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    return null;
  }
}

export async function fetchGitHubData(githubUrl: string): Promise<GitHubData> {
  const username = extractUsernameFromGitHubUrl(githubUrl);

  if (!username) {
    return {
      username: "",
      profile: null,
      repositories: [],
      activity: null,
      fetchError: "Could not extract a username from the provided GitHub URL.",
      rateLimited: false,
    };
  }

  try {
    const res = await fetch(`/api/github/${encodeURIComponent(username)}`, {
      method: "GET",
    });

    if (!res.ok) {
      return {
        username,
        profile: null,
        repositories: [],
        activity: null,
        fetchError: `GitHub API request failed (${res.status}).`,
        rateLimited: false,
      };
    }

    const data = (await res.json()) as GitHubData;
    return data;
  } catch {
    return {
      username,
      profile: null,
      repositories: [],
      activity: null,
      fetchError: "Network error. Unable to reach the GitHub data service.",
      rateLimited: false,
    };
  }
}
