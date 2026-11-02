import { TaskForm } from "@/components/tasks/task-form";

export default function NewTaskPage() {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <TaskForm mode="create" />
      </div>
    </main>
  );
}