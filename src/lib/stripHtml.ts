export function stripHtmlToText(input: string): string {
  if (!input) return "";

  // Replace common block separators with spaces
  let text = input
    .replace(/<\s*br\s*\/?\s*>/gi, " ")
    .replace(/<\s*\/p\s*>/gi, " ")
    .replace(/<\s*li\s*>/gi, " • ");

  // Remove all remaining tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode a few common HTML entities
  const entities: Record<string, string> = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };

  text = text.replace(
    /(&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;)/g,
    (m) => entities[m] || m
  );

  // Decode numeric entities (e.g., &#x27; or &#39;)
  text = text.replace(
    /&#(x?)([0-9a-fA-F]+);/g,
    (_, hex: string, code: string) => {
      const num = hex ? parseInt(code, 16) : parseInt(code, 10);
      if (Number.isFinite(num)) {
        try {
          return String.fromCodePoint(num);
        } catch {}
      }
      return "";
    }
  );

  // Collapse whitespace and trim
  return text.replace(/\s+/g, " ").trim();
}
