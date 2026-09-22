/**
 * Shared validator for environment variables.
 *
 * Both environment modules in this folder use it, so a missing or invalid
 * value always fails the same way: immediately, with a message naming the
 * variable, instead of causing a confusing failure somewhere later.
 */

import type { z } from "zod";

/**
 * Checks a set of environment variables against a schema.
 *
 * @param schema - Describes the variables that must be present and valid.
 * @param input - The variables to check, normally read from `process.env`.
 * @returns The validated variables, with defaults filled in.
 * @throws Error listing every missing or invalid variable by name.
 */
export function parseEnv<Schema extends z.ZodType>(
  schema: Schema,
  input: unknown,
): z.infer<Schema> {
  const result = schema.safeParse(input);

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
