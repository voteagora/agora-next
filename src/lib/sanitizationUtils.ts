/// <reference types="dompurify" />
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
