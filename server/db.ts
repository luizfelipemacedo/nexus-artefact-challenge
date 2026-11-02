import "server-only";

export type Task = {
  id: string;
  titulo: string;
  descricao?: string;
  dataCriacao: string;
};

const seedTasks: Task[] = [
  {
    id: "tsk-neural-deck",
    titulo: "Calibrate neural deck",
    descricao: "Adjust input channels prior to the next net-run.",
    dataCriacao: "2026-10-28T08:12:00.000Z",
  },
  {
    id: "tsk-vpc-firmware",
    titulo: "Update VPC subnet firmware",
    descricao: "Apply security patch and validate active node checksums.",
    dataCriacao: "2026-10-28T11:40:00.000Z",
  },
  {
    id: "tsk-ghost-protocol",
    titulo: "Audit Ghost protocol",
    descricao: "Trace orphan handshakes across the low-latency gateway.",
    dataCriacao: "2026-10-29T06:25:00.000Z",
  },
  {
    id: "tsk-optic-array",
    titulo: "Synchronize optical array",
    descricao: "Align east-corridor sensors with the observability grid.",
    dataCriacao: "2026-10-29T15:05:00.000Z",
  },
  {
    id: "tsk-quantum-cache",
    titulo: "Purge quantum cache",
    descricao: "Remove stale artifacts without disrupting synthesis workers.",
    dataCriacao: "2026-10-30T09:18:00.000Z",
  },
  {
    id: "tsk-echo-drone",
    titulo: "Reprogram Echo drone",
    descricao: "Dispatch revised patrol route to subterranean recon drone.",
    dataCriacao: "2026-10-30T18:44:00.000Z",
  },
  {
    id: "tsk-signal-relay",
    titulo: "Reinforce signal relay",
    descricao: "Rotate key pairs and measure packet degradation on external uplink.",
    dataCriacao: "2026-10-31T12:31:00.000Z",
  },
  {
    id: "tsk-midnight-deploy",
    titulo: "Prepare Midnight deployment",
    descricao: "Review logs, release feature flags, and verify rollback plan.",
    dataCriacao: "2026-11-01T21:07:00.000Z",
  },
];

// This module-level store is process-local by design and resets when the server restarts.
const tasks = new Map(seedTasks.map((task) => [task.id, task]));

export function listTasks() {
  return [...tasks.values()].sort((a, b) => {
    const dateOrder = b.dataCriacao.localeCompare(a.dataCriacao);
    return dateOrder || b.id.localeCompare(a.id);
  });
}

export function getTaskCursor(task: Task) {
  return `${task.dataCriacao}|${task.id}`;
}

export function getTask(id: string) {
  return tasks.get(id);
}

export function createTask(input: Omit<Task, "id" | "dataCriacao">) {
  const task: Task = {
    ...input,
    id: `tsk-${crypto.randomUUID().slice(0, 8)}`,
    dataCriacao: new Date().toISOString(),
  };
  tasks.set(task.id, task);
  return task;
}

export function updateTask(id: string, input: Omit<Task, "id" | "dataCriacao">) {
  const current = tasks.get(id);
  if (!current) return undefined;

  const updated = { ...current, ...input };
  tasks.set(id, updated);
  return updated;
}

export function deleteTask(id: string) {
  return tasks.delete(id);
}