/**
 * Tests for the sign-in form rules.
 *
 * Each test names the reason the rule exists, not just the behaviour, since
 * the reasons are what a future change could quietly break.
 */

import { describe, expect, it } from "vitest";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "./schemas";

describe("signUpSchema", () => {
  it("accepts a valid email and password", () => {
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: "long-enough",
    });

    expect(result.success).toBe(true);
  });

  it("trims spaces around the email, so a copied address still works", () => {
    const result = signUpSchema.safeParse({
      email: "  traveller@example.com  ",
      password: "long-enough",
    });

    expect(result.success && result.data.email).toBe("traveller@example.com");
  });

  it("rejects a password below the minimum length", () => {
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts a short password, so raising the minimum can't lock out an existing account", () => {
    const result = loginSchema.safeParse({
      email: "traveller@example.com",
      password: "old",
    });

    expect(result.success).toBe(true);
  });

  it("still requires a password to be typed", () => {
    const result = loginSchema.safeParse({
      email: "traveller@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("forgotPasswordSchema", () => {
  it("rejects an address that isn't an email", () => {
    expect(forgotPasswordSchema.safeParse({ email: "traveller" }).success).toBe(
      false,
    );
  });
});

describe("resetPasswordSchema", () => {
  it("rejects two different passwords, so a typo can't lock the user out", () => {
    const result = resetPasswordSchema.safeParse({
      password: "long-enough",
      confirmPassword: "long-enougg",
    });

    expect(result.success).toBe(false);
  });

  it("reports the mismatch on the confirmation field, where the user is looking", () => {
    const result = resetPasswordSchema.safeParse({
      password: "long-enough",
      confirmPassword: "long-enougg",
    });

    expect(result.success).toBe(false);
    expect(result.success === false && result.error.issues[0].path).toEqual([
      "confirmPassword",
    ]);
  });
});
