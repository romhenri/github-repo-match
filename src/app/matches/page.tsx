"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getMatches, removeMatch } from "@/lib/matches-storage";
import type { RepoCard } from "@/types/repo";

export default function MatchesPage() {
  const [items, setItems] = useState<RepoCard[]>(() => getMatches());

  const onRemove = (id: number) => {
    setItems(removeMatch(id));
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-8">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back"
          className={cn(
            buttonVariants({ variant: "outline", size: "icon" }),
            "shrink-0"
          )}
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Matches</h1>
          <p className="text-sm text-slate-400">Repos you liked</p>
        </div>
      </header>

      {items.length === 0 ? (
        <Card className="border-slate-700/80 bg-slate-900/80 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">No matches yet</CardTitle>
            <CardDescription className="text-slate-400">
              Swipe right on repos on the home feed to save them here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "default" }), "flex w-full")}
            >
              Go swipe
            </Link>
          </CardContent>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((repo) => (
            <li key={repo.id}>
              <Card className="border-slate-700/80 bg-slate-900/80 shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="truncate text-base">
                        {repo.full_name}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 text-slate-400">
                        {repo.description ?? "No description"}
                      </CardDescription>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Open on GitHub"
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
                      >
                        <ExternalLink className="size-4" />
                      </a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        onClick={() => onRemove(repo.id)}
                        aria-label="Remove"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>{repo.stargazers_count.toLocaleString()} stars</span>
                  {repo.language ? <span>{repo.language}</span> : null}
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
