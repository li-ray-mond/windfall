"use client";

/**
 * The live list of password requirements, shown while someone types.
 *
 * Every row here is something the form genuinely enforces. A checklist that
 * shows rules the server doesn't apply, or hides rules it does, is worse than
 * no checklist: it teaches people that the feedback can't be trusted.
 *
 * There is deliberately no row about capitals, digits or symbols, because
 * nothing in the app requires them. The reasoning is recorded alongside
 * MINIMUM_PASSWORD_LENGTH in lib/auth/schemas.ts.
 */

import { MINIMUM_PASSWORD_LENGTH } from "@/lib/auth/schemas";

type PasswordChecklistProps = {
  /** What is currently in the password box. */
  password: string;
  /** What is currently in the confirmation box. */
  confirmPassword: string;
};

type Requirement = {
  /** The text shown to the reader. */
  label: string;
  /** Whether the rule is currently satisfied. */
  met: boolean;
  /** False until there is something typed that this rule could judge. */
  started: boolean;
};

/**
 * Renders the tick, cross, or neutral dot in front of one requirement.
 *
 * @param props - Whether the rule is met, and whether it applies yet.
 * @returns The marker, hidden from screen readers since the text beside it says the same thing.
 */
function Marker({ met, started }: { met: boolean; started: boolean }) {
  if (!started) {
    return (
      <span aria-hidden="true" className="text-zinc-400 dark:text-zinc-600">
        &bull;
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      className={
        met
          ? "text-emerald-600 dark:text-emerald-400"
          : "text-red-600 dark:text-red-400"
      }
    >
      {met ? "✓" : "✕"}
    </span>
  );
}

/**
 * Shows which password requirements are met, updating as the boxes change.
 *
 * @param props - The current contents of the two password boxes.
 * @returns The checklist.
 */
export function PasswordChecklist({
  password,
  confirmPassword,
}: PasswordChecklistProps) {
  const requirements: Requirement[] = [
    {
      label: `At least ${MINIMUM_PASSWORD_LENGTH} characters`,
      met: password.length >= MINIMUM_PASSWORD_LENGTH,
      // Nothing typed yet means nothing to judge. Greeting someone with a
      // column of red crosses before they have touched the form reads as
      // being told off for turning up.
      started: password.length > 0,
    },
    {
      label: "Both passwords match",
      met: password.length > 0 && password === confirmPassword,
      started: confirmPassword.length > 0,
    },
  ];

  return (
    // No aria-live here on purpose. The list changes on every keystroke, so
    // announcing it would talk over someone typing. The state of each row is
    // still readable, because it is written out in the text below.
    <ul className="flex flex-col gap-1.5 text-sm text-zinc-600 dark:text-zinc-400">
      {requirements.map((requirement) => (
        <li key={requirement.label} className="flex items-center gap-2">
          <Marker met={requirement.met} started={requirement.started} />
          <span className="sr-only">
            {!requirement.started
              ? "Not yet: "
              : requirement.met
                ? "Met: "
                : "Not met: "}
          </span>
          <span>{requirement.label}</span>
        </li>
      ))}
    </ul>
  );
}
