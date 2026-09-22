/**
 * Environment variables for code that runs on the server.
 *
 * `next.config.ts` imports this file, so `next dev` and `next build` check
 * every variable before the app does anything else, and a missing or invalid
 * value stops the build with a message naming it.
 *
 * This is the only place a server-only secret may be read. Browser code must
 * import ./client instead, which is limited to NEXT_PUBLIC_ variables.
 *
 * TODO(phase-2): add SUPABASE_SECRET_KEY here, for server-side code that
 * needs to bypass Row Level Security. Phase 1 has none, so it isn't required
 * yet and nothing would notice if it were missing.
 */

import { z } from "zod";
import { clientEnvSchema } from "./client";
import { parseEnv } from "./parse";

// The server sees everything the browser sees, plus its own variables.
// Extending the browser schema rather than repeating it means a new public
// variable can't be added in one place and forgotten in the other.
const serverEnvSchema = clientEnvSchema.extend({
  // Set automatically: "development" by `next dev`, "production" by
  // `next build` and `next start`, and "test" by Vitest.
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

/** The validated server environment. Import this instead of reading `process.env`. */
export const serverEnv = parseEnv(serverEnvSchema, process.env);
