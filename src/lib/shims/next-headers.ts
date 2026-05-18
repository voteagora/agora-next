/*
 * Vite shim for `next/headers`.
 *
 * next/headers is a Next.js App Router API for accessing request headers and
 * cookies server-side. Under TanStack Start, server code uses
 * `@tanstack/react-start/server` instead.
 *
 * This shim provides type-compatible stubs so files that import from
 * next/headers still compile. Any file that actually calls these functions
 * at runtime must be ported to use TanStack Start's cookie/header APIs.
 */

export function headers(): Headers {
  throw new Error("next/headers is not available in TanStack Start");
}

export function cookies(): never {
  throw new Error("next/headers is not available in TanStack Start");
}
