/**
 * Polyfill for React's `cache()` in Vite SSR.
 *
 * React.cache is a React Server Components API (requires the `react-server`
 * module condition that Next.js enables). Vite SSR resolves `react` via the
 * standard `node` condition, which doesn't include `cache`.
 *
 * In Next.js RSC, `cache()` is request-scoped: identical calls within one
 * render return the same promise. In TanStack Start's SSR we use a simple
 * no-op that returns the function unchanged — each call goes to the database
 * as usual, which is correct for a Vite SSR environment where there is no
 * React request-context to memoize into.
 */
export function cache<T extends (...args: unknown[]) => unknown>(fn: T): T {
  return fn;
}
