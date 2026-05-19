import "react";

declare module "react" {
  // React.cache exists in the React Server Components condition used by Next.
  // React 18 stable type packages do not expose it, but this migration still
  // has server helpers that import it while TanStack Start rewrites runtime
  // usage to src/lib/shims/react-cache.ts.
  export function cache<T extends (...args: any[]) => any>(fn: T): T;
}
