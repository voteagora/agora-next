/**
 * Utilities that are safe to use in Edge Runtime contexts.
 * These functions must not use any browser APIs or dependencies that require window/document.
 */

/**
 * Server-safe sanitization for OG image parameters and other edge runtime contexts.
 * Does not use DOMPurify (no window dependency) and is safe for server-side use.
 */
export function sanitizeOgParam(value: string | null): string {
  if (!value) return "";
  // Remove HTML tags and encode special characters
  return value
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/[<>"'&]/g, (char) => {
      // Encode special characters
      switch (char) {
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        case "&":
          return "&amp;";
        default:
          return char;
      }
    });
}
