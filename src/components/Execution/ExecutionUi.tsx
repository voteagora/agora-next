"use client";

import { useCallback, useState } from "react";
import {
  ClipboardDocumentCheckIcon,
  ClipboardIcon,
} from "@heroicons/react/20/solid";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ExecutionAddressTooltip({
  address,
  children,
}: {
  address: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side="top"
        className="max-w-[min(92vw,22rem)] border-line bg-cardBackground font-mono text-xs leading-snug text-primary shadow-md"
      >
        {address}
      </TooltipContent>
    </Tooltip>
  );
}

export function ExecutionCopyButton({
  text,
  className,
  title = "Copy",
  "aria-label": ariaLabel = "Copy full value",
}: {
  text: string;
  className?: string;
  title?: string;
  "aria-label"?: string;
}) {
  const [done, setDone] = useState(false);
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!navigator.clipboard) {
        return;
      }
      void navigator.clipboard.writeText(text).then(() => {
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      });
    },
    [text]
  );

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-md p-0.5 text-tertiary transition-colors hover:bg-line/50 hover:text-primary",
        className
      )}
      title={title}
      aria-label={ariaLabel}
    >
      {done ? (
        <ClipboardDocumentCheckIcon className="h-3.5 w-3.5 text-positive" />
      ) : (
        <ClipboardIcon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export function ExecutionCopyableValue({
  display,
  fullText,
  className,
  mono = true,
}: {
  display: string;
  fullText: string;
  className?: string;
  mono?: boolean;
}) {
  if (fullText === display) {
    return (
      <div
        className={cn(
          "min-w-0 break-all text-primary",
          mono ? "font-mono text-xs" : "text-sm",
          className
        )}
      >
        {display}
      </div>
    );
  }
  return (
    <div
      className={cn("flex min-w-0 items-start gap-0.5 text-primary", className)}
    >
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "min-w-0 cursor-default break-all",
              mono ? "font-mono text-xs" : "text-sm"
            )}
          >
            {display}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-h-[min(50vh,20rem)] max-w-[min(92vw,28rem)] overflow-y-auto break-all border-line bg-cardBackground font-mono text-xs text-primary"
        >
          {fullText}
        </TooltipContent>
      </Tooltip>
      <ExecutionCopyButton
        className="mt-0.5"
        text={fullText}
        title="Copy full value"
        aria-label="Copy full value"
      />
    </div>
  );
}

export function ExecutionInlineSpinner({
  className,
  message,
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[100px] flex-col items-center justify-center gap-2 py-6",
        className
      )}
    >
      <Loader2 className="h-7 w-7 animate-spin text-tertiary" aria-hidden />
      {message && (
        <p className="text-center text-xs text-secondary" role="status">
          {message}
        </p>
      )}
    </div>
  );
}

export function ExecutionEmptyState({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-line bg-cardBackground/40 px-4 py-8 text-center",
        className
      )}
    >
      <p className="text-sm font-medium text-primary">{title}</p>
      <p className="mt-1 text-sm text-secondary">{children}</p>
    </div>
  );
}

export function ExecutionPageIntro({
  eyebrow,
  title,
  className,
}: {
  eyebrow: string;
  title: string;
  className?: string;
}) {
  return (
    <header className={cn("mb-8 space-y-2", className)}>
      <p className="text-xs font-semibold uppercase tracking-wider text-tertiary">
        {eyebrow}
      </p>
      <h2 className="text-xl font-bold tracking-tight text-primary sm:text-2xl">
        {title}
      </h2>
    </header>
  );
}

export function ExecutionHashCopy({
  hash,
  className,
  label = "Transaction hash",
  showLabel = true,
}: {
  hash: string;
  className?: string;
  label?: string;
  showLabel?: boolean;
}) {
  const [done, setDone] = useState(false);
  const onCopy = useCallback(() => {
    if (!navigator.clipboard) {
      return;
    }
    void navigator.clipboard.writeText(hash).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 1600);
    });
  }, [hash]);

  return (
    <div
      className={cn(
        "rounded-lg border border-line/80 bg-wash/60 px-3 py-2 text-xs",
        className
      )}
    >
      {showLabel && <span className="text-tertiary">{label}</span>}
      <div
        className={cn("group flex items-start gap-2", showLabel && "mt-0.5")}
      >
        <code className="min-w-0 flex-1 break-all text-left font-mono text-[11px] leading-relaxed text-primary">
          {hash}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 rounded-md p-1 text-tertiary transition-colors hover:bg-line/50 hover:text-primary"
          title="Copy hash"
          aria-label={showLabel ? `Copy ${label.toLowerCase()}` : "Copy hash"}
        >
          {done ? (
            <ClipboardDocumentCheckIcon className="h-4 w-4 text-positive" />
          ) : (
            <ClipboardIcon className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

export function ExecutionSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden border-line shadow-sm", className)}>
      <CardHeader className="border-b border-line/60 bg-wash/50 pb-3">
        <CardTitle className="text-base font-semibold text-primary">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm leading-relaxed text-secondary">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  );
}

export function ExecutionFieldGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-2", className)}>
      {children}
    </div>
  );
}

export function ExecutionFieldTile({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-line/80 bg-wash/80 p-3 shadow-sm",
        className
      )}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
        {label}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
