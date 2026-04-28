import { NextResponse } from "next/server";
import type { RepoCard } from "@/types/repo";

type GitHubSearchItem = {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  owner: { login: string; avatar_url: string };
  html_url: string;
  updated_at: string;
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function mapItem(item: GitHubSearchItem): RepoCard {
  return {
    id: item.id,
    name: item.name,
    full_name: item.full_name,
    description: item.description,
    stargazers_count: item.stargazers_count,
    forks_count: item.forks_count,
    open_issues_count: item.open_issues_count,
    language: item.language,
    owner_login: item.owner.login,
    owner_avatar_url: item.owner.avatar_url,
    html_url: item.html_url,
    updated_at: item.updated_at,
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language")?.trim() ?? "";
  const pageRaw = searchParams.get("page");
  const page = Math.max(1, Math.min(10, Number(pageRaw) || 1));

  const parts = ["stars:>100", "is:public"];
  if (language) {
    parts.push(`language:${language}`);
  }
  const q = parts.join(" ");

  const ghUrl = new URL("https://api.github.com/search/repositories");
  ghUrl.searchParams.set("q", q);
  ghUrl.searchParams.set("sort", "stars");
  ghUrl.searchParams.set("order", "desc");
  ghUrl.searchParams.set("page", String(page));
  ghUrl.searchParams.set("per_page", "30");

  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(ghUrl.toString(), { headers, next: { revalidate: 0 } });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { error: "GitHub search failed", detail: text.slice(0, 200) },
      { status: res.status }
    );
  }

  const data = (await res.json()) as { items: GitHubSearchItem[] };
  const items = shuffle((data.items ?? []).map(mapItem));

  return NextResponse.json({ repos: items, page });
}
