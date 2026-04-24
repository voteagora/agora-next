"use client";

import { formatEther } from "viem";
import {
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { useExecutionTxOverview } from "@/hooks/useExecutionTxOverview";
import { formatExecutionAddressLabel } from "@/lib/execution/logPresentation";
import { getBlockScanAddress, getBlockScanUrl, cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { ExecutionAddressTooltip, ExecutionHashCopy } from "./ExecutionUi";

function AddressRow({
  label,
  address,
  isContract = true,
}: {
  label: string;
  address?: string;
  isContract?: boolean;
}) {
  if (!isContract) {
    return (
      <div className="text-sm">
        <span className="text-tertiary">{label} </span>
        <span className="text-primary">Contract creation</span>
      </div>
    );
  }

  const addr = address ?? "";
  const display = formatExecutionAddressLabel(addr);
  return (
    <div className="min-w-0 text-sm sm:text-base">
      <span className="text-tertiary">{label} </span>
      <ExecutionAddressTooltip address={addr}>
        <a
          className={cn(
            "text-primary hover:underline",
            display.startsWith("0x")
              ? "font-mono text-sm"
              : "text-sm font-medium"
          )}
          href={getBlockScanAddress(addr)}
          target="_blank"
          rel="noreferrer noopener"
        >
          {display}
        </a>
      </ExecutionAddressTooltip>
    </div>
  );
}

export function ExecutionTxHeader({ txHash }: { txHash: string }) {
  const { contracts } = Tenant.current();
  const nativeSymbol = contracts.token.chain.nativeCurrency?.symbol ?? "ETH";
  const { data, isLoading, error } = useExecutionTxOverview(txHash);

  if (isLoading) {
    return (
      <div className="mb-8 space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-wash" />
        <div className="h-12 animate-pulse rounded-xl bg-wash" />
        <div className="h-20 animate-pulse rounded-xl bg-wash" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="mb-8 rounded-xl border border-line bg-wash p-4 text-sm text-negative">
        {error instanceof Error ? error.message : "Could not load transaction"}
      </div>
    );
  }

  const { receipt, tx } = data;
  const ok = receipt.status === "success";
  const explorer = getBlockScanUrl(txHash);
  const valueLine = tx ? `${formatEther(tx.value)} ${nativeSymbol}` : "—";

  return (
    <header className="relative mb-8 overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-cardBackground via-wash to-cardBackground shadow-sm">
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-1",
          ok ? "bg-positive" : "bg-negative"
        )}
        aria-hidden
      />
      <div className="p-5 pl-6 sm:p-6 sm:pl-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
            Execution
          </h1>
          <a
            href={explorer}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-line bg-cardBackground px-3 py-2 text-xs font-medium text-secondary transition-colors hover:border-primary/30 hover:text-primary"
          >
            Open in explorer
            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-line/70 pt-4 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-8 sm:gap-y-2">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-tertiary">
              Outcome
            </span>
            <p
              className={cn(
                "mt-0.5 text-lg font-semibold",
                ok ? "text-positive" : "text-negative"
              )}
            >
              {ok ? "Succeeded" : "Reverted"}
            </p>
          </div>
          {tx && (
            <div>
              <span className="text-xs font-medium uppercase tracking-wide text-tertiary">
                Native transfer
              </span>
              <p className="mt-0.5 font-mono text-lg font-medium text-primary">
                {valueLine}
              </p>
            </div>
          )}
        </div>

        {tx && (
          <div className="mt-5 space-y-2 border-t border-line/70 pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-tertiary">
              Parties
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:gap-8">
              <AddressRow label="From" address={tx.from} />
              {tx.to ? (
                <AddressRow label="To" address={tx.to} />
              ) : (
                <AddressRow label="To" isContract={false} />
              )}
            </div>
          </div>
        )}

        <details className="group mt-5 border-t border-line/70 pt-3">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-tertiary marker:content-none hover:text-primary">
            <ChevronDownIcon className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" />
            Transaction id &amp; chain metadata
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-2 pl-0.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <ExecutionHashCopy hash={txHash} />
            </div>
            <div className="rounded-lg border border-line/80 bg-wash/60 px-3 py-2 text-xs">
              <span className="text-tertiary">Block</span>
              <p className="font-mono text-primary">
                {receipt.blockNumber.toString()}
              </p>
            </div>
            <div className="rounded-lg border border-line/80 bg-wash/60 px-3 py-2 text-xs">
              <span className="text-tertiary">Gas used</span>
              <p className="font-mono text-primary">
                {receipt.gasUsed.toLocaleString()}
              </p>
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
