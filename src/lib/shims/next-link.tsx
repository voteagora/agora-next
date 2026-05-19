/*
 * Shim for `next/link`.
 *
 * Routes internal paths (starting with /) through TanStack Router's Link for
 * proper SPA navigation and prefetching. External URLs (http/https/mailto/tel)
 * fall back to a plain <a> element.
 *
 * Props handled: href (string | object), replace, prefetch (ignored),
 *   scroll (ignored), shallow (ignored), locale (ignored), as (ignored).
 */

import React from "react";
import { Link as TanstackLink } from "@tanstack/react-router";

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

function isExternal(href: string): boolean {
  return /^(https?:|mailto:|tel:|\/\/)/i.test(href);
}

const NextLinkShim = React.forwardRef<HTMLAnchorElement, NextLinkProps>(
  function NextLinkShim(
    {
      href,
      replace,
      // intentionally unused next/link-specific props
      prefetch: _prefetch,
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

    if (isExternal(resolvedHref)) {
      return (
        <a ref={ref} href={resolvedHref} {...rest}>
          {children}
        </a>
      );
    }

    return (
      <TanstackLink
        ref={ref}
        to={resolvedHref}
        replace={replace}
        {...(rest as object)}
      >
        {children}
      </TanstackLink>
    );
  }
);

NextLinkShim.displayName = "Link";

export default NextLinkShim;
