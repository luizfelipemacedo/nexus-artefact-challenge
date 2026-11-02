"use client";

import { ArrowLeft, Loader2, Radio, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

type TaskFormProps =
  | { mode: "create"; taskId?: never }
  | { mode: "edit"; taskId: string };

export function TaskForm({ mode, taskId }: TaskFormProps) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState("");
  const [formError, setFormError] = useState("");
  const appRouter = useRouter();
  const router = trpc.useUtils();
  const taskQuery = trpc.task.getById.useQuery(
    { id: taskId ?? "" },
    { enabled: isEdit },
  );
  const createMutation = trpc.task.create.useMutation();
  const updateMutation = trpc.task.update.useMutation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (taskQuery.data) {
      setTitle(taskQuery.data.titulo);
      setDescription(taskQuery.data.descricao ?? "");
    }
  }, [taskQuery.data]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    setFormError("");
    if (!trimmedTitle) {
      setTitleError("Title is required to deploy a task.");
      return;
    }
    setTitleError("");

    try {
      if (isEdit && taskId) {
        await updateMutation.mutateAsync({
          id: taskId,
          titulo: trimmedTitle,
          descricao: trimmedDescription || undefined,
        });
        await router.task.getInfiniteTasks.invalidate();
        toast.success("Task updated", { description: "The task configuration is now live." });
      } else {
        await createMutation.mutateAsync({
          titulo: trimmedTitle,
          descricao: trimmedDescription || undefined,
        });
        await router.task.getInfiniteTasks.invalidate();
        toast.success("Task created", { description: "A new operation entered the queue." });
      }
      appRouter.push("/");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save the task.");
    }
  }

  if (isEdit && taskQuery.isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-10 w-2/3 bg-cyan-500/10" />
        <Skeleton className="h-12 w-full bg-cyan-500/10" />
        <Skeleton className="h-32 w-full bg-cyan-500/10" />
      </div>
    );
  }

  if (isEdit && (taskQuery.isError || !taskQuery.data)) {
    return (
      <div className="font-sans border border-rose-500/30 bg-rose-500/5 p-6 text-sm text-rose-300">
        The requested task could not be found in the local registry.
        <div className="mt-5">
          <Button render={<Link href="/" />} nativeButton={false} variant="outline">
            Return to registry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex items-center gap-4">
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="icon" aria-label="Back to registry">
          <ArrowLeft />
        </Button>
        <div>
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-400">
            <Radio className="size-3" />
            {isEdit ? "Modify operation" : "New operation"}
          </div>
          <h1 className="font-mono text-3xl font-semibold text-white">{isEdit ? "EDIT TASK" : "CREATE TASK"}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 border border-cyan-500/20 bg-card/70 p-6 shadow-[0_0_30px_rgba(0,240,255,0.04)] backdrop-blur-sm sm:p-8">
        <div className="space-y-2">
          <Label htmlFor="titulo" className="font-mono text-xs uppercase tracking-widest text-cyan-300">Task title</Label>
          <Input
            id="titulo"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (titleError) setTitleError("");
            }}
            aria-invalid={Boolean(titleError)}
            placeholder="e.g. Patch the relay gateway"
            maxLength={120}
            className="font-sans h-12 border-cyan-500/25 bg-black/20 text-base text-cyan-50 placeholder:text-slate-600 focus-visible:border-cyan-300"
          />
          {titleError && <p className="font-sans text-xs text-rose-400">{titleError}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="descricao" className="font-mono text-xs uppercase tracking-widest text-cyan-300">Description <span className="text-slate-600">/ optional</span></Label>
          <Textarea
            id="descricao"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Add context for the next operator..."
            maxLength={500}
            className="font-mono min-h-32 resize-y border-cyan-500/25 bg-black/20 text-cyan-50 placeholder:text-slate-600 focus-visible:border-cyan-300"
          />
          <p className="text-right font-mono text-[10px] text-slate-600">{description.length}/500</p>
        </div>

        {formError && <p className="font-sans border border-rose-500/25 bg-rose-500/5 p-3 text-sm text-rose-300">{formError}</p>}

        <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
          <Button render={<Link href="/" />} nativeButton={false} type="button" variant="ghost" disabled={isPending} className="font-sans cursor-pointer">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="font-sans cursor-pointer shadow-[0_0_18px_rgba(0,240,255,0.16)]">
            {isPending ? <Loader2 className="animate-spin" /> : <Save />}
            {isEdit ? "Save changes" : "Create task"}
          </Button>
        </div>
      </form>
    </div>
  );
}

