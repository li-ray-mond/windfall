/**
 * Builds the Supabase client used by code running on the server: server
 * components, server actions, and route handlers.
 *
 * A new client is created per request, never shared between them. The client
 * reads its session from the cookies of the request that created it, so one
 * kept across requests would hand one user's session to the next visitor.
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { serverEnv } from "@/env/server";

/**
 * Creates a Supabase client bound to the current request's cookies.
 *
 * @returns A client that acts as whoever is signed in on this request.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server components are not allowed to write cookies, so this
            // throws when called from one. Ignoring it is safe because
            // proxy.ts refreshes the session on every request instead.
          }
        },
      },
    },
  );
}
