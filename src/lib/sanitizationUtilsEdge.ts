/**
 * Utilities that are safe to use in Edge Runtime contexts.
 * These functions must not use any browser APIs or dependencies that require window/document.
 */

/**
 * Decode HTML entities to human-readable text.
 * Safe for server-side use without DOM dependencies.
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&"); // Do this last to avoid double-decoding
}

/**
 * Server-safe sanitization for OG image parameters and other edge runtime contexts.
 * Does not use DOMPurify (no window dependency) and is safe for server-side use.
 * Returns human-readable text suitable for display in images.
 */
export function sanitizeOgParam(value: string | null): string {
  if (!value) return "";

  // First decode any HTML entities to make text human-readable
  let decoded = decodeHtmlEntities(value);

  // Remove HTML tags (security)
  decoded = decoded.replace(/<[^>]*>/g, "");

  // Remove dangerous characters but keep normal punctuation for readability
  decoded = decoded.replace(/[<>]/g, ""); // Remove angle brackets (could be script tags)

  return decoded;
}
