# Ipolive — Vercel deployment & local setup

This repository contains the Ipolive frontend (Vite + React + Tailwind). The project has been prepared for static hosting on Vercel — build output is placed in `dist/public` and `vercel.json` is included to tell Vercel how to serve the app.

This README documents the most common environment settings and the fastest way to get the app running locally and on Vercel.

---

## Quick dev (local)

1. Install dependencies

   npm install

   (You can also use pnpm if you prefer: `pnpm install` — this repo contains a pnpm lockfile.)

2. Run dev server

   npm run dev

   Open http://localhost:5173 (or the port printed by Vite).

3. Build and preview the production build

   npm run build
   npm run preview

   Preview serves the built files locally (Vite preview). By default it will use port 5173 unless you set PORT.

---

## How Vercel will build & serve

- Build command: `npm run vercel-build` (this runs `vite build`) — Vercel will run the build during deployment.
- Output directory: `dist/public` (configured in `vercel.json` using the `@vercel/static-build` builder).
- Routing: `vercel.json` routes all requests to `index.html` so this single-page app works with client-side routing.

If you use a different build command in the Vercel project settings, set it to `npm run vercel-build` and the output directory to `dist/public` (or leave the builder config as-is and Vercel will use the included `vercel.json`).

---

## Environment variables (common)

Add these in the Vercel Dashboard → Project → Settings → Environment Variables.
Set the value and choose the environment (Production, Preview, Development).

- BASE_PATH — Optional. Defaults to `/`. Use this if you deploy the app under a subpath (for example `/my-app/`). If you set a non-root base path, set the same value as a build-time env var on Vercel so Vite emits correct URLs.
  - Example: `/` or `/ipolive/`

- NODE_ENV — Usually `production` for production builds. Vercel sets this automatically for production deployments.

- PORT — Only needed for preview or some local setups; Vercel doesn't require you to set `PORT` for static builds. If you do set it, ensure it's a valid number (e.g., `3000`).

- REACT_APP_XXX or other app-specific secrets — If your app talks to APIs, add keys here. Prefix with `REACT_APP_` (optional) or document your own prefix. Example variables you may need to add:
  - API_BASE_URL — URL of your backend
  - NEXT_PUBLIC_SOME_KEY / REACT_APP_SOME_KEY — client-exposed keys

Notes:
- Only put secrets that are safe for client-side access if they are exposed to the browser (anything in the JS bundle is visible to users).
- For server-only secrets (not in this static frontend), add them to your backend or Vercel Serverless functions.

Local .env example (create `.env.local` or `.env` in the repo root):

BASE_PATH=/
PORT=5173
API_BASE_URL=https://api.example.com

Do not commit `.env` or `.env.local` — a `.gitignore` has been added.

---

## Files added / changed to support Vercel

- `package.json` — added scripts (`dev`, `build`, `preview`, `vercel-build`) and core dependencies (React, Vite, Tailwind tooling).
- `vite.config.ts` — made resilient to missing environment variables and optional Replit plugins.
- `postcss.config.cjs` and `tailwind.config.cjs` — Tailwind build configuration.
- `vercel.json` — tells Vercel to use `@vercel/static-build` and serve `dist/public` with a SPA route.
- `src/main.tsx` — moved the app entry file from repo root into `src/` to match `index.html`.
- `.gitignore` — ignores build outputs and local env files.

---

## Troubleshooting & notes

- Build fails with missing packages: run `npm install` (or `pnpm install`) and ensure `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, and `autoprefixer` are installed.
- Tailwind CSS not applying: check `tailwind.config.cjs` `content` globs include `index.html` and `src/**/*.{ts,tsx,js,jsx}`.
- Fonts and static assets: `index.html` references `/favicon.svg` and Google Fonts. If you host under a subpath (`BASE_PATH`), confirm assets resolve correctly or use absolute URLs.
- If your app uses server-side features or Replit-only plugins, those are optional and will be loaded only when available — they are not required for a successful Vercel static build.

---

## Deploying to Vercel (step-by-step)

1. Push the repository to GitHub (already done).
2. In Vercel: Import Project → pick this repository.
3. In the Build & Output settings (if you override defaults):
   - Framework preset: `Other` (or leave auto-detected)
   - Build command: `npm run vercel-build`
   - Output directory: `dist/public`
4. Add required Environment Variables (see the list above).
5. Deploy. Monitor the build logs in Vercel for warnings or errors.

---

If you want, I can:
- Run a local build checklist for you (commands and expected output) and help interpret any errors you hit.
- Create a small GitHub Actions workflow to run `npm ci && npm run build` on push and report build status.

If anything here should be different for your workflow (for example you insist on pnpm), tell me and I'll update the README and package scripts accordingly.