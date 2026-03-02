"use client";

import React from "react";
import { ArrowCircle } from "@/icons/ArrowCircle";
import { DownloadCloud } from "@/icons/DownloadCloud";

interface FinancialStatement {
  id: number;
  name: string;
  url: string;
  ipfsCid: string;
  createdAt: string;
  uploadedBy: string;
  archived?: boolean;
  revealTime?: string | null;
  expirationTime?: string | null;
  topicId?: number;
  topicTitle?: string;
}

interface FinancialStatementsSectionProps {
  statements: FinancialStatement[];
  onStatementClick: (statement: FinancialStatement) => void;
  title: string;
}

function formatStatementDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function FinancialStatementsSection({
  statements,
  onStatementClick,
  title,
}: FinancialStatementsSectionProps) {
  if (statements.length === 0) return null;

  const sortedStatements = [...statements].sort((a, b) => {
    const dateA = new Date(a.revealTime ?? a.createdAt);
    const dateB = new Date(b.revealTime ?? b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div>
      {title && (
        <h4 className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-4">
          {title}
        </h4>
      )}
      <div className="flex flex-col divide-y divide-line">
        {sortedStatements.map((statement) => {
          const displayDate = formatStatementDate(
            statement.revealTime ?? statement.createdAt
          );
          const displayName = statement.name.replace(/\.[^/.]+$/, "");

          return (
            <div
              key={statement.id}
              className="flex items-center justify-between py-6 gap-4 group"
            >
              <div className="flex flex-col gap-1 min-w-0">
                <p className="text-base font-medium text-primary truncate">
                  {displayName}
                </p>
                <p className="text-xs text-tertiary">Published {displayDate}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onStatementClick(statement)}
                  className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                  title="Open"
                  aria-label="Open statement"
                >
                  <ArrowCircle className="w-5 h-5" />
                </button>
                {statement.url && (
                  <a
                    href={statement.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-full hover:bg-wash transition-colors text-tertiary hover:text-primary"
                    title="Download"
                    aria-label="Download statement"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DownloadCloud className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
