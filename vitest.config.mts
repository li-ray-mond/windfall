/**
 * Vitest configuration.
 *
 * Supplies placeholder values for the environment variables the app checks
 * when a module is first imported, so tests can import application code
 * without a real .env.local. The values below are obvious placeholders that
 * point at nothing real; tests never reach the network.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://placeholder.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_placeholder",
    },
  },
});
