"use client";

import Link from "next/link";
import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/20/solid";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn, getBlockScanUrl, shortAddress } from "@/lib/utils";
import { ExecutionAddressTooltip, ExecutionHashCopy } from "./ExecutionUi";
import {
  type ExecutionViewId,
  getExecutionView,
  executionTxViewPath,
  listExecutionViewIds,
} from "@/lib/execution/executionViewsConfig";

export function ExecutionInspectorCard({
  txHash,
  className,
  variant = "full",
}: {
  txHash: string;
  className?: string;
  variant?: "full" | "compact";
}) {
  const viewIds = listExecutionViewIds();

  if (variant === "compact") {
    const href = executionTxViewPath(txHash, "events");
    return (
      <aside
        className={cn(
          "rounded-2xl border border-line bg-wash/90 p-4 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4 sm:p-4",
          className
        )}
      >
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-primary sm:text-base">
            Execution logs
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-secondary sm:text-sm">
            Receipt, event logs, and trace — straight from the RPC.
          </p>
        </div>
        <Link
          href={href}
          className="mt-3 inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:mt-0 sm:w-auto"
        >
          Open
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </aside>
    );
  }

  return (
    <TooltipProvider delayDuration={250}>
      <div
        className={cn(
          "rounded-2xl border border-line bg-gradient-to-br from-cardBackground via-wash/90 to-cardBackground p-1 shadow-sm",
          className
        )}
      >
        <div className="rounded-[0.9rem] border border-line/50 bg-wash/40 p-4 sm:p-5">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/20 text-primary"
                  >
                    Execution inspector
                  </Badge>
                  <ExecutionAddressTooltip address={txHash}>
                    <span className="cursor-default font-mono text-xs text-tertiary">
                      {shortAddress(txHash)}
                    </span>
                  </ExecutionAddressTooltip>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-semibold text-primary">
                    Inspect the executed transaction
                  </p>
                  <p className="max-w-2xl text-sm leading-relaxed text-secondary">
                    Open decoded, RPC-only views: logs and state/trace, without
                    waiting on an indexer.
                  </p>
                </div>
              </div>

              <a
                href={getBlockScanUrl(txHash)}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1 text-xs font-medium text-secondary transition-colors hover:text-primary"
              >
                Explorer
                <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              </a>
            </div>

            <details className="rounded-xl border border-line bg-cardBackground/80 text-xs">
              <summary className="cursor-pointer px-3 py-2 font-medium text-tertiary">
                Full transaction hash
              </summary>
              <div className="border-t border-line/60 px-2 pb-2">
                <ExecutionHashCopy hash={txHash} showLabel={false} />
              </div>
            </details>

            <div className="grid gap-2 sm:grid-cols-2">
              {viewIds.map((id: ExecutionViewId) => {
                const view = getExecutionView(id);
                return (
                  <Link
                    key={id}
                    href={executionTxViewPath(txHash, id)}
                    className="group rounded-xl border border-line bg-cardBackground p-4 transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5">
                        <p className="text-sm font-semibold text-primary">
                          {view.cardTitle}
                        </p>
                        <p className="text-xs leading-5 text-secondary">
                          {view.cardDescription}
                        </p>
                      </div>
                      <ArrowTopRightOnSquareIcon className="mt-0.5 h-4 w-4 shrink-0 text-tertiary transition-colors group-hover:text-primary" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
