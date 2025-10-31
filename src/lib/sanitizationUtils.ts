export function sanitizeContent(content: string): string {
  // Remove dangerous content and tags
  let cleaned = content
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove style tags and their content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    // Remove iframe, frame, object, embed, form tags
    .replace(/<(iframe|frame|object|embed|form)\b[^>]*>[\s\S]*?<\/\1>/gi, "")
    // Remove self-closing dangerous tags
    .replace(/<(iframe|frame|object|embed|form|img|input)\b[^>]*\/>/gi, "")
    // Remove event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
    // Remove javascript: and data: protocols
    .replace(/href\s*=\s*["']?\s*javascript:/gi, "href=")
    .replace(/src\s*=\s*["']?\s*javascript:/gi, "src=")
    .replace(/href\s*=\s*["']?\s*data:/gi, "href=")
    .replace(/src\s*=\s*["']?\s*data:/gi, "src=")
    // Remove eval, atob calls
    .replace(/eval\s*\([^)]*\)/gi, "")
    .replace(/atob\s*\([^)]*\)/gi, "")
    // Remove HTML entities that could be used for obfuscation
    .replace(/&#x?[0-9a-fA-F]+;/g, "")
    // Remove backslash escapes
    .replace(/\\x[0-9a-fA-F]{2}/g, "")
    .replace(/\\u[0-9a-fA-F]{4}/g, "")
    // Remove markdown links with javascript
    .replace(/\[([^\]]+)\]\([^)]*javascript:[^)]+\)/gi, "$1");

  // Remove all HTML tags except safe ones
  const allowedTags = [
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
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
  ];

  const allowedTagsPattern = allowedTags.join("|");

  // Remove all tags except allowed ones (including their attributes)
  cleaned = cleaned.replace(
    /<\/?(?!(?:\/)?(?:${allowedTagsPattern})\b)[^>]+>/gi,
    ""
  );

  // Remove all attributes from allowed tags (keep only the tags)
  cleaned = cleaned.replace(
    new RegExp(`<(${allowedTagsPattern})\\b[^>]*>`, "gi"),
    "<$1>"
  );

  return cleaned;
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
