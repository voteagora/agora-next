"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/Drawer";
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
import { hasMarkdownHeadings } from "./markdownHeadings";

interface FinancialStatementLayoutProps {
  topicId: number;
  title: string;
  content: string;
  pdfUrl?: string | null;
  isOnArticlePage?: boolean;
  children?: React.ReactNode;
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
  children,
}: FinancialStatementLayoutProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isTocDrawerOpen, setIsTocDrawerOpen] = useState(false);
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
              overflow-x: hidden;
              overflow-y: visible;
            }
            html {
              padding: 0;
            }
            body {
              padding: 0;
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
              overflow-x: hidden;
              overflow-y: visible;
              color: ${bodyColor};
            }
            html {
              padding: 0;
            }
            body {
              padding: 0;
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

        const iframeWidth = iframe.getBoundingClientRect().width;
        // Equal inset on all sides inside the iframe (margin around the white page).
        const inset = Math.min(
          48,
          Math.max(16, Math.round(iframeWidth * 0.045))
        );
        html.style.boxSizing = "border-box";
        html.style.padding = `${inset}px`;
        html.style.margin = "0";

        // Get the actual content width - use the maximum of all measurements
        const contentWidth = Math.max(
          body.scrollWidth,
          html.scrollWidth,
          body.offsetWidth,
          html.offsetWidth
        );

        const availableWidth = Math.max(iframeWidth - 2 * inset - 2, 280);

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

        // Body-only: html.scrollHeight includes our html padding and would double-count inset
        const originalHeight = Math.max(body.scrollHeight, body.offsetHeight);

        // Calculate scaled height
        const scaledHeight = originalHeight * scale;
        const paddedScaledHeight = scaledHeight + 2 * inset;

        // Ensure html doesn't overflow and has exact height (prevents extra white space)
        html.style.overflowX = "hidden";
        html.style.overflowY = "hidden";
        html.style.width = "100%";
        html.style.maxWidth = "100%";
        html.style.height = `${paddedScaledHeight}px`;
        html.style.minHeight = `${paddedScaledHeight}px`;
        html.style.maxHeight = `${paddedScaledHeight}px`;

        // Constrain body height to prevent extra space
        body.style.height = `${originalHeight}px`;
        body.style.minHeight = `${originalHeight}px`;
        body.style.maxHeight = `${originalHeight}px`;

        // Match iframe to scaled content plus html inset on top and bottom
        iframe.style.height = `${Math.ceil(paddedScaledHeight)}px`;
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
  const showMarkdownToc = useMemo(
    () => !looksLikeHtml(content) && hasMarkdownHeadings(content),
    [content]
  );
  const markdownTocClassName = "px-5 pt-4 pb-2 lg:px-6 lg:pt-5 lg:pb-3";
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
        className={`${isOnArticlePage ? "" : "max-w-6xl"} mx-auto relative w-full min-w-0`}
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

        {looksLikeHtml(content) ? (
          <>
            <div className="bg-cardBackground rounded-lg p-0 shadow-sm relative z-10 overflow-hidden">
              <iframe
                ref={iframeRef}
                srcDoc={content}
                className="w-full border-0"
                title="Financial Statement"
                sandbox="allow-same-origin allow-scripts"
                style={{ display: "block" }}
              />
            </div>
            {children}
          </>
        ) : showMarkdownToc ? (
          <>
            <button
              type="button"
              className="lg:hidden fixed left-0 top-1/2 z-30 -translate-y-1/2 inline-flex items-center justify-center rounded-r-lg border border-l-0 border-line bg-cardBackground py-3 pl-1 pr-1.5 text-tertiary shadow-newDefault transition-shadow hover:text-primary hover:shadow-newHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-line"
              aria-haspopup="dialog"
              aria-label="Open table of contents"
              onClick={() => setIsTocDrawerOpen(true)}
            >
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
            </button>
            <Drawer
              isOpen={isTocDrawerOpen}
              onClose={() => setIsTocDrawerOpen(false)}
              position="left"
              className={cn(
                "bg-cardBackground shadow-sm",
                "inset-y-0 left-0 w-64 max-w-none rounded-r-lg border-r border-line"
              )}
            >
              <div
                onClick={(e) => {
                  const el = (e.target as HTMLElement).closest(
                    "a[href^='#']"
                  ) as HTMLAnchorElement | null;
                  if (!el) return;
                  e.preventDefault();
                  const slug = el.getAttribute("href")?.slice(1) ?? "";
                  if (!slug) return;
                  const target = document.getElementById(slug);
                  // Clear the Drawer's pushed history entry before closing so
                  // its cleanup doesn't call history.back() and undo navigation.
                  try {
                    window.history.replaceState(null, "", `#${slug}`);
                  } catch (_) {}
                  // Release the Drawer's body scroll lock so scrollIntoView runs.
                  document.body.style.overflow = "";
                  if (target) {
                    target.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                  setIsTocDrawerOpen(false);
                }}
              >
                <MarkdownToc
                  content={content}
                  className={markdownTocClassName}
                />
              </div>
            </Drawer>
            <div className="flex items-start gap-6">
              <aside className="hidden lg:block h-fit w-64 flex-shrink-0 self-start sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-lg bg-cardBackground shadow-sm">
                <MarkdownToc
                  content={content}
                  className={markdownTocClassName}
                />
              </aside>
              <div className="min-w-0 flex-1 flex flex-col">
                <div className="bg-cardBackground rounded-lg shadow-sm overflow-hidden relative z-10">
                  <div
                    className={cn(
                      "p-6 sm:p-8 prose prose-sm max-w-none text-primary",
                      PROSE_PRIMARY_BODY,
                      PROSE_LINKS,
                      PROSE_MEDIA
                    )}
                  >
                    <Markdown content={content} originalHierarchy />
                  </div>
                </div>
              </div>
            </div>
            {children != null ? (
              <div className="mt-8 flex items-start gap-6">
                <div
                  className="hidden lg:block w-64 flex-shrink-0"
                  aria-hidden
                />
                <div className="min-w-0 flex-1 w-full">{children}</div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col items-start">
            <div className="min-w-0 flex flex-col gap-8 w-full">
              <div className="bg-cardBackground rounded-lg shadow-sm overflow-hidden relative z-10">
                <div
                  className={cn(
                    "p-6 sm:p-8 prose prose-sm max-w-none text-primary",
                    PROSE_PRIMARY_BODY,
                    PROSE_LINKS,
                    PROSE_MEDIA
                  )}
                >
                  <Markdown content={content} originalHierarchy />
                </div>
              </div>
              {children}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
