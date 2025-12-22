"use client";

import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import InternalLinkEmbed from "@/components/ForumShared/Embeds/InternalLinkEmbed";

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
  try {
    const url = new URL(
      href,
      typeof window !== "undefined" ? window.location.origin : ""
    );
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
  if (typeof window === "undefined") {
    return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  const elements: React.ReactNode[] = [];

  Array.from(doc.body.childNodes).forEach((node, index) => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      if (element.tagName === "P") {
        const processNode = (
          node: Node,
          partIndex: number
        ): React.ReactNode[] => {
          const result: React.ReactNode[] = [];

          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as Element;
            if (el.tagName === "A") {
              const href = el.getAttribute("href") || "";
              const linkText = el.textContent?.trim() || "";

              if (isInternalEmbeddableLink(href)) {
                result.push(
                  <InternalLinkEmbed
                    key={`embed-${index}-${partIndex}`}
                    href={href}
                    originalLink={
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline font-medium"
                      >
                        {linkText}
                      </a>
                    }
                  />
                );
              } else {
                result.push(
                  <a
                    key={`link-${index}-${partIndex}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline hover:no-underline font-medium"
                  >
                    {linkText}
                  </a>
                );
              }
            } else if (el.tagName === "BR") {
              result.push(<br key={`br-${index}-${partIndex}`} />);
            } else {
              const children: React.ReactNode[] = [];
              let childIndex = 0;
              Array.from(el.childNodes).forEach((child) => {
                const processed = processNode(child, partIndex + childIndex);
                children.push(...processed);
                childIndex += processed.length;
              });

              const Tag =
                el.tagName.toLowerCase() as keyof JSX.IntrinsicElements;
              result.push(
                <Tag
                  key={`el-${index}-${partIndex}`}
                  {...Object.fromEntries(
                    Array.from(el.attributes).map((attr) => [
                      attr.name,
                      attr.value,
                    ])
                  )}
                >
                  {children}
                </Tag>
              );
            }
          } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            if (text) {
              result.push(
                <React.Fragment key={`text-${index}-${partIndex}`}>
                  {text}
                </React.Fragment>
              );
            }
          }

          return result;
        };

        const parts: React.ReactNode[] = [];
        let partIndex = 0;
        Array.from(element.childNodes).forEach((child) => {
          const processed = processNode(child, partIndex);
          parts.push(...processed);
          partIndex += processed.length;
        });

        if (parts.length > 0) {
          elements.push(
            <p key={`p-${index}`} className="my-2">
              {parts}
            </p>
          );
          return;
        }
      }

      elements.push(
        <div
          key={`html-${index}`}
          dangerouslySetInnerHTML={{ __html: element.outerHTML }}
        />
      );
    } else if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      if (text && text.trim()) {
        elements.push(
          <React.Fragment key={`text-${index}`}>{text}</React.Fragment>
        );
      }
    }
  });

  return <>{elements}</>;
}

export default function DunaContentRenderer({
  content,
  className,
  enableEmbeds = true,
}: DunaContentRendererProps) {
  if (!content) return null;

  const { ui } = Tenant.current();

  // Decode HTML entities if they exist
  const decodedContent = decodeHtmlEntities(content);

  const renderedContent = useMemo(() => {
    if (!enableEmbeds) {
      return <div dangerouslySetInnerHTML={{ __html: decodedContent }} />;
    }
    return parseContentWithEmbeds(decodedContent);
  }, [decodedContent, enableEmbeds]);

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
