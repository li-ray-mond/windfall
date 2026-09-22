/**
 * Shown when a link from an email doesn't work, at /auth/link-problem.
 *
 * The usual causes are that the link has already been used, that it has
 * expired, or that an email client rewrote it. All the visitor can do is
 * start again, so the page says so plainly rather than showing an error code.
 */

import Link from "next/link";

/**
 * Renders the expired-link explanation.
 *
 * @returns The link-problem page.
 */
export default function LinkProblemPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-4 px-6 py-16 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">
        That link didn&rsquo;t work
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Email links can only be used once, and they expire after a while. Ask
        for a fresh one and it should work.
      </p>
      <div className="flex flex-col gap-2 text-sm">
        <Link href="/login" className="underline">
          Back to log in
        </Link>
        <Link href="/forgot-password" className="underline">
          Send a new password reset link
        </Link>
        <Link href="/signup" className="underline">
          Sign up again
        </Link>
      </div>
    </main>
  );
}
