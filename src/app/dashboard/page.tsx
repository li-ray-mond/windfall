/**
 * The dashboard, at /dashboard.
 *
 * The first page that needs an account. A server component, so the session
 * is read on the server and the page arrives already personalised.
 *
 * TODO(phase-2): replace the placeholder with the user's destinations and
 * availability windows.
 */

import { redirect } from "next/navigation";
import { signOut } from "@/app/auth/actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Renders the signed-in user's dashboard.
 *
 * @returns The dashboard page.
 */
export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getClaims();

  // proxy.ts already turns away visitors without a session. This second
  // check is not redundant: if the proxy's matcher is ever narrowed and
  // stops covering this route, the page would otherwise start rendering to
  // anyone who asked for it.
  if (!data?.claims) {
    redirect("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <form action={signOut}>
          <button
            type="submit"
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium dark:border-zinc-700"
          >
            Log out
          </button>
        </form>
      </div>

      <p className="text-zinc-600 dark:text-zinc-400">
        Signed in as{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {String(data.claims.email)}
        </span>
        .
      </p>
      <p className="text-zinc-600 dark:text-zinc-400">
        Your destinations and travel dates will appear here. That comes next, in
        Phase 2.
      </p>
    </main>
  );
}
