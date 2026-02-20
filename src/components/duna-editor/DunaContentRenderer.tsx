"use client";

import React, { useMemo, useState, useLayoutEffect } from "react";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import InternalLinkEmbed from "@/components/ForumShared/Embeds/InternalLinkEmbed";
import Markdown from "@/components/shared/Markdown/Markdown";

// Function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  // More robust HTML entity decoding
  const entities: { [key: string]: string } = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#39;": "'",
    "&nbsp;": " ",
  };

  let decoded = text;
  Object.entries(entities).forEach(([entity, char]) => {
    decoded = decoded.replace(new RegExp(entity, "g"), char);
  });

  return decoded;
}

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
  return t.startsWith("<") || t.includes("</");
}

export default function DunaContentRenderer({
  content,
  className,
  enableEmbeds = true,
}: DunaContentRendererProps) {
  if (!content) return null;

  const { ui } = Tenant.current();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const decodedContent = decodeHtmlEntities(content);
  const isMarkdown = !looksLikeHtml(decodedContent);

  const renderedContent = useMemo(() => {
    if (isMarkdown) {
      return (
        <div className="p-4 prose prose-sm max-w-none">
          <Markdown content={decodedContent} originalHierarchy />
        </div>
      );
    }
    if (!enableEmbeds || !mounted) {
      return <div dangerouslySetInnerHTML={{ __html: decodedContent }} />;
    }
    return parseContentWithEmbeds(decodedContent);
  }, [decodedContent, enableEmbeds, mounted, isMarkdown]);

  return (
    <div
      data-testid="duna-content"
      className={cn(
        "text-sm prose prose-sm max-w-none",
        ui.customization?.cardBackground
          ? "prose-p:text-white prose-blockquote:text-white prose-code:text-white prose-pre:text-white prose-headings:text-white prose-strong:text-white prose-b:text-white prose-em:text-white prose-i:text-white prose-del:text-white prose-ins:text-white prose-mark:text-white prose-s:text-white prose-a:text-white prose-li:text-white prose-ul:text-white prose-ol:text-white prose-img:rounded-lg"
          : "prose-a:text-primary prose-a:underline hover:prose-a:no-underline prose-img:rounded-lg",
        "prose-a:font-medium prose-img:max-w-full prose-img:h-auto prose-img:my-2",
        className
      )}
      style={{
        // Force some basic styling to ensure content is visible
        color: ui.customization?.cardBackground ? "white" : "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
      }}
    >
      {renderedContent}
    </div>
  );
}
