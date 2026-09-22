/**
 * Loads and validates the app's environment variables.
 *
 * Every environment variable the app reads is declared in `envSchema` and
 * checked with Zod when the app starts or builds (next.config.ts imports
 * this file). A missing or invalid value stops everything with a message
 * that names the variable, instead of causing a confusing failure later.
 *
 * TODO(phase-1): add the Supabase variables, and split browser-safe
 * NEXT_PUBLIC_ variables from server-only secrets so a secret can never be
 * bundled into code sent to the browser.
 */

import { z } from "zod";

const envSchema = z.object({
  // Set automatically: "development" by `next dev`, "production" by
  // `next build` and `next start`, and "test" by Vitest.
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

/**
 * Checks a set of environment variables against the schema.
 *
 * @param input - The variables to check, normally `process.env`.
 * @returns The validated variables, with defaults filled in.
 * @throws Error listing every missing or invalid variable by name.
 */
export function parseEnv(
  input: Record<string, string | undefined>,
): z.infer<typeof envSchema> {
  const result = envSchema.safeParse(input);

  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables:\n${problems}\n` +
        "Fix them in .env.local (local development) or in the Vercel " +
        "project settings. .env.example lists every variable.",
    );
  }

  return result.data;
}

/** The validated environment. Import this instead of reading `process.env` directly. */
export const env = parseEnv(process.env);
