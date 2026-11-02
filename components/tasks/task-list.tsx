"use client";

import type { inferRouterOutputs } from "@trpc/server";
import { AlertTriangle, ArrowUp, Edit3, Loader2, Plus, Radar, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppRouter } from "@/server/routers/_app";
import { trpc } from "@/lib/trpc";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type Task = RouterOutputs["task"]["getInfiniteTasks"]["items"][number];
type TaskPage = RouterOutputs["task"]["getInfiniteTasks"];

const PAGE_SIZE = 4;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function TaskCard({ task, onDelete }: { task: Task; onDelete: (task: Task) => void }) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-cyan-500/25 bg-card/80 shadow-[0_0_30px_rgba(0,240,255,0.04)] backdrop-blur-sm transition-colors hover:border-cyan-400/55">
      <div className="absolute inset-y-0 left-0 w-px bg-cyan-400/50 opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="gap-3 pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg leading-tight text-cyan-50">{task.titulo}</CardTitle>
          <Badge variant="outline" className="shrink-0 border-cyan-500/35 font-mono text-[10px] uppercase tracking-wider text-cyan-300">
            live
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider text-slate-500">
          <span className="rounded border border-white/10 px-2 py-1">{task.id}</span>
          <span className="rounded border border-white/10 px-2 py-1">{formatDate(task.dataCriacao)}</span>
        </div>
      </CardHeader>
      <CardContent className="min-h-16 flex-1">
        <p className="font-mono text-sm leading-6 text-slate-400">{task.descricao || "No description attached to this task."}</p>
      </CardContent>
      <CardFooter className="justify-end gap-2 border-t border-white/5 pt-4">
        <Button
          render={<Link href={`/tasks/${task.id}`} aria-label={`Edit ${task.titulo}`} />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="font-sans text-slate-400 hover:text-cyan-200"
        >
          <Edit3 />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="font-sans text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 cursor-pointer" onClick={() => onDelete(task)}>
          <Trash2 />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}

export function TaskList({ initialPage }: { initialPage: TaskPage }) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFetchingNextPageRef = useRef(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const utils = trpc.useUtils();
  const tasksQuery = trpc.task.getInfiniteTasks.useInfiniteQuery(
    { limit: PAGE_SIZE },
    {
      initialData: { pages: [initialPage], pageParams: [null] },
      staleTime: 30_000,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    },
  );
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = tasksQuery;
  const deleteMutation = trpc.task.delete.useMutation({
    onSuccess: async () => {
      await utils.task.getInfiniteTasks.invalidate();
      toast.success("Task deleted", { description: "The task was removed from the local matrix." });
      setSelectedTask(null);
    },
    onError: (error) => toast.error("Delete failed", { description: error.message }),
  });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting || isFetchingNextPage || isFetchingNextPageRef.current) return;
        isFetchingNextPageRef.current = true;
        void fetchNextPage().finally(() => {
          isFetchingNextPageRef.current = false;
        });
      },
      { rootMargin: "280px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 560);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const tasks = Array.from(
    new Map(
      (tasksQuery.data?.pages.flatMap((page) => page.items) ?? []).map((task) => [task.id, task]),
    ).values(),
  );

  return (
    <>
      <div className="mb-8 flex flex-col gap-5 border-b border-cyan-500/15 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-cyan-400">
            <Radar className="size-4" />
            Task registry / online
          </div>
          <h1 className="font-mono text-3xl font-semibold tracking-tight text-white sm:text-5xl">NEXUS CONTROL</h1>
          <p className="font-mono mt-3 max-w-xl text-sm leading-6 text-slate-400">A focused command surface for the work moving through your network.</p>
        </div>
        <Button
          render={<Link href="/tasks/new" />}
          nativeButton={false}
          size="lg"
          className="font-sans w-full shadow-[0_0_22px_rgba(0,240,255,0.18)] sm:w-auto"
        >
          <Plus />
          New task
        </Button>
      </div>

      <div className="mb-5 flex items-center justify-between font-mono text-[11px] uppercase tracking-widest text-slate-500">
        <span>Active queue</span>
        <span>{tasks.length.toString().padStart(2, "0")} loaded</span>
      </div>

      {tasksQuery.isError ? (
        <div className="flex items-center gap-3 border border-rose-500/30 bg-rose-500/5 p-5 text-sm text-rose-300">
          <AlertTriangle className="font-mono size-5 shrink-0" />
          Unable to establish a link with the task registry.
        </div>
      ) : tasks.length === 0 ? (
        <div className="border border-dashed border-cyan-500/25 bg-cyan-500/3 p-12 text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-cyan-300">Queue is clear</p>
          <p className="mt-2 text-sm text-slate-500">Create a task to start a new operation.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={setSelectedTask} />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="flex min-h-20 items-center justify-center py-6">
        {tasksQuery.isFetchingNextPage ? (
          <div className="flex w-full max-w-sm items-center gap-3">
            <Skeleton className="h-2 flex-1 bg-cyan-500/15" />
            <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan-400">
              <Loader2 className="size-4 animate-spin" />
              Scanning
            </span>
            <Skeleton className="h-2 flex-1 bg-cyan-500/15" />
          </div>
        ) : tasksQuery.hasNextPage ? null : tasks.length > 0 ? (
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-slate-600">End of transmission</span>
        ) : null}
      </div>

      <AlertDialog open={selectedTask !== null} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <AlertDialogContent className="border-rose-500/30 bg-[#0a101b]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono">
              This will permanently remove <span className="font-mono text-cyan-300">{selectedTask?.titulo}</span> from the local registry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-sans cursor-pointer" disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              className="font-sans cursor-pointer"
              onClick={() => selectedTask && deleteMutation.mutate({ id: selectedTask.id })}
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
              Confirm delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showBackToTop ? (
        <Button
          type="button"
          variant="outline"
          size="icon-lg"
          aria-label="Back to top"
          title="Back to top"
          className="cursor-pointer fixed right-5 bottom-5 z-20 border-cyan-500/35 bg-[#0a101b]/90 text-cyan-300 shadow-[0_0_22px_rgba(0,240,255,0.12)] backdrop-blur-sm"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ArrowUp />
        </Button>
      ) : null}
    </>
  );
}