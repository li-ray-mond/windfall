"use client";

/**
 * The small pieces the four sign-in forms are built from.
 *
 * They exist so each form doesn't repeat the same label, input, error and
 * button markup, and so a change to how a validation message looks happens
 * in one place rather than four.
 */

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type TextFieldProps = {
  /** The visible label. */
  label: string;
  /** The field's name, which is also how the server action reads it. */
  name: string;
  /** Which on-screen keyboard and masking the browser should use. */
  type: "email" | "password";
  /** Tells password managers what this field holds, e.g. "current-password". */
  autoComplete: string;
  /** Validation messages for this field, if the last submission had any. */
  errors?: string[];
  /**
   * Called with the current text whenever it changes.
   *
   * The input stays uncontrolled; this only reports what was typed, so a
   * page can show live feedback without owning the value.
   */
  onChange?: (value: string) => void;
};

/**
 * A labelled input with its validation message underneath.
 *
 * @param props - The field's label, name, type, autocomplete hint, and errors.
 * @returns The field, ready to place inside a form.
 */
export function TextField({
  label,
  name,
  type,
  autoComplete,
  errors,
  onChange,
}: TextFieldProps) {
  const errorId = `${name}-error`;
  const hasError = errors !== undefined && errors.length > 0;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        onChange={
          onChange ? (event) => onChange(event.target.value) : undefined
        }
        // These two attributes are what let a screen reader announce the
        // error with the field, rather than reading it as loose text.
        aria-invalid={hasError || undefined}
        aria-describedby={hasError ? errorId : undefined}
        className="rounded-md border border-zinc-300 px-3 py-2 text-base outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500"
      />
      {hasError ? (
        <p id={errorId} className="text-sm text-red-600 dark:text-red-400">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

/**
 * The form's submit button, which disables itself while the form is sending.
 *
 * @param props - `children` is the button's normal label.
 * @returns The button.
 */
export function SubmitButton({ children }: { children: ReactNode }) {
  // useFormStatus reports on the form this button sits inside, which is why
  // the button has to be its own component rather than inline markup.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-zinc-900 px-4 py-2 text-base font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? "Working…" : children}
    </button>
  );
}

/**
 * A message about the submission as a whole, shown above the fields.
 *
 * @param props - `tone` picks the colour; `children` is the message.
 * @returns The message block.
 */
export function FormMessage({
  tone,
  children,
}: {
  tone: "error" | "notice";
  children: ReactNode;
}) {
  const toneClasses =
    tone === "error"
      ? "border-red-300 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
      : "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";

  return (
    <p
      // Announces the message when it appears, without moving focus.
      role="status"
      className={`rounded-md border px-3 py-2 text-sm ${toneClasses}`}
    >
      {children}
    </p>
  );
}
