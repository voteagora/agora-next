/*
 * Vite shim for `next` package types.
 *
 * Provides minimal type exports used by legacy code that's still compiled
 * but not executed in TanStack Start (e.g., generateMetadata helpers).
 */

export type Metadata = {
  title?: string;
  description?: string;
  metadataBase?: URL;
  alternates?: { canonical?: string };
  openGraph?: {
    type?: string;
    title?: string;
    description?: string;
    url?: string;
    images?: Array<{
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    }>;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    images?: string[];
  };
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
};
