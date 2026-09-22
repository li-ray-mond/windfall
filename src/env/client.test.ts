/**
 * Test for the browser-safe variable list in client.ts.
 *
 * Every variable listed in client.ts is compiled into the JavaScript that
 * users download. This test encodes the rule that keeps that safe: nothing
 * in that file may be anything other than a NEXT_PUBLIC_ variable. It fails
 * the moment a server-only secret is added there, which is the exact mistake
 * it exists to catch.
 */

import { describe, expect, it } from "vitest";
import { clientEnvSchema } from "./client";

describe("clientEnvSchema", () => {
  it("lists only NEXT_PUBLIC_ variables, so no secret can reach the browser", () => {
    const names = Object.keys(clientEnvSchema.shape);

    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => !name.startsWith("NEXT_PUBLIC_"))).toEqual(
      [],
    );
  });
});
