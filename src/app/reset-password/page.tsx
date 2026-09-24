"use client";

/**
 * The "choose a new password" page, at /reset-password.
 *
 * Only reachable after following a reset link, because verifying that link
 * is what signs the user in, and the proxy turns away anyone without a
 * session.
 */

import { useActionState, useState } from "react";
import { updatePassword, type AuthFormState } from "@/app/auth/actions";
import {
  FormMessage,
  SubmitButton,
  TextField,
} from "@/components/auth/form-parts";
import { PasswordChecklist } from "@/components/auth/password-checklist";

const emptyState: AuthFormState = {};

/**
 * Renders the new-password form.
 *
 * @returns The reset-password page.
 */
export default function ResetPasswordPage() {
  const [state, submit] = useActionState(updatePassword, emptyState);

  // Mirrors of the two password boxes, so the checklist can react as they
  // are typed. The inputs themselves stay uncontrolled.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16 font-sans">
      <h1 className="text-3xl font-semibold tracking-tight">
        Choose a new password
      </h1>

      <form action={submit} className="flex flex-col gap-4">
        {state.error ? (
          <FormMessage tone="error">{state.error}</FormMessage>
        ) : null}

        <TextField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          errors={state.fieldErrors?.password}
          onChange={setPassword}
        />
        <TextField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          errors={state.fieldErrors?.confirmPassword}
          onChange={setConfirmPassword}
        />

        <PasswordChecklist
          password={password}
          confirmPassword={confirmPassword}
        />

        <SubmitButton>Save new password</SubmitButton>
      </form>
    </main>
  );
}
