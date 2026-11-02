# NEXUS // Task Control

A focused task-management interface built with Next.js 15 App Router, tRPC v11, Zod, TanStack Query, and shadcn/ui. The visual language is a restrained Tech / Cyberpunk Dark command surface.
Created as a technical challenge for Artefact.

## Run locally

```bash
pnpm install
pnpm dev
```

The application is available at [http://localhost:3000](http://localhost:3000). The equivalent npm command is `npm run dev` when dependencies are installed with npm.

## Architecture

- `server/db.ts` contains the process-local task store and seeded task data.
- `server/routers/_app.ts` defines the tRPC router, Zod validation, cursor pagination, and CRUD procedures.
- `app/api/trpc/[trpc]/route.ts` exposes the router through the Next.js App Router fetch adapter.
- `app/page.tsx` calls the router directly on the server for the first page. The client list receives that page as initial data and uses tRPC's infinite query for later pages.
- `app/providers.tsx` owns the browser QueryClient, tRPC client, and Sonner toaster.
- `components/tasks/task-list.tsx` implements infinite scroll, loading states, edit navigation, and delete confirmation.
- `components/tasks/task-form.tsx` is shared by the create and edit routes.

## tRPC procedures

- `getInfiniteTasks`: returns a bounded page of tasks and a stable cursor anchored to the last task.
- `getById`: loads one task and returns `NOT_FOUND` when it does not exist.
- `create`: validates and creates a task with a server-generated id and timestamp.
- `update`: validates and updates the title/description while preserving identity and creation time.
- `delete`: removes a task and returns its id.

## Routes

- `/` - SSR task registry with infinite scroll.
- `/tasks/new` - create form.
- `/tasks/[id]` - edit form.
- `/api/trpc/[trpc]` - tRPC HTTP transport.

## Seed test data

With the development server running, add 100 synthetic tasks for infinite-scroll testing:

```bash
pnpm seed
```

## Persistence note

Tasks are stored in a module-level `Map` intentionally. This keeps the challenge self-contained and demonstrates the server/client boundary, but data is lost whenever the process restarts and is not shared across multiple server instances. A production deployment should replace `server/db.ts` with a durable database repository.
