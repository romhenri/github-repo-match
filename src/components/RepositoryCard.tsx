"use client";

import {
  motion,
  useAnimationControls,
  useMotionValue,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { CalendarDays, Code2, GitFork, GitPullRequest, Star, User } from "lucide-react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
} from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { RepoCard } from "@/types/repo";

const THRESHOLD = 100;

export type RepositoryCardHandle = {
  swipeLike: () => Promise<void>;
  swipePass: () => Promise<void>;
};

type Props = {
  repo: RepoCard;
  onSwipe: (direction: "like" | "pass") => void;
};

export const RepositoryCard = forwardRef<RepositoryCardHandle, Props>(
  function RepositoryCard({ repo, onSwipe }, ref) {
    const controls = useAnimationControls();
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-8, 8]);
    const leftOverlay = useTransform(x, [-160, 0], [0.45, 0]);
    const rightOverlay = useTransform(x, [0, 160], [0, 0.45]);

    const finish = useCallback(
      async (dir: "like" | "pass") => {
        const target = dir === "like" ? 520 : -520;
        await controls.start({
          x: target,
          opacity: 0,
          transition: { type: "tween", duration: 0.22, ease: "easeIn" },
        });
        onSwipe(dir);
      },
      [controls, onSwipe]
    );

    useImperativeHandle(
      ref,
      () => ({
        swipeLike: () => finish("like"),
        swipePass: () => finish("pass"),
      }),
      [finish]
    );

    useEffect(() => {
      controls.set({ x: 0, opacity: 1 });
      x.set(0);
    }, [repo.id, controls, x]);

    const lastUpdate = new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(repo.updated_at));

    return (
      <motion.div
        drag="x"
        dragElastic={0.92}
        dragConstraints={{ left: 0, right: 0 }}
        style={{ x, rotate }}
        animate={controls}
        onDragEnd={async (_, info) => {
          if (info.offset.x > THRESHOLD) {
            await finish("like");
          } else if (info.offset.x < -THRESHOLD) {
            await finish("pass");
          } else {
            await controls.start({
              x: 0,
              opacity: 1,
              transition: { type: "spring", stiffness: 400, damping: 30 },
            });
          }
        }}
        className="relative w-full touch-pan-y"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-red-500/40"
          style={{ opacity: leftOverlay }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-emerald-500/40"
          style={{ opacity: rightOverlay }}
        />
        <Card className="relative overflow-hidden rounded-2xl border-slate-700/90 bg-slate-900/95 shadow-xl shadow-black/40">
          <CardHeader className="flex flex-row items-start gap-4 pb-2">
            <Image
              src={repo.owner_avatar_url}
              alt=""
              width={64}
              height={64}
              className="size-16 shrink-0 rounded-2xl border border-slate-600/80 object-cover"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="truncate font-semibold text-slate-100">{repo.full_name}</p>
              <p className="inline-flex items-center gap-1 text-xs text-slate-500">
                <User className="size-3.5" aria-hidden />
                @{repo.owner_login}
              </p>
              <p className="line-clamp-4 text-sm leading-relaxed text-slate-400">
                {repo.description?.trim() || "No description provided."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 border-t border-slate-700/70 pt-4 text-sm text-slate-300">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <Star className="size-4 text-amber-400" aria-hidden />
                {repo.stargazers_count.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GitFork className="size-4 text-cyan-400" aria-hidden />
                {repo.forks_count.toLocaleString()}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <GitPullRequest className="size-4 text-violet-400" aria-hidden />
                {repo.open_issues_count.toLocaleString()} open
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              {repo.language ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/70 px-2 py-1">
                  <Code2 className="size-3.5 text-slate-500" aria-hidden />
                  {repo.language}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/70 px-2 py-1">
                <CalendarDays className="size-3.5 text-slate-500" aria-hidden />
                Updated {lastUpdate}
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);
