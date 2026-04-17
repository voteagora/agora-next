"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { generatePatternSvg } from "@/lib/utils/generatePatternSvg";
import {
  PROSE_LINKS,
  PROSE_MEDIA,
  PROSE_PRIMARY_BODY,
} from "@/components/duna-editor/proseThemeClasses";
import Markdown from "@/components/shared/Markdown/Markdown";
import { TENANT_NAMESPACES } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import MarkdownToc from "./MarkdownToc";

interface FinancialStatementLayoutProps {
  topicId: number;
  title: string;
  content: string;
  pdfUrl?: string | null;
  isOnArticlePage?: boolean;
  hideInlineToc?: boolean;
}

function looksLikeHtml(text: string): boolean {
  const t = text.trim();
  return t.startsWith("<") || t.includes("</");
}

/**
 * Detects if HTML content was generated from a PDF conversion.
 * PDF converters produce HTML with distinctive patterns:
 * - CIDFont font-face declarations (e.g., CIDFont-F1_8, CIDFont-F2_g)
 * - Text container divs with id="text-container"
 * - Specific class patterns like .t, .s0, .s1 for text positioning
 * - transform-origin inline styles for precise text placement
 */
function isPdfGeneratedHtml(content: string): boolean {
  // Check for CIDFont font-face declarations (most reliable indicator)
  const hasCidFont = /CIDFont-F\d+/i.test(content);

  // Check for text-container div (common in pdf2htmlEX output)
  const hasTextContainer = /id\s*=\s*["']text-container["']/i.test(content);

  // Check for PDF-specific class patterns (.t class with .s0, .s1, etc.)
  const hasPdfTextClasses =
    /class\s*=\s*["']t\s+s\d+["']/i.test(content) ||
    /\.t\s*\{[^}]*position\s*:/i.test(content);

  // Check for transform-origin positioning (used for precise PDF text placement)
  const hasTransformOrigin = /transform-origin\s*:\s*\d+px\s+\d+px/i.test(
    content
  );

  // Content is PDF-generated if it has CIDFont OR multiple other PDF indicators
  return (
    hasCidFont ||
    (hasTextContainer && (hasPdfTextClasses || hasTransformOrigin))
  );
}

export default function FinancialStatementLayout({
  topicId,
  title,
  content,
  pdfUrl,
  isOnArticlePage = false,
  hideInlineToc = false,
}: FinancialStatementLayoutProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const tenant = Tenant.current();

  const primaryRgb = tenant.ui?.customization?.primary ?? "23 23 23";
  const secondaryRgb = tenant.ui?.customization?.secondary ?? "64 64 64";

  const rgbCss = (triplet: string) =>
    `rgb(${triplet.trim().split(/\s+/).join(", ")})`;

  // Detect if content is PDF-generated HTML (has its own styling) vs regular HTML
  const isPdfContent = isPdfGeneratedHtml(content);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const bodyColor = rgbCss(primaryRgb);
    const linkColor = rgbCss(secondaryRgb);

    const resizeIframe = () => {
      try {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDocument) return;

        const body = iframeDocument.body;
        const html = iframeDocument.documentElement;
        if (!body || !html) return;

        // Inject responsive CSS if not already present
        let existingStyle = iframeDocument.getElementById(
          "responsive-pdf-style"
        );
        if (!existingStyle) {
          const style = iframeDocument.createElement("style");
          style.id = "responsive-pdf-style";
          // For PDF-generated content: only layout styles (PDF has its own text colors)
          // For regular HTML content: also apply tenant text colors for visibility on dark themes
          style.textContent = isPdfContent
            ? `
            * {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              overflow-y: visible;
            }
            img, svg, canvas {
              max-width: 100%;
              height: auto;
            }
            table {
              max-width: 100%;
              table-layout: auto;
            }
          `
            : `
            * {
              box-sizing: border-box;
            }
            html, body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
              overflow-y: visible;
              color: ${bodyColor};
            }
            p, li, td, th, label,
            h1, h2, h3, h4, h5, h6,
            div, span {
              color: ${bodyColor};
            }
            a {
              color: ${linkColor};
            }
            img, svg, canvas {
              max-width: 100%;
              height: auto;
            }
            table {
              max-width: 100%;
              table-layout: auto;
            }
          `;
          iframeDocument.head.appendChild(style);
        }

        // Get the actual content width - use the maximum of all measurements
        const contentWidth = Math.max(
          body.scrollWidth,
          html.scrollWidth,
          body.offsetWidth,
          html.offsetWidth
        );

        // Measure the actual iframe container width
        const iframeContainer = iframe.parentElement;
        const containerWidth = iframeContainer
          ? iframeContainer.getBoundingClientRect().width
          : window.innerWidth;

        // Calculate available width (account for any potential rounding issues)
        const availableWidth = Math.max(containerWidth - 2, 320);

        // Calculate scale for mobile (only scale if content is wider than container)
        const needsScaling = contentWidth > availableWidth;
        const scale = needsScaling ? availableWidth / contentWidth : 1;

        // Apply scaling to body
        if (scale < 1) {
          body.style.transform = `scale(${scale})`;
          body.style.transformOrigin = "top left";
          body.style.width = `${contentWidth}px`;
          body.style.margin = "0";
          body.style.padding = "0";
        } else {
          body.style.transform = "none";
          body.style.width = "auto";
          body.style.margin = "0";
          body.style.padding = "0";
        }

        // Get the original content height before applying any height constraints
        const originalHeight = Math.max(body.scrollHeight, html.scrollHeight);

        // Calculate scaled height
        const scaledHeight = originalHeight * scale;

        // Ensure html doesn't overflow and has exact height (prevents extra white space)
        html.style.overflowX = "hidden";
        html.style.overflowY = "hidden";
        html.style.width = "100%";
        html.style.maxWidth = "100%";
        html.style.margin = "0";
        html.style.padding = "0";
        html.style.height = `${scaledHeight}px`;
        html.style.minHeight = `${scaledHeight}px`;
        html.style.maxHeight = `${scaledHeight}px`;

        // Constrain body height to prevent extra space
        body.style.height = `${originalHeight}px`;
        body.style.minHeight = `${originalHeight}px`;
        body.style.maxHeight = `${originalHeight}px`;

        // Set iframe height to exactly match scaled content (no extra space)
        iframe.style.height = `${Math.ceil(scaledHeight)}px`;
        iframe.style.width = "100%";
        iframe.style.maxWidth = "100%";
        iframe.style.overflow = "hidden";
        iframe.style.display = "block";
      } catch (error) {
        console.error("Error resizing iframe:", error);
      }
    };

    const handleLoad = () => {
      // Small delay to ensure content is fully rendered
      setTimeout(resizeIframe, 150);
    };

    iframe.addEventListener("load", handleLoad);

    // Also listen for resize events
    const handleResize = () => {
      // Debounce resize to avoid excessive calculations
      clearTimeout((handleResize as any).timeout);
      (handleResize as any).timeout = setTimeout(resizeIframe, 100);
    };
    window.addEventListener("resize", handleResize);

    // Try to resize immediately if content is already loaded
    if (iframe.contentDocument?.readyState === "complete") {
      handleLoad();
    }

    return () => {
      iframe.removeEventListener("load", handleLoad);
      window.removeEventListener("resize", handleResize);
      clearTimeout((handleResize as any).timeout);
    };
  }, [content, isPdfContent, primaryRgb, secondaryRgb]);

  const handleScrollToComments = () => {
    const commentsSection = document.getElementById("forum-thread-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const { namespace } = tenant;
  const mode = tenant.ui.theme;
  const hideDiscussButton =
    namespace === TENANT_NAMESPACES.UNISWAP && isOnArticlePage;

  const forumPagePath = buildForumTopicPath(topicId, title);
  const discussButtonText = isOnArticlePage ? "Discuss on forums" : "Discuss";

  const metadataString = `${topicId}-${title}`;
  const { svg: patternSvg } = generatePatternSvg(
    metadataString,
    600,
    300,
    "transparent",
    "#000000",
    9,
    mode
  );

  return (
    <>
      {isOnArticlePage && (
        <div className="hidden md:block absolute top-[20%] right-0 opacity-30 pointer-events-none">
          <div
            className="w-[600px] h-[300px]"
            dangerouslySetInnerHTML={{ __html: patternSvg }}
          />
        </div>
      )}
      <div
        className={`${isOnArticlePage ? "max-w-5xl" : "max-w-6xl"} mx-auto relative w-full min-w-0`}
      >
        <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-6">
          {title}
        </h1>

        <div className="flex flex-wrap gap-4 mb-8">
          {!hideDiscussButton &&
            (isOnArticlePage ? (
              <Button asChild variant="outline" className="text-primary">
                <Link href={forumPagePath}>{discussButtonText}</Link>
              </Button>
            ) : (
              <Button
                onClick={handleScrollToComments}
                variant="outline"
                className="text-primary"
              >
                {discussButtonText}
              </Button>
            ))}
          {pdfUrl && (
            <Button asChild variant="outline" className="text-primary">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                View PDF
              </a>
            </Button>
          )}
        </div>

        <div className="bg-cardBackground rounded-lg p-0 shadow-sm relative z-10 overflow-hidden">
          {looksLikeHtml(content) ? (
            <iframe
              ref={iframeRef}
              srcDoc={content}
              className="w-full border-0"
              title="Financial Statement"
              sandbox="allow-same-origin allow-scripts"
              style={{ display: "block" }}
            />
          ) : (
            <>
              {!hideInlineToc && <MarkdownToc content={content} />}
              <div
                className={cn(
                  "p-4 prose prose-sm max-w-none text-primary",
                  PROSE_PRIMARY_BODY,
                  PROSE_LINKS,
                  PROSE_MEDIA
                )}
              >
                <Markdown content={content} originalHierarchy />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
