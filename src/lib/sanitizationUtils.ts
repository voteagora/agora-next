import sanitizeHtml from "sanitize-html";

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

  // Apply HTML sanitizer
  cleaned = sanitizeHtml(cleaned, {
    allowedTags: [
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
    allowedAttributes: {},
    allowVulnerableTags: false,
    disallowedTagsMode: "discard",
    allowedSchemes: [],
    allowedSchemesByTag: {},
  });

  return cleaned;
}

// Fix broken numbered lists where blank lines break the list
// In markdown, blank lines between numbered items break them into separate paragraphs
// Only fixes items that end with ":" or ":**" (header-style items with no content)
// e.g., "1. **Item 1:**\n\n2. **Item 2:**" should be "1. **Item 1:**\n2. **Item 2:**"
export function fixBrokenNumberedLists(text: string): string {
  // Remove extra blank lines between numbered list items that end with a colon
  // This is safe because items ending with ":" are clearly incomplete/header-style
  // Apply multiple times to handle consecutive items
  let result = text;
  let prev = "";
  while (result !== prev) {
    prev = result;
    // Match: numbered item ending with colon (possibly in bold), blank lines, next numbered item
    result = result.replace(
      /^(\d+\.\s+.*?:\*{0,2})(\n\s*\n+)(\d+\.\s+)/gm,
      "$1\n$3"
    );
  }
  return result;
}

export function stripMarkdown(text: string): string {
  return (
    text
      // Remove headers
      .replace(/#{1,6}\s/g, "")
      // Remove emphasis
      .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
      // Remove links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove code blocks
      .replace(/`{1,3}[^`]*`{1,3}/g, "")
      // Remove blockquotes
      .replace(/^\s*>\s+/gm, "")
      // Remove lists
      .replace(/^[\s-]*[-+*]\s+/gm, "")
      // Remove numbered lists
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove horizontal rules
      .replace(/^[\s-]*[-*_]{3,}[\s-]*$/gm, "")
      // Remove images
      .replace(/!\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Collapse whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
}
