"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { DunaContentRenderer } from "@/components/duna-editor";

interface FinancialStatementLayoutProps {
  title: string;
  content: string;
  pdfUrl?: string | null;
}

export default function FinancialStatementLayout({
  title,
  content,
  pdfUrl,
}: FinancialStatementLayoutProps) {
  const handleScrollToComments = () => {
    const commentsSection = document.getElementById("forum-thread-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-primary mb-6">{title}</h1>

      <div className="flex flex-wrap gap-4 mb-8">
        <Button
          onClick={handleScrollToComments}
          variant="default"
          className="bg-primary text-white hover:bg-primary/90"
        >
          Discuss on forums
        </Button>
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

      <div className="bg-white rounded-lg p-8 shadow-sm">
        <DunaContentRenderer
          content={content}
          className="text-secondary text-sm leading-relaxed break-words"
        />
      </div>
    </div>
  );
}
