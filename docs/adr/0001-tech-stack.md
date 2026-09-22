# 0001: Tech stack

- **Status:** Accepted
- **Date:** 2026-09-21

## Context

Windfall is a multi-user web app that watches airfare for each user's dream destinations and free dates, checks prices on a schedule, and notifies users when a fare beats their target. One developer is building it as a portfolio project. It should look like what a strong small team would ship (industry-standard tools, room to scale, a reviewable repo) while costing as close to nothing as possible. Live price data is the only part that costs real money.

## Decision

| Layer              | Choice                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------- |
| Language           | TypeScript, strict mode                                                                              |
| Framework          | Next.js (App Router) + Tailwind CSS, as an installable PWA                                           |
| Package manager    | npm                                                                                                  |
| Hosting            | Vercel (Hobby plan to start): production from `main`, a preview deployment for every pull request    |
| Database + auth    | Supabase (Postgres + Supabase Auth), with separate `windfall-dev` and `windfall-prod` projects       |
| Schema changes     | Supabase CLI migrations committed to the repo                                                        |
| Validation         | Zod, for environment variables and every external API response                                       |
| Background jobs    | Inngest, running inside the Next.js app on Vercel                                                    |
| Price data         | A provider interface with swappable adapters: SerpApi in production, a mock provider everywhere else |
| Push notifications | Standard Web Push with VAPID keys (`web-push`) and a service worker                                  |
| Email              | Resend, for Supabase Auth emails (custom SMTP) and deal emails                                       |
| Error monitoring   | Sentry                                                                                               |
| Testing            | Vitest (unit and integration), Playwright (end-to-end)                                               |
| Code quality       | ESLint + Prettier, enforced in CI                                                                    |
| CI                 | GitHub Actions                                                                                       |

The main reasons:

- **Managed services over self-hosting.** At this scale, Vercel, Supabase, and Inngest remove the work of running servers, patching them, and scaling them, and each has a free tier.
- **Supabase** provides Postgres, authentication, and row-level security in one service, so the database itself enforces that users only see their own data, rather than relying on app code alone.
- **Inngest instead of cron.** Scheduled GitHub Actions workflows can run late and have no retries. Inngest provides fan-out (one small job per price watch), automatic retries, rate limiting to protect paid API quotas, and a dashboard of every run, which lets the same design serve one user or thousands.
- **A provider interface for prices.** Amadeus's self-service developer portal was decommissioned on July 17, 2026, and its API keys were disabled. With vendors behind an interface, the next shutdown or price change means swapping an adapter, not rewriting the app. SerpApi needs no partner approval and charges per search, which suits an app that searches but never books.
- **Standard Web Push instead of a push vendor.** It's the open web standard, it's free, it has no vendor limits, and it works on desktop and on installed mobile PWAs.
- **Resend for email.** Supabase's built-in email is rate-limited and meant for testing.

## Alternatives considered

- **Amadeus Self-Service APIs:** shut down in July 2026.
- **GitHub Actions cron as the scheduler:** runs can start late and aren't retried; it isn't designed to be an app's backbone. GitHub Actions is used for CI only.
- **Self-managed servers, Kubernetes, microservices, or a hand-built AWS setup:** far more operational work than a one-person project justifies, with no benefit at this scale.
- **A document database such as Firebase:** this data (users, destinations, date windows, watches, prices) is relational, which suits Postgres better.
- **A third-party push service:** adds a vendor, usage limits, and possible cost for something the open standard already does.

## Consequences

- Nearly everything runs on free tiers. The main cost is SerpApi searches, kept in check by caching, adaptive check frequency, and a monthly cap on paid calls.
- Vercel's Hobby plan is for personal, non-commercial use. A commercial launch would mean upgrading to the Pro plan.
- The app depends on several vendors (Vercel, Supabase, Inngest, SerpApi, Resend, Sentry). The provider interface limits the risk for price data, the most likely vendor to change; the rest are mainstream services.
- Two Supabase projects and separate environment variables per environment add setup work, but keep development and tests away from production data.
