# Motion — Notion Clone

A small, educational clone of Notion built to practice Next.js, Convex, and file uploads. This repo is a demo/portfolio project, not meant for production use. Use it to try the demo, learn and experiment ✨

## 🎯 What this project is

Motion is a simplified Notion-like editor and document manager. It demonstrates:

- A Next.js App Router application (TypeScript + React).
- Convex backend for real-time DB and server-side logic.
- File uploads via EdgeStore with upload limits enforced.
- Rich text editing using BlockNote.
- Authentication via Clerk.
- Toasts with Sonner and UI components built with Shadcn.

## 🧩 High-level architecture

Simple explanation of how the pieces fit together:

- Frontend (Next.js)
  - Pages & components live in `app/` and `components/`.
  - Editor component (`components/Editor.tsx`) uses BlockNote and uploads files to EdgeStore.
  - UI uses Tailwind CSS, small design system components under `components/ui`.
  - Authentication (Clerk), client-side sign-in and session management, Clerk provides user identity to the app.
  - Client calls Convex mutations/queries via the generated Convex client (`convex/_generated/api`).

- Backend (Convex)
  - Server functions in `convex/documents.ts` implement queries and mutations (create, update, archive, remove, get counts).
  - File and document limits (demo restrictions) are enforced server-side.
  - Auth is handled via Clerk on the frontend, Convex uses `ctx.auth.getUserIdentity()` (with Clerk-provided identity) to scope user data.

- File storage (EdgeStore)
  - Public images and files are uploaded via Edgestor. Uploaded file URLs are saved into document content or as cover images.

## 📁 Folder structure (important files)

- `app/` — App Router pages and layouts.
  - `app/(main)/` — Main authenticated UI including documents, editor, navigation, trash.
  - `app/(landingPage)/` — Public landing/marketing pages.

- `components/` — Reusable UI and feature components (Editor, Cover, Upload helpers).
- `convex/` — Convex backend functions, schema, and generated types.
- `hooks/` — Custom React hooks used across app.
- `lib/` — Helpers (EdgeStore wrapper, utils).
- `public/` — Static assets.

NOTE: This is a developer-focused example. Explore the folders to learn more. 🧭

## ✨ Key features

- Create, edit, archive, and delete notes/documents.
- BlockNote editor with image/file uploads.
- Demo limits: max 10 documents, max 5 files per demo user (enforced in Convex).
- Trash/restore flow and "Delete forever" with file cleanup.
- Publishing preview (public preview route) and publish/unpublish toggle.
- Simple responsive UI with sidebar and top navbar.

## 📺 Demo video

https://github.com/user-attachments/assets/021e9674-96e8-4ade-93c1-a9e847fc338d

## 🌐 Live demo

Live demo:

[Motion - Notion clone](https://motion-one-omega.vercel.app/)

## 🛠️ Run locally

### Prerequisites

- Node.js (LTS recommended)
- pnpm (project uses pnpm, but npm/yarn can work with minor adjustments)
- A Convex account/project
- Clerk account (for auth), or swap out auth in dev
- Edgestore credentials if testing file uploads

### Install

```bash
# from repo root
pnpm install
```

### Environment variables

Create a `.env.local` in the project root with the following variables (example names, adapt to your provider):

``` js

# Convex (serverless endpoint for your Convex project)
NEXT_PUBLIC_CONVEX_URL=http://your-convex-url.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_xxx_xxx
CLERK_SECRET_KEY=sk_xxx

# EdgeStore (example)
EDGE_STORE_ACCESS_KEY=edgestore_access_key_here
EDGE_STORE_SECRET_KEY=edgestore_secret_key_here

```

Notes(s):
- Replace the variable names and values with your actual keys from Clerk, Convex, and EdgeStore (might be updated by them).

### Start the dev server

```zsh
pnpm dev
# or
pnpm next dev

# and
pnpm convex dev
```

Open http://localhost:3000 and sign in with the demo account flow.


## ✅ Quality & Limitations

- This project is a learning/portfolio clone, not production-ready.
- Security hardening, validation, rate limiting, and access controls are simplified.
- Some assumptions are made for demo convenience (example: public uploads).

## 🙋‍♂️ Contact

[![LinkedIn](https://tinyurl.com/bdz848dw)](https://www.linkedin.com/in/khusro-sakhi)

---
