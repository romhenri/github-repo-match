"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RepoCard } from "@/types/repo";

type ApiResponse = { repos: RepoCard[]; page: number };
const MAX_PAGE = 10;

function dedupeById(list: RepoCard[]): RepoCard[] {
  const seen = new Set<number>();
  const out: RepoCard[] = [];
  for (const r of list) {
    if (seen.has(r.id)) continue;
    seen.add(r.id);
    out.push(r);
  }
  return out;
}

export function useGitHubRepos() {
  const [language, setLanguage] = useState("");
  const [repos, setRepos] = useState<RepoCard[]>([]);
  const [index, setIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exhausted, setExhausted] = useState(false);
  const langRef = useRef(language);

  useEffect(() => {
    langRef.current = language;
  }, [language]);

  const fetchRepos = useCallback(
    async (pageNum: number, lang: string, append: boolean) => {
      const isFirst = !append;
      if (isFirst) {
        setLoading(true);
      } else {
        setFetchingMore(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams();
        params.set("page", String(pageNum));
        if (lang) params.set("language", lang);
        const res = await fetch(`/api/repos?${params.toString()}`);
        const body = (await res.json()) as ApiResponse & { error?: string };

        if (!res.ok) {
          setError(body.error ?? "Request failed");
          if (isFirst) setRepos([]);
          return;
        }

        const batch = body.repos ?? [];
        if (isFirst) {
          setRepos(batch);
          setIndex(0);
          setPage(pageNum);
          setExhausted(batch.length === 0);
        } else {
          setRepos((prev) => dedupeById([...prev, ...batch]));
          setPage(pageNum);
          if (batch.length === 0) {
            setExhausted(true);
          } else {
            setExhausted(false);
          }
        }
      } finally {
        if (isFirst) {
          setLoading(false);
        } else {
          setFetchingMore(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const initialPage = Math.floor(Math.random() * 5) + 1;
    const timer = window.setTimeout(() => {
      void fetchRepos(initialPage, language, false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [language, fetchRepos]);

  const currentRepo = useMemo(
    () => repos[index] ?? null,
    [repos, index]
  );

  const advance = useCallback(() => {
    setIndex((i) => i + 1);
  }, []);

  useEffect(() => {
    if (loading || fetchingMore) return;
    if (repos.length === 0) return;
    if (index < repos.length) return;

    const nextPage = page + 1;
    if (nextPage > MAX_PAGE) {
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchRepos(nextPage, langRef.current, true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [
    index,
    repos.length,
    loading,
    fetchingMore,
    page,
    fetchRepos,
  ]);

  const refetchLanguage = useCallback(() => {
    setExhausted(false);
    const initialPage = Math.floor(Math.random() * 5) + 1;
    void fetchRepos(initialPage, language, false);
  }, [fetchRepos, language]);

  const isAtPageLimit = page >= MAX_PAGE && index >= repos.length;
  const isExhausted = exhausted || isAtPageLimit;

  return {
    language,
    setLanguage,
    currentRepo,
    loading,
    fetchingMore,
    error,
    exhausted: isExhausted,
    advance,
    refetchLanguage,
    queueLength: repos.length,
    index,
  };
}
