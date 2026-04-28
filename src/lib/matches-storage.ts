import type { RepoCard } from "@/types/repo";

const STORAGE_KEY = "gitmatch:likes";

function readAll(): RepoCard[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is RepoCard =>
        x &&
        typeof x === "object" &&
        typeof (x as RepoCard).id === "number" &&
        typeof (x as RepoCard).full_name === "string"
    );
  } catch {
    return [];
  }
}

function writeAll(repos: RepoCard[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(repos));
}

export function getMatches(): RepoCard[] {
  return readAll();
}

export function addMatch(repo: RepoCard): RepoCard[] {
  const all = readAll();
  if (all.some((r) => r.id === repo.id)) return all;
  const next = [repo, ...all];
  writeAll(next);
  return next;
}

export function removeMatch(id: number): RepoCard[] {
  const next = readAll().filter((r) => r.id !== id);
  writeAll(next);
  return next;
}
