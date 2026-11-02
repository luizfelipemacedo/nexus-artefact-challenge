import { TaskForm } from "@/components/tasks/task-form";

export default async function EditTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <TaskForm mode="edit" taskId={id} />
      </div>
    </main>
  );
}