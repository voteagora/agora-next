import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ZERO_VP_VOTE_TOOLTIP =
  "Voting power is snapshotted when voting starts. This voter had 0 voting power at that moment, so the vote is recorded onchain but does not count toward the outcome.";

export const zeroVpTooltipContentClass =
  "max-w-[14rem] px-3 py-2 text-xs text-secondary leading-snug";

/**
 * True when a vote's weight is exactly zero. Accepts raw bigint strings,
 * formatted numbers with separators, or plain numbers.
 */
export function isZeroWeight(
  weight: string | number | bigint | null | undefined
): boolean {
  if (typeof weight === "bigint") {
    return weight === 0n;
  }
  if (typeof weight === "number") {
    return Number.isFinite(weight) && weight === 0;
  }
  const raw = (weight ?? "").toString().trim().replace(/,/g, "") || "0";
  try {
    return BigInt(raw) === 0n;
  } catch {
    const n = Number.parseFloat(raw);
    return Number.isFinite(n) && n === 0;
  }
}

/**
 * Wraps an entire voter-list row in the zero-voting-power explanation tooltip
 * when `active`, and renders the children untouched otherwise.
 */
export function ZeroVpRowTooltip({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help">{children}</div>
        </TooltipTrigger>
        <TooltipContent className={zeroVpTooltipContentClass}>
          {ZERO_VP_VOTE_TOOLTIP}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
