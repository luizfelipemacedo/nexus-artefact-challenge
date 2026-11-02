import { appRouter } from "@/server/routers/_app";
import { TaskList } from "@/components/tasks/task-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const caller = appRouter.createCaller({});
  const initialPage = await caller.task.getInfiniteTasks({ limit: 4, cursor: null });

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <TaskList initialPage={initialPage} />
        <footer className="mt-8 flex items-center justify-between border-t border-white/5 pt-5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
          <span>Local memory // v1.0</span>
          <span className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" /> System nominal</span>
        </footer>
      </div>
    </main>
  );
}
