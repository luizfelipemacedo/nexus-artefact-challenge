const amount = Number(100);
const baseUrl = process.env.TASK_APP_URL ?? "http://localhost:3000";

if (!Number.isInteger(amount) || amount < 1 || amount > 1000) {
  console.error("Usage: node scripts/seed-tasks.mjs [amount]");
  console.error("Amount must be an integer between 1 and 1000.");
  process.exitCode = 1;
  process.exit();
}

async function createTask(index) {
  const response = await fetch(`${baseUrl}/api/trpc/task.create`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      titulo: `Synthetic task ${String(index + 1).padStart(3, "0")}`,
      descricao: `Generated task ${index + 1} for infinite-scroll validation.`,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed with ${response.status}: ${body}`);
  }

  return response.json();
}

try {
  await Promise.all(Array.from({ length: amount }, (_, index) => createTask(index)));
  console.log(`Created ${amount} tasks at ${baseUrl}.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
