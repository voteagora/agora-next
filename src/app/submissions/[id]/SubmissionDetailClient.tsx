"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Markdown from "@/components/shared/Markdown/Markdown";
import { SubmissionWithComments } from "@/app/api/common/contest/getSubmissions";
import { formatDistanceToNow, format } from "date-fns";

interface SubmissionDetailClientProps {
  submission: SubmissionWithComments;
}

function normalizeSubmissionTitle(title: string): string {
  return title.replace(/^title:\s*/i, "").trim();
}

export default function SubmissionDetailClient({
  submission,
}: SubmissionDetailClientProps) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Link
        href="/submissions"
        className="text-sm text-secondary hover:text-primary mb-6 inline-flex items-center gap-1"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Submissions
      </Link>

      <div className="mb-6 mt-4">
        <h1 className="text-2xl font-extrabold text-primary mb-2">
          {normalizeSubmissionTitle(submission.title)}
        </h1>
        <div className="flex items-center gap-3 text-sm text-secondary">
          <span>
            {submission.isAnonymous
              ? "Anonymous"
              : submission.authorDisplayName ||
                `${submission.authorWallet?.substring(0, 6)}...${submission.authorWallet?.substring(38)}`}
          </span>
          <span>•</span>
          <span>{format(new Date(submission.submittedAt), "MMM d, yyyy")}</span>
          {submission.authorGithub && !submission.isAnonymous && (
            <>
              <span>•</span>
              <a
                href={`https://github.com/${submission.authorGithub}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brandPrimary hover:underline"
              >
                @{submission.authorGithub}
              </a>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          <Card className="border-line">
            <CardContent className="pt-6">
              <Markdown content={submission.contentMarkdown} />
            </CardContent>
          </Card>

          {submission.attachments.length > 0 && (
            <Card className="border-line">
              <CardHeader>
                <CardTitle className="text-lg">Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {submission.attachments.map((att, index) => (
                    <a
                      key={index}
                      href={att.gateway_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-md border border-line hover:bg-wash transition-colors"
                    >
                      {att.type === "image" ? (
                        <svg
                          className="w-5 h-5 text-secondary"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5 text-secondary"
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
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">
                          {att.label || att.filename}
                        </p>
                        <p className="text-xs text-tertiary">
                          {att.mime_type} • {(att.size_bytes / 1024).toFixed(1)}{" "}
                          KB
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-tertiary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {submission.comments.length > 0 && (
            <Card className="border-line">
              <CardHeader>
                <CardTitle className="text-lg">
                  Comments ({submission.comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submission.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="p-4 rounded-md border border-line"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-primary">
                          {comment.authorDisplayName ||
                            `${comment.authorWallet.substring(0, 6)}...${comment.authorWallet.substring(38)}`}
                        </span>
                        <span className="text-xs text-tertiary">
                          {formatDistanceToNow(new Date(comment.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-secondary whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="border-line">
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-tertiary mb-1">Submitted</p>
                <p className="text-sm text-secondary">
                  {format(new Date(submission.submittedAt), "PPpp")}
                </p>
              </div>
            </CardContent>
          </Card>

          {submission.githubPrUrl && (
            <Card className="border-line">
              <CardHeader>
                <CardTitle className="text-lg">GitHub</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={submission.githubPrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-brandPrimary hover:underline"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  View Pull Request #{submission.githubPrNumber}
                </a>
                <p className="text-xs text-tertiary mt-2">
                  Leave comments and feedback on the GitHub PR
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
