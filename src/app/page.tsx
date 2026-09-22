/**
 * Homepage (the "/" route).
 *
 * A placeholder until the dashboard exists: it shows the app's name and
 * what Windfall will do.
 */

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
      <p className="text-sm text-zinc-500">Coming soon.</p>
    </main>
  );
}
