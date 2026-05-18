/*
 * Vite shim for `next/cache`.
 *
 * `unstable_cache`, `revalidatePath`, and `revalidateTag` are Next.js
 * data-cache primitives that require the Next.js incremental-cache
 * infrastructure. They throw ("Invariant: incrementalCache missing") the
 * moment Vite's SSR runner tries to execute them.
 *
 * Under TanStack Start / Vite:
 *   - `unstable_cache(fn, ...)` → return fn unchanged (no-op wrapper).
 *     The function still runs; it just isn't cached across requests.
 *     This is correct for dev and acceptable for the migration period.
 *   - `revalidatePath` / `revalidateTag` → no-ops (nothing to invalidate).
 *   - `unstable_noStore` → no-op (Vite SSR has no store to opt out of).
 *
 * At Phase F, call-sites that need cross-request caching should be migrated
 * to TanStack Query (`staleTime` / `gcTime` in loaders) or Vite's own cache.
 */

type CacheOptions = {
  tags?: string[];
  revalidate?: number | false;
};

/**
 * No-op replacement for Next.js `unstable_cache`.
 * Returns the original function so call sites keep working without changes.
 */
export function unstable_cache<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends (...args: any[]) => Promise<any>,
>(fn: T, _keyParts?: unknown[], _options?: CacheOptions): T {
  return fn;
}

/** No-op — TanStack Start has no path-based cache to invalidate. */
export function revalidatePath(
  _path: string,
  _type?: "layout" | "page"
): void {}

/** No-op — TanStack Start has no tag-based cache to invalidate. */
export function revalidateTag(_tag: string): void {}

/** No-op — Vite SSR has no data store to opt out of. */
export function unstable_noStore(): void {}
