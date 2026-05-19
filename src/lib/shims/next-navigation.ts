/*
 * Vite shim for `next/navigation`.
 *
 * next/navigation hooks require Next.js App Router internals and crash under
 * Vite / TanStack Start ("invariant expected app router to be mounted").
 * This shim maps each hook to its TanStack Router / browser equivalent so
 * that the 59 component files importing next/navigation keep working without
 * source changes during the migration.
 *
 * Migration note (§4.2 step 6 of MIGRATION_TANSTACK_START.md):
 *   useRouter       → useNavigate (+ push/replace/back wrappers)
 *   usePathname     → useLocation().pathname
 *   useSearchParams → useSearch({ strict: false })
 *   useParams       → useParams({ strict: false })
 *   redirect        → throw redirect({ to }) from @tanstack/react-router
 *   notFound        → throw notFound()  from @tanstack/react-router
 *
 * When Phase F cuts over, replace these import sites with direct TanStack
 * imports and delete this shim.
 */

import {
  useNavigate,
  useLocation,
  useParams as useTSParams,
  redirect as tsRedirect,
  notFound as tsNotFound,
} from "@tanstack/react-router";

// ─── useRouter ────────────────────────────────────────────────────────────────

/**
 * Drop-in for `useRouter()` from next/navigation.
 * Returns an object with the subset of Next.js router methods that the
 * codebase actually calls (push, replace, back, forward, refresh, prefetch).
 */
export function useRouter() {
  const navigate = useNavigate();

  return {
    push(href: string, _options?: Record<string, unknown>) {
      navigate({ href } as never);
    },
    replace(href: string, _options?: Record<string, unknown>) {
      navigate({ href, replace: true } as never);
    },
    back() {
      window.history.back();
    },
    forward() {
      window.history.forward();
    },
    refresh() {
      window.location.reload();
    },
    /** no-op in TanStack Start — preloading is handled by defaultPreload */
    prefetch(_href: string) {},
  };
}

// ─── usePathname ──────────────────────────────────────────────────────────────

export function usePathname(): string {
  const location = useLocation();
  return location.pathname;
}

// ─── useSearchParams ──────────────────────────────────────────────────────────

/**
 * Returns a read-only URLSearchParams instance, matching the Next.js
 * `useSearchParams()` signature which returns `ReadonlyURLSearchParams | null`
 * — NOT the `[params, setter]` tuple that React Router exports.
 *
 * Callers that need to mutate search params should migrate to nuqs or
 * useNavigate({ search: … }) at Phase F.
 */
export function useSearchParams(): URLSearchParams | null {
  const location = useLocation();
  const search = location.search;

  if (typeof search === "string") {
    return new URLSearchParams(search);
  }

  const params = new URLSearchParams();
  Object.entries(search ?? {}).forEach(([key, value]) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item != null) params.append(key, String(item));
      });
      return;
    }
    params.set(key, String(value));
  });

  return params;
}

// ─── useParams ────────────────────────────────────────────────────────────────

export function useParams<
  T extends Record<string, string> = Record<string, string>,
>(): T {
  // strict: false lets us call this outside a specific route context, matching
  // the Next.js semantics where any component can call useParams().
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (useTSParams as any)({ strict: false }) as T;
}

// ─── redirect / notFound ──────────────────────────────────────────────────────

/** Throws a TanStack Router redirect — must be called from a loader / beforeLoad. */
export function redirect(url: string): never {
  throw tsRedirect({ href: url });
}

/** Throws a TanStack Router not-found signal. */
export function notFound(): never {
  throw tsNotFound();
}

// ─── permanentRedirect ────────────────────────────────────────────────────────

/** Alias for redirect (TanStack Start has no 308 vs 307 distinction). */
export function permanentRedirect(url: string): never {
  return redirect(url);
}
