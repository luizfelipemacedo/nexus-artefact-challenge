import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTask, deleteTask, getTask, getTaskCursor, listTasks, updateTask } from "../db";

const t = initTRPC.create();

const taskInput = z.object({
  titulo: z.string().trim().min(1, "Title is required").max(120),
  descricao: z.string().trim().max(500).optional(),
});

const taskId = z.object({ id: z.string().min(1) });

export const appRouter = t.router({
  task: t.router({
    getInfiniteTasks: t.procedure
      .input(
        z.object({
          limit: z.number().int().min(1).max(20).default(4),
          cursor: z.string().nullable().default(null),
        }),
      )
      .query(({ input }) => {
        const allTasks = listTasks();
        let start = 0;

        if (input.cursor) {
          const cursorIndex = allTasks.findIndex((task) => getTaskCursor(task) === input.cursor);
          if (cursorIndex === -1) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid task cursor" });
          }
          start = cursorIndex + 1;
        }

        const items = allTasks.slice(start, start + input.limit);
        const nextCursor = start + items.length < allTasks.length
          ? getTaskCursor(items[items.length - 1])
          : null;

        return { items, nextCursor };
      }),

    getById: t.procedure.input(taskId).query(({ input }) => {
      const task = getTask(input.id);
      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }
      return task;
    }),

    create: t.procedure.input(taskInput).mutation(({ input }) => createTask(input)),

    update: t.procedure.input(taskId.extend(taskInput.shape)).mutation(({ input }) => {
      const task = updateTask(input.id, {
        titulo: input.titulo,
        descricao: input.descricao,
      });
      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }
      return task;
    }),

    delete: t.procedure.input(taskId).mutation(({ input }) => {
      if (!deleteTask(input.id)) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }
      return { id: input.id };
    }),
  }),
});

export type AppRouter = typeof appRouter;