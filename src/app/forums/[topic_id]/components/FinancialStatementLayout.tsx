"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DunaContentRenderer } from "@/components/duna-editor";
import { buildForumTopicPath } from "@/lib/forumUtils";
import { generatePatternSvg } from "@/lib/utils/generatePatternSvg";

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
  const handleScrollToComments = () => {
    const commentsSection = document.getElementById("forum-thread-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const forumPagePath = buildForumTopicPath(topicId, title);
  const discussButtonText = isOnArticlePage ? "Discuss on forums" : "Discuss";

  const metadataString = `${topicId}-${title}`;
  const { svg: patternSvg } = generatePatternSvg(
    metadataString,
    600,
    300,
    "transparent",
    "#000000",
    9
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
      <div className="max-w-4xl mx-auto relative">
        <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>

        <div className="flex flex-wrap gap-4 mb-8">
          {isOnArticlePage ? (
            <Button
              asChild
              variant="default"
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Link href={forumPagePath}>{discussButtonText}</Link>
            </Button>
          ) : (
            <Button
              onClick={handleScrollToComments}
              variant="default"
              className="bg-primary text-white hover:bg-primary/90"
            >
              {discussButtonText}
            </Button>
          )}
          {pdfUrl && (
            <Button
              asChild
              variant="outline"
              className="border-line bg-white hover:bg-wash"
            >
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                View PDF
              </a>
            </Button>
          )}
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm relative z-10">
          <DunaContentRenderer
            content={content}
            className="text-secondary text-sm leading-relaxed break-words"
          />
        </div>
      </div>
    </>
  );
}
