# Repository Guidelines

## Project Structure & Module Organization
The frontend uses the Next.js App Router. Top-level `app/` hosts root layouts, routing entry points, and global providers. Shared configuration (Next config, middleware) resides beside it. Feature code follows a feature-sliced layout under `src/` with `entities/`, `features/`, `widgets/`, `pages/`, and `shared/`—place UI primitives or utilities in `shared`, and compose higher-level interactions through `widgets` and route-ready pages. Static assets live in `public/`; design tokens and Tailwind configuration live in `components.json` and `postcss.config.mjs`.

## Build, Test, and Development Commands
Run `bun run dev` to start the dev server with Turbopack at `http://localhost:3000`. Use `npm run build` for a production bundle; this validates the app router tree and TypeScript types. Serve the optimized build with `npm run start`. `npm run lint` runs the flat ESLint config and should pass before opening a pull request.

## Coding Style & Naming Conventions
Write TypeScript first; keep components typed with explicit props and exported named functions. Stick to two-space indentation and single quotes in TSX/TS files (use the workspace editor defaults). ESLint extends `next/core-web-vitals` and `next/typescript`; fix all autofixable issues before committing. Tailwind utility classes should follow mobile-first ordering, and component names should reflect their feature slice (e.g., `SurveyCard` under `src/entities/survey`).

## Testing Guidelines
No automated test harness is configured yet. When adding tests, colocate them under the relevant slice using `__tests__/ComponentName.test.tsx` and prefer React Testing Library alongside Vitest or Jest. Document any new testing dependency in `package.json` scripts and ensure `npm test` mirrors the recommended workflow. Manual QA steps (e.g., form submission, auth flows) should be described in the PR until automated coverage exists.

## Commit & Pull Request Guidelines
Existing commits use short, imperative summaries (e.g., `add generated form`). Follow that pattern, capitalizing only proper nouns, and limit body text to essential context. Keep each commit scoped to a single feature or fix. Pull requests should include a concise summary, screenshots or screen recordings for UI changes, linked issues or ticket IDs, and notes about new environment variables or migrations.

## Environment & Configuration
Store secrets in `.env.local` and never commit them. Update `next.config.ts` or middleware behavior in tandem with documentation when changing routes or auth flows. If you adjust Tailwind tokens or component registry entries, explain the impact in the PR to help reviewers validate UI consistency.
