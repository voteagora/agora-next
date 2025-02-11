import DOMPurify from "isomorphic-dompurify";

export function sanitizeContent(content: string): string {
  // Remove dangerous content
  let cleaned = content
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    .replace(/eval\(.*?\)/gi, "")
    .replace(/atob\(.*?\)/gi, "")
    .replace(/&#/g, "")
    .replace(/\\x/g, "")
    .replace(/\[([^\]]+)\]\([^)]*javascript:[^)]+\)/gi, "$1");

  // Apply DOMPurify
  cleaned = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "blockquote",
    ],
    ALLOWED_ATTR: [], // No attributes allowed
    ALLOW_DATA_ATTR: false,
    ADD_TAGS: ["p", "br", "strong"],
    FORBID_TAGS: [
      "script",
      "style",
      "iframe",
      "frame",
      "object",
      "embed",
      "form",
    ],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "href",
      "src",
      "style",
    ],
  });

  return cleaned;
}
