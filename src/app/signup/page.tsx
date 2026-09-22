"use client";

/**
 * The signup page, at /signup.
 *
 * On success the form is replaced by the "check your email" notice, since
 * signing up again would only confuse matters.
 */

import Link from "next/link";
import { useActionState } from "react";
import { signUp, type AuthFormState } from "@/app/auth/actions";
import {
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/auth/form-parts";

const emptyState: AuthFormState = {};

/**
 * Renders the signup form, or the confirmation notice once it has been sent.
 *
 * @returns The signup page.
 */
export default function SignUpPage() {
  const [state, submit] = useActionState(signUp, emptyState);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">
        Create your account
      </h1>

      {state.notice ? (
        <FormMessage tone="notice">{state.notice}</FormMessage>
      ) : (
        <form action={submit} className="flex flex-col gap-4">
          {state.error ? (
            <FormMessage tone="error">{state.error}</FormMessage>
          ) : null}

          <TextField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            errors={state.fieldErrors?.email}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            autoComplete="new-password"
            errors={state.fieldErrors?.password}
          />

          <SubmitButton>Sign up</SubmitButton>
        </form>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Log in
        </Link>
        .
      </p>
    </main>
  );
}
