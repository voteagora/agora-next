"use client";

import { useMemo } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { formatEther } from "viem";
import { useExecutionCallTrace } from "@/hooks/useExecutionCallTrace";
import { useExecutionTxLogs } from "@/hooks/useExecutionTxLogs";
import Tenant from "@/lib/tenant/tenant";
import {
  flattenEthMovesFromTrace,
  type CallFrame,
} from "@/lib/execution/callTrace";
import { labelCallInputSelector } from "@/lib/execution/callTraceMetadata";
import { tryDecodeErc20Transfer } from "@/lib/execution/erc20Transfer";
import {
  STATE_INSPECTION_SECTIONS,
  getExecutionView,
} from "@/lib/execution/executionViewsConfig";
import {
  buildExecutionLogPresentation,
  formatExecutionAddressLabel,
  pairExecutionLogsForDisplay,
  type ExecutionLogField,
} from "@/lib/execution/logPresentation";
import { getSchemaName } from "@/lib/knownAddresses";
import { getBlockScanAddress, cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ExecutionAddressTooltip,
  ExecutionEmptyState,
  ExecutionInlineSpinner,
  ExecutionPageIntro,
  ExecutionSection,
} from "./ExecutionUi";

const PAGE = getExecutionView("state");

function CompactLogFieldValue({ field }: { field: ExecutionLogField }) {
  if (field.type === "address" && field.address) {
    const full = (field.fullValue ?? field.address) as `0x${string}`;
    return (
      <ExecutionAddressTooltip address={full}>
        <span className="cursor-default text-sm font-medium text-primary">
          {field.value}
        </span>
      </ExecutionAddressTooltip>
    );
  }
  if (
    (field.type === "hash" || field.type === "bytes") &&
    field.fullValue != null
  ) {
    const full = field.fullValue;
    const schemaLabel = field.type === "hash" ? getSchemaName(full) : null;
    const display = schemaLabel ?? field.value;
    return (
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "cursor-default text-primary",
              !schemaLabel && "font-mono"
            )}
          >
            {display}
          </span>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-h-[min(50vh,20rem)] max-w-[min(92vw,24rem)] overflow-y-auto break-all border-line bg-cardBackground font-mono text-xs text-primary"
        >
          {full}
        </TooltipContent>
      </Tooltip>
    );
  }
  return (
    <span className={cn("text-primary", field.type !== "text" && "font-mono")}>
      {field.value}
    </span>
  );
}

function AddressLink({ address }: { address: string }) {
  return (
    <ExecutionAddressTooltip address={address}>
      <a
        className="text-sm font-medium text-primary underline-offset-2 hover:underline"
        href={getBlockScanAddress(address)}
        target="_blank"
        rel="noreferrer noopener"
      >
        {formatExecutionAddressLabel(address)}
      </a>
    </ExecutionAddressTooltip>
  );
}

