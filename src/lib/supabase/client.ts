/**
 * Builds the Supabase client used by code running in the browser.
 *
 * A new client is created per call rather than shared from module scope,
 * because a long-lived client would keep holding a session that has since
 * changed, for example after a logout in another tab.
 */

import { createBrowserClient } from "@supabase/ssr";
import { clientEnv } from "@/env/client";

/**
 * Creates a Supabase client for use inside client components.
 *
 * @returns A client that reads and writes the signed-in user's session cookie.
 */
export function createBrowserSupabaseClient() {
  return createBrowserClient(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
