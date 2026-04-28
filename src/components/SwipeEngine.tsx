"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Loader2, RefreshCw, X } from "lucide-react";
import { useCallback, useRef } from "react";
import {
  RepositoryCard,
  type RepositoryCardHandle,
} from "@/components/RepositoryCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGitHubRepos } from "@/hooks/useGitHubRepos";
import { addMatch } from "@/lib/matches-storage";

const LANGUAGES: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "TypeScript", value: "typescript" },
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Rust", value: "rust" },
];

export function SwipeEngine() {
  const cardRef = useRef<RepositoryCardHandle>(null);
  const {
    language,
    setLanguage,
    currentRepo,
    loading,
    fetchingMore,
    error,
    exhausted,
    advance,
    refetchLanguage,
    queueLength,
    index,
  } = useGitHubRepos();

  const handleSwipe = useCallback(
    (direction: "like" | "pass") => {
      if (direction === "like" && currentRepo) {
        addMatch(currentRepo);
      }
      advance();
    },
    [advance, currentRepo]
  );

  const waitingForMore =
    !currentRepo && fetchingMore && queueLength > 0 && index >= queueLength;

  return (
    <div className="flex min-h-screen flex-col px-4 pb-10 pt-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            GitMatch
          </h1>
          <p className="text-sm text-slate-400">Swipe repos. Save the ones you want.</p>
        </div>
        <Link
          href="/matches"
          aria-label="Matches"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "border-slate-600 bg-slate-900/80"
          )}
        >
          <Heart className="size-5 text-rose-400" />
        </Link>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {LANGUAGES.map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => setLanguage(opt.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              language === opt.value
                ? "bg-slate-100 text-slate-950"
                : "border border-slate-700 bg-slate-900/80 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center">
        {loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-slate-300">
            <Loader2 className="size-12 animate-spin text-slate-400" aria-hidden />
            <p className="text-sm font-medium">Finding repositories…</p>
          </div>
        )}

        {!loading && error ? (
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-red-900/50 bg-red-950/40 px-6 py-10 text-center">
            <p className="text-sm text-red-200">{error}</p>
            <Button type="button" variant="outline" onClick={() => refetchLanguage()}>
              Try again
            </Button>
          </div>
        ) : null}

        {!loading && !error && exhausted && queueLength === 0 ? (
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-12 text-center shadow-inner">
            <p className="text-lg font-semibold text-slate-100">Nothing here yet</p>
            <p className="text-sm text-slate-400">
              Change language or reload to fetch another batch from GitHub.
            </p>
            <Button type="button" onClick={() => refetchLanguage()} className="gap-2">
              <RefreshCw className="size-4" />
              Reload feed
            </Button>
          </div>
        ) : null}

        {!loading &&
        !error &&
        !fetchingMore &&
        exhausted &&
        queueLength > 0 &&
        index >= queueLength ? (
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900/80 px-6 py-12 text-center shadow-inner">
            <p className="text-lg font-semibold text-slate-100">
              You&apos;ve seen them all
            </p>
            <p className="text-sm text-slate-400">
              Pick another language or reload for more repos.
            </p>
            <Button type="button" onClick={() => refetchLanguage()} className="gap-2">
              <RefreshCw className="size-4" />
              Load more
            </Button>
          </div>
        ) : null}

        {waitingForMore ? (
          <div className="flex flex-col items-center gap-3 py-12 text-slate-300">
            <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
            <p className="text-sm">Loading more cards…</p>
          </div>
        ) : null}

        {!loading && !error && currentRepo ? (
          <div className="relative w-full max-w-md pb-28">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRepo.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <RepositoryCard
                  ref={cardRef}
                  repo={currentRepo}
                  onSwipe={handleSwipe}
                />
              </motion.div>
            </AnimatePresence>

            <div className="fixed bottom-0 left-0 right-0 flex justify-center gap-6 border-t border-slate-800/80 bg-slate-950/95 px-6 py-4 backdrop-blur-md">
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                className="size-14 rounded-full border-red-500/40 bg-red-950/40 text-red-400 hover:bg-red-950/60"
                aria-label="Pass"
                onClick={() => void cardRef.current?.swipePass()}
              >
                <X className="size-7" />
              </Button>
              <Button
                type="button"
                size="icon-lg"
                className="size-14 rounded-full bg-emerald-600 text-white hover:bg-emerald-500"
                aria-label="Like"
                onClick={() => void cardRef.current?.swipeLike()}
              >
                <Heart className="size-7 fill-current" />
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
