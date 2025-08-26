"use client";

import React from "react";
import { cn } from "@/lib/utils";

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
}

export default function DunaContentRenderer({
  content,
  className,
}: DunaContentRendererProps) {
  if (!content) return null;

  // Decode HTML entities if they exist
  const decodedContent = decodeHtmlEntities(content);

  return (
    <div
      className={cn(
        "text-sm prose prose-sm max-w-none",
        "prose-a:text-primary prose-a:underline hover:prose-a:no-underline",
        "prose-a:font-medium",
        className
      )}
      dangerouslySetInnerHTML={{ __html: decodedContent }}
      style={{
        // Force some basic styling to ensure content is visible
        color: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
      }}
    />
  );
}
