/**
 * Roadmap Progress Persistence
 *
 * Persists milestone completion state to localStorage.
 * Keyed by roadmapId so different role analyses don't bleed into each other.
 * No server required.
 */

const STORAGE_KEY_PREFIX = "careerlens_roadmap_progress_";

export function getStorageKey(roadmapId: string): string {
  return `${STORAGE_KEY_PREFIX}${roadmapId}`;
}

/** Load the set of manually-completed milestone IDs for a roadmap */
export function loadCompletedMilestones(roadmapId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(getStorageKey(roadmapId));
    if (!raw) return new Set();
    const arr: string[] = JSON.parse(raw);
    return new Set(arr);
  } catch {
    return new Set();
  }
}

/** Save completed milestone IDs */
export function saveCompletedMilestones(roadmapId: string, completedIds: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(getStorageKey(roadmapId), JSON.stringify(Array.from(completedIds)));
  } catch {
    // Ignore storage errors
  }
}

/** Toggle a milestone's completion state; returns new set */
export function toggleMilestone(roadmapId: string, milestoneId: string): Set<string> {
  const current = loadCompletedMilestones(roadmapId);
  if (current.has(milestoneId)) {
    current.delete(milestoneId);
  } else {
    current.add(milestoneId);
  }
  saveCompletedMilestones(roadmapId, current);
  return new Set(current);
}

/** Calculate progress from milestones + manually completed */
export function calculateProgress(
  milestones: { id: string; status: string }[],
  manuallyCompleted: Set<string>
): { completed: number; total: number; percentage: number; manuallyCompleted: string[] } {
  if (milestones.length === 0) {
    return { completed: 0, total: 0, percentage: 0, manuallyCompleted: [] };
  }

  const completedSet = new Set<string>();
  for (const m of milestones) {
    if (m.status === "COMPLETED" || manuallyCompleted.has(m.id)) {
      completedSet.add(m.id);
    }
  }

  const completed = completedSet.size;
  const total = milestones.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { completed, total, percentage, manuallyCompleted: Array.from(manuallyCompleted) };
}
