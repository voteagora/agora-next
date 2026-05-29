"use client";

import { CheckCircle2 } from "lucide-react";
import { useEnsName } from "wagmi";

import ENSAvatar from "@/components/shared/ENSAvatar";
import ENSName from "@/components/shared/ENSName";
import { shortAddress } from "@/lib/utils";

export function SafeSignerProgress({
  signed,
  threshold,
}: {
  signed: number;
  threshold: number;
}) {
  const radius = 40;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const safeThreshold = threshold || 1;
  const progressPercent = Math.min(signed, safeThreshold) / safeThreshold;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="-rotate-90 transform drop-shadow-md"
      >
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="text-line opacity-30"
        />
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference + " " + circumference}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className={
            signed >= safeThreshold ? "text-emerald-500" : "text-primary"
          }
        />
      </svg>
      <div className="absolute flex items-baseline justify-center gap-0.5">
        <span className="text-3xl font-extrabold text-primary tracking-tighter leading-none">
          {signed}
        </span>
        <span className="text-sm font-bold text-secondary opacity-50">
          /{safeThreshold}
        </span>
      </div>
    </div>
  );
}

export function SafeOwnerStatusRow({
  owner,
  signed,
}: {
  owner: `0x${string}`;
  signed: boolean;
}) {
  const { data: ensName } = useEnsName({
    chainId: 1,
    address: owner,
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-muted/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <ENSAvatar
            ensName={ensName ?? undefined}
            className="h-10 w-10 rounded-full ring-2 ring-neutral shadow-sm"
            size={40}
          />
          {signed ? (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 ring-2 ring-neutral z-10 shadow-sm animate-in zoom-in duration-300">
              <CheckCircle2 className="h-3 w-3" />
            </div>
          ) : null}
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-sm text-primary tracking-tight">
            <ENSName address={owner} />
          </span>
          <span className="text-[11px] text-secondary/60 font-mono tracking-wider mt-0.5">
            {shortAddress(owner)}
          </span>
        </div>
      </div>
      {signed ? (
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 rounded-full ring-1 ring-inset ring-emerald-500/20">
          Signed
        </span>
      ) : (
        <span className="text-xs font-bold uppercase tracking-wider text-secondary/40 group-hover:text-secondary/70 transition-colors px-3 py-1.5">
          Pending
        </span>
      )}
    </div>
  );
}
