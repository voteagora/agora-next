"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicSubmission } from "@/app/api/common/contest/getSubmissions";

interface SubmissionsListClientProps {
  initialSubmissions: PublicSubmission[];
}

function normalizeSubmissionTitle(title: string): string {
  return title.replace(/^title:\s*/i, "").trim();
}

function buildSubmissionPreview(contentMarkdown: string): string {
  const withoutTitleLine = contentMarkdown
    .replace(/^\s*#*\s*title:\s.*$/im, "")
    .trim();

  const plainText = withoutTitleLine
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= 200) return plainText;
  return `${plainText.slice(0, 200)}...`;
}

export default function SubmissionsListClient({
  initialSubmissions,
}: SubmissionsListClientProps) {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Submissions</h1>
          <p className="text-secondary mt-1">
            Browse governance design proposals for the Novo Origo Prize
          </p>
        </div>
        <Link href="/submissions/new">
          <Button>Submit Your Design</Button>
        </Link>
      </div>

      {initialSubmissions.length === 0 ? (
        <Card className="border-line">
          <CardContent className="py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-wash flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-tertiary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-primary mb-2">
              No submissions yet
            </h3>
            <p className="text-secondary text-sm mb-6 max-w-md mx-auto">
              Be the first to submit your governance design for the Novo Origo
              Prize.
            </p>
            <Link href="/submissions/new">
              <Button>Create First Submission</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {initialSubmissions.map((submission) => (
            <Link key={submission.id} href={`/submissions/${submission.id}`}>
              <Card className="border-line hover:shadow-newHover transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">
                    {normalizeSubmissionTitle(submission.title)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-secondary line-clamp-3 mb-4">
                    {buildSubmissionPreview(submission.contentMarkdown)}
                  </p>
                  <div className="text-xs text-tertiary">
                    <span>
                      {submission.isAnonymous
                        ? "Anonymous"
                        : submission.authorDisplayName ||
                          `${submission.authorWallet?.substring(0, 6)}...${submission.authorWallet?.substring(38)}`}
                    </span>
                  </div>
                  {submission.votingPower > 0 && (
                    <div className="mt-3 pt-3 border-t border-line">
                      <span className="text-xs text-tertiary">
                        Voting Power:{" "}
                        <span className="font-medium text-secondary">
                          {submission.votingPower}
                        </span>
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
