"use client";

/**
 * The "forgot password" page, at /forgot-password.
 *
 * Asks for an email address and sends a reset link to it.
 */

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type AuthFormState } from "@/app/auth/actions";
import {
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/auth/form-parts";

const emptyState: AuthFormState = {};

/**
 * Renders the reset-request form, or the notice once it has been sent.
 *
 * @returns The forgot-password page.
 */
export default function ForgotPasswordPage() {
  const [state, submit] = useActionState(requestPasswordReset, emptyState);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">
        Reset your password
      </h1>

      {state.notice ? (
        <FormMessage tone="notice">{state.notice}</FormMessage>
      ) : (
        <form action={submit} className="flex flex-col gap-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter the email address on your account and we&rsquo;ll send you a
            link to choose a new password.
          </p>

          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            errors={state.fieldErrors?.email}
          />

          <SubmitButton>Send reset link</SubmitButton>
        </form>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/login" className="underline">
          Back to log in
        </Link>
      </p>
    </main>
  );
}
