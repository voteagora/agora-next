"use client";

import { useMemo } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { Badge } from "@/components/ui/badge";
import { useExecutionTxLogs } from "@/hooks/useExecutionTxLogs";
import { getExecutionView } from "@/lib/execution/executionViewsConfig";
import {
  buildExecutionLogPresentation,
  formatExecutionAddressLabel,
  pairExecutionLogsForDisplay,
  type ExecutionLogField,
} from "@/lib/execution/logPresentation";
import { getBlockScanAddress } from "@/lib/utils";
import {
  ExecutionAddressTooltip,
  ExecutionCopyButton,
  ExecutionCopyableValue,
  ExecutionFieldGrid,
  ExecutionFieldTile,
  ExecutionInlineSpinner,
  ExecutionPageIntro,
} from "./ExecutionUi";

const PAGE = getExecutionView("events");

function AddressValue({ address }: { address: `0x${string}` }) {
  return (
    <div className="flex min-w-0 items-center gap-0.5">
      <ExecutionAddressTooltip address={address}>
        <a
          href={getBlockScanAddress(address)}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex min-w-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          {formatExecutionAddressLabel(address)}
          <ArrowTopRightOnSquareIcon className="h-3 w-3 shrink-0" />
        </a>
      </ExecutionAddressTooltip>
      <ExecutionCopyButton
        text={address}
        title="Copy address"
        aria-label="Copy full address"
      />
    </div>
  );
}

function FieldValue({ field }: { field: ExecutionLogField }) {
  if (field.type === "address" && field.address) {
    return <AddressValue address={field.address} />;
  }

  const mono = field.type !== "text" && field.type !== "boolean";
  const full = field.fullValue;
  if (full != null && full !== field.value) {
    return (
      <ExecutionCopyableValue
        display={field.value}
        fullText={full}
        mono={mono}
      />
    );
  }

  return (
    <div
      className={[
        "break-all text-primary",
        mono ? "font-mono text-xs" : "text-sm",
      ].join(" ")}
    >
      {field.value}
    </div>
  );
}

export function ExecutionEventsView({ txHash }: { txHash: string }) {
  const { data, isLoading, error } = useExecutionTxLogs(txHash);

  const logs = useMemo(
    () => pairExecutionLogsForDisplay(data?.logs ?? []),
    [data?.logs]
  );

  if (isLoading) {
    return (
      <div>
        <ExecutionPageIntro
          eyebrow={PAGE.pageEyebrow}
          title={PAGE.pageTitle}
          lead={PAGE.lead}
        />
        <div className="overflow-hidden rounded-2xl border border-line bg-cardBackground shadow-sm">
          <ExecutionInlineSpinner message="Loading event logs…" />
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="rounded-xl border border-line bg-wash p-4 text-sm text-negative">
        {error instanceof Error ? error.message : "Failed to load logs"}
      </div>
    );
  }
  if (!data) {
    return null;
  }

  const decodedCount = logs.filter(
    (l) => l.decodeSource !== "none" && l.eventName
  ).length;

  return (
    <div>
      <ExecutionPageIntro
        eyebrow={PAGE.pageEyebrow}
        title={PAGE.pageTitle}
        lead={PAGE.lead}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{logs.length} events</Badge>
        {decodedCount < logs.length && (
          <Badge variant="outline">{logs.length - decodedCount} raw</Badge>
        )}
      </div>

      <div className="space-y-4">
        {logs.map((log) => {
          const presentation = buildExecutionLogPresentation(log);

          return (
            <div
              key={log.logIndex}
              className="overflow-hidden rounded-2xl border border-line bg-cardBackground shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="border-b border-line/70 bg-wash/60 px-4 py-3 sm:px-5 sm:py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-primary sm:text-lg">
                        {presentation.title}
                      </h3>
                      <span className="text-xs font-medium text-tertiary">
                        #{log.logIndex}
                      </span>
                    </div>
                    {presentation.summary && (
                      <p className="text-sm leading-relaxed text-secondary">
                        {presentation.summary}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    <ExecutionAddressTooltip address={log.address}>
                      <a
                        href={getBlockScanAddress(log.address)}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="inline-flex items-center gap-1 text-xs font-medium text-tertiary transition-colors hover:text-primary"
                      >
                        {formatExecutionAddressLabel(log.address)}
                        <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                      </a>
                    </ExecutionAddressTooltip>
                    <ExecutionCopyButton
                      text={log.address}
                      title="Copy address"
                      aria-label="Copy contract address"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                {presentation.fields.length > 0 ? (
                  <ExecutionFieldGrid>
                    {presentation.fields.map((field) => (
                      <ExecutionFieldTile
                        key={`${log.logIndex}-${field.label}`}
                        label={field.label}
                      >
                        <FieldValue field={field} />
                      </ExecutionFieldTile>
                    ))}
                  </ExecutionFieldGrid>
                ) : (
                  <p className="text-sm text-secondary">
                    No decoded fields for this log.
                  </p>
                )}

                <details className="group rounded-xl border border-line bg-wash/80">
                  <summary className="cursor-pointer list-none px-3 py-2.5 text-sm font-medium text-secondary transition-colors group-open:text-primary marker:content-none">
                    Raw log
                  </summary>
                  <div className="space-y-3 border-t border-line px-3 py-3 text-xs text-primary">
                    <div>
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                        topic 0
                      </div>
                      <div className="font-mono break-all">
                        {log.raw.topics[0] ?? "—"}
                      </div>
                    </div>

                    {log.raw.topics.length > 1 && (
                      <div>
                        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                          indexed topics
                        </div>
                        <div className="font-mono break-all text-secondary">
                          {log.raw.topics.slice(1).join(", ")}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-tertiary">
                        data
                      </div>
                      <div className="max-h-48 overflow-y-auto font-mono break-all text-sm">
                        {log.raw.data}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
