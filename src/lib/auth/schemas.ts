/**
 * Validation rules for the sign-in forms.
 *
 * These live apart from the pages and the server actions for two reasons.
 * The rules can be unit-tested on their own, and the same rule object is
 * used on both sides of the request: the browser checks before sending, so
 * mistakes are caught instantly, and the server checks again on arrival,
 * because anything a browser sends can be tampered with on the way.
 */

import { z } from "zod";

/**
 * The shortest password accepted for a new account.
 *
 * Supabase's own floor is lower, but its rejection message is written for
 * developers rather than for the person filling in the form.
 */
export const MINIMUM_PASSWORD_LENGTH = 8;

// Trimmed before checking, so a stray space copied in alongside an address
// doesn't read as an invalid email to someone who cannot see it.
const emailField = z
  .string()
  .trim()
  .pipe(z.email("Enter a valid email address, such as you@example.com."));

const newPasswordField = z
  .string()
  .min(
    MINIMUM_PASSWORD_LENGTH,
    `Use at least ${MINIMUM_PASSWORD_LENGTH} characters.`,
  );

/** What the signup form must contain before it is sent to Supabase. */
export const signUpSchema = z.object({
  email: emailField,
  password: newPasswordField,
});

/**
 * What the login form must contain.
 *
 * The password only has to be present here, not to meet the length rule. An
 * existing account may predate a change to that rule, and applying it on
 * login would lock someone out using a password that is entirely correct.
 */
export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Enter your password."),
});

/** What the "forgot password" form must contain. */
export const forgotPasswordSchema = z.object({
  email: emailField,
});

/**
 * What the "choose a new password" form must contain.
 *
 * Asking twice catches a typo. Without it a mistyped password would be set
 * successfully, locking the user out of the account they were recovering.
 */
export const resetPasswordSchema = z
  .object({
    password: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine((fields) => fields.password === fields.confirmPassword, {
    message: "Both passwords must match.",
    path: ["confirmPassword"],
  });
