# Coding Standards

Brief
- This project follows a concise JavaScript Style Guide (StandardJS) combined with TypeScript and Next.js best practices to keep the code readable and maintainable.
- Emphasis: clear naming, small single-responsibility modules, separation of concerns (server data fetching vs presentational UI), accessibility, and predictable file/layout conventions.

Core conventions
- File names: kebab-case for pages and non-component files (e.g., `advertiser-dashboard.tsx`, `api-handler.ts`).
- Components: PascalCase (e.g., `UserCard`, `AdvertiserSuggestions`).
- Hooks: prefix with `use` (e.g., `useProfile`, `useToast`).
- Types & interfaces: PascalCase (e.g., `UserProfile`, `Campaign`).
- Variables & functions: camelCase (e.g., `fetchCampaigns`, `userId`).
- Constants: UPPER_SNAKE for environment/build constants (e.g., `SUPABASE_URL`).
- Exports: prefer named exports for utilities; default export acceptable for page-level React components.
- React: functional components only; typed props; avoid implicit `any`.
- Props & types: use `type` or `interface` with explicit fields and sensible defaults.
- Bracing & formatting: follow StandardJS style (no semicolons) and consistent spacing; use an automatic formatter locally if desired.
- Imports: grouped and ordered — external packages, absolute aliases (e.g., `@/`), then relative imports.
- Async: use `async/await` with `try/catch` and explicit return types for promises.
- Error handling: log server-side errors and show safe messages to users.
- Styling: Tailwind utility classes for layout and theme; minimize inline styles except small overrides.
- Accessibility: use semantic HTML, aria attributes for landmarks/headings, and keyboard-focusable controls.

Architecture & best practices
- Separation of concerns: server components/pages handle data fetching and auth; presentational UI components remain pure and stateless where possible.
- SOLID-friendly structure:
  - Single Responsibility: small components and modules that do one thing.
  - Dependency injection for external clients (e.g., Supabase client created via `lib/` helper).
  - Keep components composable and testable.
- Server vs client:
  - Keep secrets and server-only libs (Clerk server auth, Supabase server client) on server pages.
  - Use server-side fetches for protected data and sensitive queries.
- DB queries: prefer typed returns and defensive checks for missing fields to avoid runtime errors.
- Reuse UI primitives under `components/ui` for consistent look/feel.
