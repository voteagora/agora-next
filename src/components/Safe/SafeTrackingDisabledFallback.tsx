"use client";

import { ExternalLink, ShieldCheck } from "lucide-react";

import { UpdatedButton } from "@/components/Button";

export function SafeTrackingDisabledFallback({
  heading,
  description,
  safeQueueUrl,
  closeDialog,
  children,
}: {
  heading: string;
  description: string;
  safeQueueUrl: string | null;
  closeDialog: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex w-full max-w-[42rem] flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 ring-1 ring-primary/10">
          <ShieldCheck className="h-8 w-8 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold tracking-tight text-primary">
            {heading}
          </h2>
          <p className="text-secondary max-w-[30rem]">{description}</p>
        </div>
      </div>

      {children}

      <div className="flex flex-col gap-3 sm:flex-row">
        {safeQueueUrl ? (
          <UpdatedButton
            fullWidth
            type="primary"
            href={safeQueueUrl}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 flex-1 items-center justify-center rounded-lg text-center"
          >
            <span className="flex w-full items-center justify-center gap-2 whitespace-nowrap text-center">
              Open Safe <ExternalLink className="h-4 w-4" />
            </span>
          </UpdatedButton>
        ) : null}

        <UpdatedButton
          fullWidth
          type={safeQueueUrl ? "secondary" : "primary"}
          className="flex h-12 flex-1 items-center justify-center rounded-lg text-center"
          onClick={closeDialog}
        >
          Close
        </UpdatedButton>
      </div>
    </div>
  );
}
