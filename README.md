# Windfall

Windfall watches airfare to your dream destinations and tells you when a fare drops below your target on dates you're free to travel.

You list the places you want to go, the date ranges you have open, and what you'd pay for the flight. A background job checks flight prices on a schedule and notifies you when a fare clears your target for a destination that fits one of your windows. Hotels (and later, activities) are looked up on demand for a specific deal instead of being scanned continuously, because airfare is the volatile, hard-to-time part of a trip's cost.

> **Status:** Phase 0 (foundation) is complete. The app is a placeholder page for now; the roadmap below lists what comes next.

## Architecture

Windfall is a single Next.js app deployed on Vercel. These pieces arrive phase by phase:

- **Web app:** Next.js (App Router) with TypeScript and Tailwind CSS, installable as a PWA.
- **Database and auth:** Supabase. Postgres with row-level security on every table, and Supabase Auth for email and password sign-in. Schema changes go through committed migrations.
- **Background jobs:** Inngest. A scheduled function fans out one flight-price check per active watch, with retries, rate limiting, and a monthly cap on paid API calls.
- **Price data:** vendors sit behind TypeScript interfaces so they can be swapped. A mock provider is used in development and tests; SerpApi is the real provider in production.
- **Notifications:** standard Web Push, with email through Resend as the fallback.
- **Monitoring:** Sentry for client and server errors.

The reasoning behind these choices is in [docs/adr/0001-tech-stack.md](docs/adr/0001-tech-stack.md).

## Tech stack

| Layer              | Choice                                   |
| ------------------ | ---------------------------------------- |
| Language           | TypeScript (strict)                      |
| Framework          | Next.js (App Router) + Tailwind CSS      |
| Hosting            | Vercel                                   |
| Database + auth    | Supabase                                 |
| Validation         | Zod                                      |
| Background jobs    | Inngest                                  |
| Price data         | SerpApi, behind a provider interface     |
| Push notifications | Web Push (`web-push`) + a service worker |
| Email              | Resend                                   |
| Error monitoring   | Sentry                                   |
| Testing            | Vitest, Playwright                       |
| Code quality       | ESLint + Prettier                        |
| CI                 | GitHub Actions                           |

## Roadmap

| Phase | What it adds                                                                 |
| ----- | ---------------------------------------------------------------------------- |
| 0     | Foundation: the app, tooling, CI, and the first deployment                   |
| 1     | Supabase database, email sign-in, and error monitoring                       |
| 2     | Schema with row-level security, and forms for destinations and date windows  |
| 3     | Price provider layer: a mock provider and the two-tier SerpApi flight search |
| 4     | Window matching and deal detection                                           |
| 5     | Scheduled background jobs, with adaptive frequency and spend caps            |
| 6     | Web Push and email notifications                                             |
| 7     | End-to-end tests, production migrations, and launch                          |
| 8-9   | On-demand hotel and activity lookups for a flagged deal                      |
| 10-12 | Recurring date rules, rolling-average deal detection, and calendar sync      |
| 13    | Group trips: watching prices for dates when everyone is free                 |
| 14    | Portfolio polish                                                             |

## Local setup

You need [Node.js 24](https://nodejs.org/) (the version is pinned in `.nvmrc`) and npm, which comes with Node.

```bash
git clone https://github.com/li-ray-mond/windfall.git
cd windfall
npm install
cp .env.example .env.local
npm run dev
```

Then open http://localhost:3000. You need a Supabase project for the app to
start; `npm run dev` stops with a message naming any variable you have not
filled in.

## Database

Schema changes are versioned as SQL migration files in `supabase/migrations/`
and applied with the Supabase CLI, which is installed as a dev dependency and
run with `npx supabase`. Nothing is changed by clicking around in the Supabase
dashboard, so every environment ends up with the same schema in the same order.
The first migrations arrive in Phase 2.

## Environment variables

Every variable the app reads is listed in [.env.example](.env.example) with a one-line explanation. Zod validates them whenever the app starts or builds, and a missing or invalid value stops the app with a message naming the variable. Real values go in `.env.local` for local development, or in the Vercel project settings for deployments. They are never committed.

The variables are split in two so that a secret cannot end up in code users download:

- [src/env/client.ts](src/env/client.ts) holds the `NEXT_PUBLIC_` variables, which are compiled into the browser bundle by design. A test fails if anything else is added to it.
- [src/env/server.ts](src/env/server.ts) holds everything the server may read, including secrets. `next.config.ts` imports it, which is what makes the check run at startup.

Phase 1 adds `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Each later phase adds the ones it uses.

## Scripts and tests

| Command                | What it does                                          |
| ---------------------- | ----------------------------------------------------- |
| `npm run dev`          | Start the development server at http://localhost:3000 |
| `npm run build`        | Build the app for production                          |
| `npm start`            | Run the production build locally                      |
| `npm test`             | Run the unit tests (Vitest)                           |
| `npm run lint`         | Check the code for likely bugs (ESLint)               |
| `npm run typecheck`    | Check TypeScript types                                |
| `npm run format`       | Format every file (Prettier)                          |
| `npm run format:check` | Check formatting without changing any files           |

CI runs lint, the format check, the type-check, the tests, and the build on every pull request. The workflow is in [.github/workflows/ci.yml](.github/workflows/ci.yml).
