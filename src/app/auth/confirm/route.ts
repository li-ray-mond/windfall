/**
 * Handles the links sent in confirmation and password-reset emails.
 *
 * The email contains a one-time token rather than a session. This handler
 * exchanges that token for a real session and then sends the visitor on to
 * the right page. Doing the exchange on the server means the link works from
 * any device, including a phone that has never visited the site before.
 */

import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** Where a missing, altered, already-used, or expired link ends up. */
const LINK_PROBLEM_PATH = "/auth/link-problem";

/**
 * Checks the `next` value from the link before trusting it as a destination.
 *
 * @param next - The raw value from the query string, which anyone can edit.
 * @returns A path within this site, falling back to the dashboard.
 */
function safeDestination(next: string | null): string {
  // Only paths on this site are allowed. Without this, someone could send
  // out a link that verifies against Windfall and then bounces the visitor
  // to a site they control, which is exactly what makes a phishing link look
  // genuine. A leading "//" is rejected because browsers read it as the
  // start of another domain.
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return "/dashboard";
}

/**
 * Verifies the token from an email link and starts the user's session.
 *
 * @param request - The incoming request, carrying the token in its query string.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const destination = safeDestination(searchParams.get("next"));

  if (!tokenHash || !type) {
    redirect(LINK_PROBLEM_PATH);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    redirect(LINK_PROBLEM_PATH);
  }

  redirect(destination);
}
