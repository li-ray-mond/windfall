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
  MINIMUM_PASSWORD_LENGTH,
  resetPasswordSchema,
  signUpSchema,
} from "./schemas";

/** A password comfortably over the minimum, used wherever the length isn't the point. */
const validPassword = "correct horse battery staple";

/** Exactly one character short, built from the constant so it survives a change to it. */
const tooShortPassword = "a".repeat(MINIMUM_PASSWORD_LENGTH - 1);

describe("signUpSchema", () => {
  it("accepts a valid email and two matching passwords", () => {
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: validPassword,
      confirmPassword: validPassword,
    });

    expect(result.success).toBe(true);
  });

  it("trims spaces around the email, so a copied address still works", () => {
    const result = signUpSchema.safeParse({
      email: "  traveller@example.com  ",
      password: validPassword,
      confirmPassword: validPassword,
    });

    expect(result.success && result.data.email).toBe("traveller@example.com");
  });

  it("rejects a password one character short of the minimum", () => {
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: tooShortPassword,
      confirmPassword: tooShortPassword,
    });

    expect(result.success).toBe(false);
  });

  it("accepts a password of exactly the minimum length", () => {
    const exactly = "a".repeat(MINIMUM_PASSWORD_LENGTH);
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: exactly,
      confirmPassword: exactly,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a long passphrase with no digits, capitals or symbols, because composition rules are deliberately not applied", () => {
    const passphrase = "several plain lowercase words";
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: passphrase,
      confirmPassword: passphrase,
    });

    expect(result.success).toBe(true);
  });

  it("rejects two different passwords, so a typo can't create an account nobody can open", () => {
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: validPassword,
      confirmPassword: `${validPassword}x`,
    });

    expect(result.success).toBe(false);
  });

  it("reports a signup mismatch on the confirmation field, where the user is looking", () => {
    const result = signUpSchema.safeParse({
      email: "traveller@example.com",
      password: validPassword,
      confirmPassword: `${validPassword}x`,
    });

    expect(result.success === false && result.error.issues[0].path).toEqual([
      "confirmPassword",
    ]);
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
      password: validPassword,
      confirmPassword: `${validPassword}x`,
    });

    expect(result.success).toBe(false);
  });

  it("reports the mismatch on the confirmation field, where the user is looking", () => {
    const result = resetPasswordSchema.safeParse({
      password: validPassword,
      confirmPassword: `${validPassword}x`,
    });

    expect(result.success === false && result.error.issues[0].path).toEqual([
      "confirmPassword",
    ]);
  });
});
