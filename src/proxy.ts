/**
 * Runs before every matching request, ahead of any page.
 *
 * It has two jobs. First, refresh the signed-in user's session so it doesn't
 * quietly expire while they're using the app. Second, keep signed-out
 * visitors out of pages that need an account, and send signed-in visitors
 * away from pages that only make sense when signed out.
 *
 * Next.js 16 renamed this file from `middleware.ts` to `proxy.ts`, and the
 * exported function has to be named to match.
 */

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/env/server";

/** Pages a signed-out visitor may open. Anything not listed here needs an account. */
const publicRoutes = ["/", "/login", "/signup", "/forgot-password"];

/** Pages that only make sense signed out, so a signed-in visitor is sent to the dashboard. */
const signedOutOnlyRoutes = ["/login", "/signup", "/forgot-password"];

/**
 * Decides whether a signed-out visitor is allowed to open a path.
 *
 * @param pathname - The path being requested, such as `/login`.
 * @returns True if no account is needed to see it.
 */
function isPublicRoute(pathname: string): boolean {
  // Everything under /auth/ is a handler the confirmation emails link to, so
  // it has to work before the visitor has a session.
  return publicRoutes.includes(pathname) || pathname.startsWith("/auth/");
}

/**
 * Builds a redirect that keeps any cookies written so far.
 *
 * @param pathname - Where to send the visitor.
 * @param request - The incoming request, used for the site's own origin.
 * @param carrying - The response holding cookies Supabase may have just written.
 * @returns A redirect carrying those cookies.
 */
function redirectTo(
  pathname: string,
  request: NextRequest,
  carrying: NextResponse,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const redirect = NextResponse.redirect(url);

  // A redirect is a brand new response, so anything Supabase wrote while
  // refreshing the session would be thrown away without this. Losing a
  // refreshed token mid-redirect logs the user out for no visible reason.
  carrying.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));

  return redirect;
}

/**
 * Refreshes the session and enforces which pages need an account.
 *
 * @param request - The incoming request.
 * @returns The response to send, either passing the request through or redirecting.
 */
export async function proxy(request: NextRequest): Promise<NextResponse> {
  // Start by passing the request through unchanged. If Supabase refreshes the
  // session it replaces this with a response carrying the new cookies.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    serverEnv.NEXT_PUBLIC_SUPABASE_URL,
    serverEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Supabase hands back no-cache headers here, and they matter: a
          // response carrying a fresh session cookie must never be cached,
          // or a CDN could serve one person's session to somebody else.
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    },
  );

  // getClaims checks the token's signature instead of trusting the cookie,
  // and refreshes the session when it is close to expiring. getSession would
  // read the cookie without verifying it, and a cookie can be forged.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = data?.claims != null;
  const { pathname } = request.nextUrl;

  if (!isSignedIn && !isPublicRoute(pathname)) {
    return redirectTo("/login", request, response);
  }

  if (isSignedIn && signedOutOnlyRoutes.includes(pathname)) {
    return redirectTo("/dashboard", request, response);
  }

  return response;
}

export const config = {
  // Skip Next.js's own asset routes and image files. They need no session,
  // and checking one on every icon request would be wasted work.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
