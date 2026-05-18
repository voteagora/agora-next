/*
 * Vite shim for `next/og`.
 *
 * next/og provides ImageResponse for generating Open Graph images using
 * React components. The OG image routes in src/app/api/images/og/ still
 * use this API and are not yet ported to TanStack Start.
 *
 * This shim extends the standard Response class to satisfy the TypeScript
 * interface. These routes will 404 in TanStack Start until ported.
 */

interface ImageResponseOptions extends ResponseInit {
  width?: number;
  height?: number;
  fonts?: unknown[];
  debug?: boolean;
  emoji?: "twemoji" | "blobmoji" | "noto" | "openmoji";
  headers?: Record<string, string>;
}

export class ImageResponse extends Response {
  constructor(element: unknown, options?: ImageResponseOptions) {
    super(null, options);
  }
}
