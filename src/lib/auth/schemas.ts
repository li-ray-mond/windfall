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
 * Length is the only thing required of a password here. There is deliberately
 * no rule demanding a mixture of uppercase, digits and symbols: NIST SP
 * 800-63B says verifiers "SHALL NOT impose other composition rules (e.g.,
 * requiring mixtures of different character types)", because such rules push
 * people towards predictable shapes like "Password1!" rather than towards
 * genuinely unguessable secrets.
 *
 * The same document asks for 15 characters when a password is the only
 * factor. 12 is the compromise taken here: Windfall guards travel plans
 * rather than money, and adding a second factor later would justify going
 * the other way, down to 8.
 *
 * TODO(phase-7): screen new passwords against a list of known-breached ones,
 * which the same standard considers more valuable than any length rule.
 */
export const MINIMUM_PASSWORD_LENGTH = 12;

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

/**
 * Checks that a password was typed the same way twice.
 *
 * @param fields - The two password values from a form.
 * @returns True when they match.
 */
function passwordsMatch(fields: {
  password: string;
  confirmPassword: string;
}): boolean {
  return fields.password === fields.confirmPassword;
}

// Shared so the signup and reset forms cannot drift into wording the same
// complaint differently, or attaching it to different fields.
const mismatchComplaint = {
  message: "Both passwords must match.",
  // Attached to the second box, which is where the person is looking.
  path: ["confirmPassword"],
};

/**
 * What the signup form must contain before it is sent to Supabase.
 *
 * The password is asked for twice. A typo in the only copy of a brand new
 * password would create an account nobody can get into, including the person
 * who just made it.
 */
export const signUpSchema = z
  .object({
    email: emailField,
    password: newPasswordField,
    confirmPassword: z.string(),
  })
  .refine(passwordsMatch, mismatchComplaint);

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
  .refine(passwordsMatch, mismatchComplaint);
