/**
 * Next.js configuration.
 *
 * Importing the environment loader here makes `next dev` and `next build`
 * validate environment variables before doing anything else, so a missing
 * or invalid value stops the app immediately with a clear message.
 */

import type { NextConfig } from "next";
import "./src/env/server";

const nextConfig: NextConfig = {};

export default nextConfig;
