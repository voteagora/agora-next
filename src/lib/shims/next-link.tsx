/*
 * Vite shim for `next/link`.
 *
 * next/link uses Next.js router internals for client-side navigation.
 * Under TanStack Start we render a plain <a> element, which is sufficient
 * for all in-app links since TanStack Router's own Link components handle
 * navigation at the route level.  Components that need prefetching or
 * typed params should migrate to `<Link>` from @tanstack/react-router.
 *
 * Props handled: href (string | object), className, children, target, rel,
 *   prefetch (ignored), replace (ignored), scroll (ignored), shallow (ignored).
 * `as` and `locale` are Next.js-specific and silently dropped.
 */

import React from "react";

export interface NextLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  href: string | { pathname?: string; query?: Record<string, string> };
  prefetch?: boolean;
  replace?: boolean;
  scroll?: boolean;
  shallow?: boolean;
  locale?: string | false;
  as?: string;
  children?: React.ReactNode;
}

const NextLinkShim = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
  function NextLinkShim(
    {
      href,
      // intentionally unused next/link-specific props
      prefetch: _prefetch,
      replace: _replace,
      scroll: _scroll,
      shallow: _shallow,
      locale: _locale,
      as: _as,
      children,
      ...rest
    },
    ref
  ) {
    const resolvedHref =
      typeof href === "string"
        ? href
        : [
            href.pathname ?? "",
            href.query ? "?" + new URLSearchParams(href.query).toString() : "",
          ].join("");

    return (
      <a ref={ref} href={resolvedHref} {...rest}>
        {children}
      </a>
    );
  }
);

NextLinkShim.displayName = "Link";

export default NextLinkShim;
