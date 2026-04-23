"use client";

import React, { useMemo, useState, useLayoutEffect } from "react";
import {
  PROSE_LINKS,
  PROSE_MEDIA,
  PROSE_PRIMARY_BODY,
} from "@/components/duna-editor/proseThemeClasses";
import InternalLinkEmbed from "@/components/ForumShared/Embeds/InternalLinkEmbed";
import Markdown from "@/components/shared/Markdown/Markdown";
import { sanitizeForumContent } from "@/lib/sanitizationUtils";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";

interface DunaContentRendererProps {
  content: string;
  className?: string;
  enableEmbeds?: boolean;
}

function isInternalEmbeddableLink(href: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const url = new URL(href, window.location.origin);

    if (url.origin !== window.location.origin) {
      return false;
    }

    const pathname = url.pathname;

    if (pathname.match(/^\/proposals\/[^\/]+$/)) {
      return true;
    }

    if (pathname.match(/^\/delegates\/[^\/]+$/)) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

function parseContentWithEmbeds(htmlContent: string): React.ReactNode {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const processNode = (node: Node, key: string): React.ReactNode => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || null;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return null;
    }

    const element = node as Element;

    if (element.tagName === "A") {
      const href = element.getAttribute("href") || "";
      const linkText = element.textContent || "";
      const className =
        element.getAttribute("class") ||
        "text-primary underline hover:no-underline font-medium";

      const linkElement = (
        <a
          href={href}
          className={className}
          target={isInternalEmbeddableLink(href) ? undefined : "_blank"}
          rel={
            isInternalEmbeddableLink(href) ? undefined : "noopener noreferrer"
          }
        >
          {linkText}
        </a>
      );

      if (isInternalEmbeddableLink(href)) {
        return (
          <InternalLinkEmbed key={key} href={href} originalLink={linkElement} />
        );
      }

      return <React.Fragment key={key}>{linkElement}</React.Fragment>;
    }

    const voidElements = new Set([
      "BR",
      "HR",
      "IMG",
      "INPUT",
      "META",
      "LINK",
      "AREA",
      "BASE",
      "COL",
      "EMBED",
      "SOURCE",
      "TRACK",
      "WBR",
    ]);

    if (voidElements.has(element.tagName)) {
      const Tag = element.tagName.toLowerCase() as keyof JSX.IntrinsicElements;
      const attributes = Object.fromEntries(
        Array.from(element.attributes).map((attr) => [attr.name, attr.value])
      );
      return <Tag key={key} {...attributes} />;
    }

    const children = Array.from(element.childNodes).map((child, index) =>
      processNode(child, `${key}-${index}`)
    );

    const Tag = element.tagName.toLowerCase() as keyof JSX.IntrinsicElements;
    const attributes = Object.fromEntries(
      Array.from(element.attributes).map((attr) => [attr.name, attr.value])
    );

    return (
      <Tag key={key} {...attributes}>
        {children}
      </Tag>
    );
  };

  const elements = Array.from(doc.body.childNodes).map((node, index) =>
    processNode(node, `node-${index}`)
  );

  return <>{elements}</>;
}

function looksLikeHtml(text: string): boolean {
  const t = text.trim();
  if (t.startsWith("#") || /^\s*#+\s/m.test(t)) return false;
  if (/^\s*>\s/m.test(t) || /^\s*[-*]\s/m.test(t)) return false;
  if (t.includes("**") || t.includes("![")) return false;
  if (/^\s*\d+\.\s/m.test(t)) return false;
  return t.startsWith("<") || t.includes("</");
}

export default function DunaContentRenderer({
  content,
  className,
  enableEmbeds = true,
}: DunaContentRendererProps) {
  const { ui } = Tenant.current();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const sanitizedContent = useMemo(
    () => sanitizeForumContent(content),
    [content]
  );
  const isMarkdown = !looksLikeHtml(sanitizedContent);
  const renderedContent = useMemo(() => {
    if (isMarkdown) {
      return (
        <div
          className={cn(
            "p-4 prose prose-sm max-w-none",
            PROSE_PRIMARY_BODY,
            PROSE_LINKS,
            PROSE_MEDIA
          )}
        >
          <Markdown content={sanitizedContent} originalHierarchy />
        </div>
      );
    }
    if (!enableEmbeds || !mounted) {
      return <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />;
    }
    return parseContentWithEmbeds(sanitizedContent);
  }, [enableEmbeds, isMarkdown, mounted, sanitizedContent]);

  if (!content) return null;

  return (
    <div
      data-testid="duna-content"
      className={cn(
        "text-sm prose prose-sm max-w-none",
        PROSE_PRIMARY_BODY,
        PROSE_LINKS,
        PROSE_MEDIA,
        className
      )}
      style={{
        fontSize: "inherit",
        lineHeight: "inherit",
      }}
    >
      {renderedContent}
    </div>
  );
}
