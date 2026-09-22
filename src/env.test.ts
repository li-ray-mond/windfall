/**
 * Tests for the environment loader in env.ts.
 *
 * The loader exists so that a misconfigured deployment fails at startup
 * with a message naming the broken variable, rather than failing later in
 * a confusing way. These tests lock in both halves of that promise: good
 * settings pass through, and bad ones stop with a clear error.
 */

import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("returns the validated variables when every value is valid", () => {
    expect(parseEnv({ NODE_ENV: "production" })).toEqual({
      NODE_ENV: "production",
    });
  });

  it("stops with an error that names the variable when a value is invalid", () => {
    expect(() => parseEnv({ NODE_ENV: "staging" })).toThrow(/NODE_ENV/);
  });
});
