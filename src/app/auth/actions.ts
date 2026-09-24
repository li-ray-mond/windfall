"use server";

/**
 * The server actions behind the sign-in forms.
 *
 * These run on the server, which makes the validation here the one that
 * counts. The browser checks the same rules first, but only so mistakes
 * show up instantly; a form submission can be crafted by hand, so the
 * server can never rely on the browser having checked anything.
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signUpSchema,
} from "@/lib/auth/schemas";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** What a form action hands back to its page so the result can be shown. */
export type AuthFormState = {
  /** A problem with the submission as a whole, shown above the fields. */
  error?: string;
  /** Problems with individual fields, keyed by field name. */
  fieldErrors?: Record<string, string[] | undefined>;
  /** A confirmation shown in place of an error, such as "check your email". */
  notice?: string;
};

/**
 * Reads a form field as text.
 *
 * @param formData - The submitted form.
 * @param name - The field's name attribute.
 * @returns The value, or an empty string when the field is missing.
 */
function field(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "");
}

/**
 * Turns Zod's report into the per-field messages the forms display.
 *
 * @param error - The failure from a schema's `safeParse`.
 * @returns Form state carrying one list of messages per field.
 */
function fieldErrorsFrom(error: z.ZodError): AuthFormState {
  return { fieldErrors: z.flattenError(error).fieldErrors };
}

/**
 * Works out the address this deployment is being served from, so links in
 * emails come back to where the user actually is rather than to production.
 *
 * @returns An origin such as `https://windfall-seven.vercel.app`.
 */
async function currentOrigin(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  // Vercel sets x-forwarded-proto. Local development is the only case that
  // runs without TLS, so it is the only reason for the fallback.
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

/**
 * Creates an account and sends its confirmation email.
 *
 * @param _previousState - The last result, which this action does not need.
 * @param formData - The submitted signup form.
 * @returns Either field errors, a problem message, or a notice to show.
 */
export async function signUp(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });

  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { emailRedirectTo: `${await currentOrigin()}/auth/confirm` },
  });

  if (error) {
    return { error: error.message };
  }

  // Worded so it reads the same whether or not that address already had an
  // account. Saying "this email is taken" would let anyone use the form to
  // find out who has signed up.
  return {
    notice:
      "Check your email for a confirmation link. You can close this page.",
  };
}

/**
 * Signs an existing user in and sends them to the dashboard.
 *
 * @param _previousState - The last result, which this action does not need.
 * @param formData - The submitted login form.
 * @returns Form state describing the problem; on success it redirects instead.
 */
export async function signIn(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: field(formData, "email"),
    password: field(formData, "password"),
  });

  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // Deliberately vague, and identical for a wrong password and an address
    // with no account, so the form cannot be used to discover who has one.
    return { error: "That email and password don't match an account." };
  }

  // Outside the checks above, because redirect works by throwing: putting it
  // in a try block would swallow it and the redirect would never happen.
  redirect("/dashboard");
}

/**
 * Signs the current user out and returns them to the homepage.
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  redirect("/");
}

/**
 * Emails a password reset link, if that address has an account.
 *
 * @param _previousState - The last result, which this action does not need.
 * @param formData - The submitted "forgot password" form.
 * @returns Either field errors or a notice to show.
 */
export async function requestPasswordReset(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: field(formData, "email"),
  });

  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await currentOrigin()}/auth/confirm`,
  });

  // The same notice either way, and the provider's result is ignored on
  // purpose: telling the visitor whether the email was found would turn this
  // form into a way of checking who has an account.
  return {
    notice: "If that address has an account, a reset link is on its way to it.",
  };
}

/**
 * Sets a new password for the user who followed a reset link.
 *
 * @param _previousState - The last result, which this action does not need.
 * @param formData - The submitted "new password" form.
 * @returns Form state describing the problem; on success it redirects instead.
 */
export async function updatePassword(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    password: field(formData, "password"),
    confirmPassword: field(formData, "confirmPassword"),
  });

  if (!parsed.success) {
    return fieldErrorsFrom(parsed.error);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}