function CallTree({ frame, depth = 0 }: { frame: CallFrame; depth?: number }) {
  const hasVal =
    frame.value &&
    frame.value !== "0x0" &&
    frame.value !== "0x" &&
    BigInt(frame.value) > 0n;
  const selectorLabel = labelCallInputSelector(frame.input);

  return (
    <div
      className={cn(
        "relative",
        depth > 0 && "ml-0 border-l-2 border-primary/15 pl-4 pt-1"
      )}
    >
      {depth > 0 && (
        <span
          className="absolute -left-px top-2 h-2 w-2 -translate-x-1/2 rounded-full bg-tertiary/40"
          aria-hidden
        />
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded bg-wash px-1.5 py-0.5 font-mono text-secondary">
          {frame.type}
        </span>
        {selectorLabel && (
          <span className="font-mono text-xs text-primary">
            {selectorLabel}
          </span>
        )}
        {frame.error && (
          <span className="text-negative">error: {frame.error}</span>
        )}
      </div>
      <div className="mt-2 space-y-1 text-xs text-primary">
        <div>
          <span className="text-tertiary">from</span>{" "}
          <AddressLink address={frame.from} />
        </div>
        {frame.to && (
          <div>
            <span className="text-tertiary">to</span>{" "}
            <AddressLink address={frame.to} />
          </div>
        )}
        {hasVal && frame.to && (
          <div>
            <span className="text-tertiary">value</span>{" "}
            <span className="font-mono text-sm">
              {formatEther(BigInt(frame.value!))}
            </span>
          </div>
        )}
      </div>
      {frame.calls?.map((child, i) => (
        <CallTree key={`${depth}-${i}`} frame={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function ExecutionStateView({ txHash }: { txHash: string }) {
  const { contracts } = Tenant.current();
  const nativeSymbol = contracts.token.chain.nativeCurrency?.symbol ?? "ETH";
  const traceQ = useExecutionCallTrace(txHash);
  const logsQ = useExecutionTxLogs(txHash);

  const displayLogs = useMemo(
    () => pairExecutionLogsForDisplay(logsQ.data?.logs ?? []),
    [logsQ.data?.logs]
  );

  const tokenRows: {
    token: `0x${string}`;
    from: `0x${string}`;
    to: `0x${string}`;
    value: bigint;
  }[] = [];

  if (logsQ.data?.receipt.logs) {
    for (const log of logsQ.data.receipt.logs) {
      const transfer = tryDecodeErc20Transfer(log);
      if (!transfer) {
        continue;
      }
      tokenRows.push({
        token: log.address,
        from: transfer.from,
        to: transfer.to,
        value: transfer.value,
      });
    }
  }

  const ethMoves = flattenEthMovesFromTrace(traceQ.data ?? null);
  const introOnlyLoading = logsQ.isLoading && !logsQ.data;

  if (introOnlyLoading) {
    return (
      <div>
        <ExecutionPageIntro eyebrow={PAGE.pageEyebrow} title={PAGE.pageTitle} />
        <div className="overflow-hidden rounded-2xl border border-line bg-cardBackground shadow-sm">
          <ExecutionInlineSpinner message="Loading receipt…" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ExecutionPageIntro eyebrow={PAGE.pageEyebrow} title={PAGE.pageTitle} />
      {logsQ.isFetching && !logsQ.error && (
        <p className="text-center text-xs text-tertiary">Refreshing receipt…</p>
      )}

      {logsQ.error && (
        <div className="rounded-xl border border-negative/40 bg-wash px-4 py-3 text-sm text-negative">
          {logsQ.error instanceof Error
            ? logsQ.error.message
            : "Could not load receipt."}
        </div>
      )}

      {!logsQ.error &&
        STATE_INSPECTION_SECTIONS.map((section) => {
          const rows = displayLogs
            .filter((log) => section.include(log))
            .map((log) => ({
              log,
              presentation: buildExecutionLogPresentation(log),
            }));

          return (
            <ExecutionSection
              key={section.id}
              title={section.title}
              description={section.subtitle}
            >
              {rows.length === 0 && (
                <ExecutionEmptyState title={section.emptyLabel}>
                  This transaction did not emit events that match this section.
                </ExecutionEmptyState>
              )}
              {rows.length > 0 && (
                <ul className="space-y-2">
                  {rows.map(({ log, presentation }) => (
                    <li
                      key={log.logIndex}
                      className="rounded-xl border border-line/80 bg-wash/80 p-3 shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold text-primary">
                          {presentation.summary ?? presentation.title}
                        </div>
                      </div>
                      {presentation.fields.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-secondary">
                          {presentation.fields.slice(0, 6).map((field) => (
                            <div key={`${log.logIndex}-${field.label}`}>
                              <span className="text-tertiary">
                                {field.label}:
                              </span>{" "}
                              <CompactLogFieldValue field={field} />
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </ExecutionSection>
          );
        })}

      <ExecutionSection
        title={`Native ${nativeSymbol} inside the call`}
        description="Only shows when the RPC returns a trace. Empty is normal for many governance txs."
      >
        {traceQ.isLoading && (
          <ExecutionInlineSpinner message="Loading trace…" />
        )}
        {traceQ.error && (
          <ExecutionEmptyState title="Trace not available">
            {traceQ.error instanceof Error
              ? traceQ.error.message
              : "This network may not expose debug_traceTransaction."}
          </ExecutionEmptyState>
        )}
        {!traceQ.isLoading && !traceQ.error && traceQ.data && (
          <>
            {ethMoves.length === 0 ? (
              <ExecutionEmptyState title="No value-bearing internal calls">
                The top call may be the only frame, or the trace omitted child
                value sends.
              </ExecutionEmptyState>
            ) : (
              <ul className="space-y-2 text-sm">
                {ethMoves.map((move, index) => (
                  <li
                    key={index}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-xs"
                  >
                    <span className="text-primary">
                      {formatEther(move.valueWei)} {nativeSymbol}
                    </span>
                    <span className="text-tertiary">from</span>
                    <AddressLink address={move.from} />
                    <span className="text-tertiary">to</span>
                    <AddressLink address={move.to} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </ExecutionSection>

      {!logsQ.error && (
        <ExecutionSection
          title="Token transfers"
          description="Transfer logs from the receipt (raw unit amounts; decimals not applied)."
        >
          {logsQ.data && tokenRows.length === 0 && (
            <ExecutionEmptyState title="No Transfer events">
              This transaction did not emit a matching Transfer in the log
              stream.
            </ExecutionEmptyState>
          )}
          {tokenRows.length > 0 && (
            <ul className="space-y-2">
              {tokenRows.map((row, index) => (
                <li
                  key={index}
                  className="rounded-xl border border-line/80 bg-wash/80 p-3 text-xs"
                >
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                      Token
                    </span>
                    <ExecutionAddressTooltip address={row.token}>
                      <a
                        href={getBlockScanAddress(row.token)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex min-w-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
                      >
                        {formatExecutionAddressLabel(row.token)}
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </ExecutionAddressTooltip>
                  </div>
                  <div className="font-mono text-sm text-primary">
                    amount: {row.value.toString()}
                  </div>
                  <div className="mt-1 text-tertiary">
                    from <AddressLink address={row.from} />
                  </div>
                  <div className="text-tertiary">
                    to <AddressLink address={row.to} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ExecutionSection>
      )}

      <ExecutionSection
        title="Call tree"
        description="Nested calls in execution order, when the node returns callTracer data."
      >
        {traceQ.isLoading && (
          <ExecutionInlineSpinner message="Loading trace…" />
        )}
        {traceQ.error && (
          <ExecutionEmptyState title="No tree">
            Trace failed to load.
          </ExecutionEmptyState>
        )}
        {traceQ.data && <CallTree frame={traceQ.data} />}
        {!traceQ.isLoading && !traceQ.error && traceQ.data == null && (
          <ExecutionEmptyState title="Empty trace">
            The node returned an empty or unparsable callTracer result.
          </ExecutionEmptyState>
        )}
      </ExecutionSection>
    </div>
  );
}
