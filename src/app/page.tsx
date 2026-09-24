/**
 * Homepage (the "/" route).
 *
 * A placeholder until the dashboard exists: it shows the app's name and
 * what Windfall will do, and points visitors at signing up or logging in.
 */

import Link from "next/link";

/**
 * Renders the placeholder homepage.
 *
 * @returns The homepage content.
 */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center font-sans">
      <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
        Windfall
      </h1>
      <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
        Airfare deal alerts for your dream destinations, on the dates
        you&rsquo;re free to travel.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/signup"
          className="rounded-md bg-zinc-900 px-4 py-2 text-base font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Sign up
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-zinc-300 px-4 py-2 text-base font-medium dark:border-zinc-700"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}
