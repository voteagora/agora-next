"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { generatePatternSvg } from "@/lib/utils/generatePatternSvg";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";

interface FinancialStatementLayoutProps {
  topicId: number;
  title: string;
  content: string;
  pdfUrl?: string | null;
  isOnArticlePage?: boolean;
}

export default function FinancialStatementLayout({
  topicId,
  title,
  content,
  pdfUrl,
  isOnArticlePage = false,
}: FinancialStatementLayoutProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const resizeIframe = () => {
      try {
        const iframeDocument =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDocument) {
          const height = iframeDocument.documentElement.scrollHeight;
          iframe.style.height = `${height}px`;
        }
      } catch (error) {
        console.error("Error resizing iframe:", error);
      }
    };

    iframe.addEventListener("load", resizeIframe);

    const resizeObserver = new ResizeObserver(resizeIframe);
    if (iframe.contentDocument?.documentElement) {
      resizeObserver.observe(iframe.contentDocument.documentElement);
    }

    return () => {
      iframe.removeEventListener("load", resizeIframe);
      resizeObserver.disconnect();
    };
  }, [content]);

  const handleScrollToComments = () => {
    const commentsSection = document.getElementById("forum-thread-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const tenant = Tenant.current();
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
        className={`${isOnArticlePage ? "max-w-5xl" : "max-w-6xl"} mx-auto relative`}
      >
        <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>

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

        <div className="bg-cardBackground rounded-lg p-0 shadow-sm relative z-10">
          <iframe
            ref={iframeRef}
            srcDoc={content}
            className="w-full border-0 min-h-[1000px]"
            title="Financial Statement"
            sandbox="allow-same-origin allow-scripts"
          />
        </div>
      </div>
    </>
  );
}
