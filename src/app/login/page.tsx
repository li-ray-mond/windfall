"use client";

/**
 * The login page, at /login.
 *
 * A client component, because the form needs to show whatever the server
 * action hands back without reloading the page.
 */

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/app/auth/actions";
import {
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/auth/form-parts";

const emptyState: AuthFormState = {};

/**
 * Renders the login form.
 *
 * @returns The login page.
 */
export default function LoginPage() {
  const [state, submit] = useActionState(signIn, emptyState);

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>

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
          autoComplete="current-password"
          errors={state.fieldErrors?.password}
        />

        <SubmitButton>Log in</SubmitButton>
      </form>

      <div className="flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/forgot-password" className="underline">
          Forgot your password?
        </Link>
        <p>
          No account yet?{" "}
          <Link href="/signup" className="underline">
            Sign up
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
