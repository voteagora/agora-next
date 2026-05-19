/*
 * Vite shim for `next/og`.
 *
 * Re-exports ImageResponse from @vercel/og which is the same underlying
 * library. The five OG image routes have been ported to src/routes/api/images/og/
 * and import @vercel/og directly; this shim exists for any remaining legacy
 * references that haven't been updated yet.
 */

export { ImageResponse } from "@vercel/og";
