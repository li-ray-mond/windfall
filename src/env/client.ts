/**
 * Environment variables that are safe to send to the browser.
 *
 * Only NEXT_PUBLIC_ variables belong in this file. Everything here is
 * compiled into the JavaScript that users download, so adding a secret
 * would publish it. Server-only values go in ./server instead.
 *
 * Each variable is also written out in full below, rather than handing the
 * whole `process.env` object to the validator. Next.js fills these values in
 * by searching the source for the exact text `process.env.NEXT_PUBLIC_...`,
 * so a variable read any other way arrives in the browser as undefined.
 */

import { z } from "zod";
import { parseEnv } from "./parse";

/**
 * The variables the browser is allowed to see.
 *
 * Exported so ./server can extend it, which keeps the two lists from
 * drifting apart, and so a test can check that every name here is public.
 */
export const clientEnvSchema = z.object({
  // The Supabase project's API endpoint, e.g. https://<project>.supabase.co.
  NEXT_PUBLIC_SUPABASE_URL: z.url(),

  // Supabase's browser key. It is public by design: Row Level Security,
  // added in Phase 2, is what keeps one user out of another user's rows.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

/** The validated browser-safe variables. Import this instead of reading `process.env`. */
export const clientEnv = parseEnv(clientEnvSchema, {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
});
