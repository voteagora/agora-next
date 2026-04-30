"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ExecutionTxHeader } from "@/components/Execution/ExecutionTxHeader";
import { ExecutionTxNav } from "@/components/Execution/ExecutionTxNav";
import { ExecutionInlineSpinner } from "@/components/Execution/ExecutionUi";
import { TooltipProvider } from "@/components/ui/tooltip";

export function ExecutionTxShell({
  txHash,
  children,
}: {
  txHash: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const switchingView = pendingHref != null && pendingHref !== pathname;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="min-h-[50vh] bg-gradient-to-b from-wash/80 to-cardBackground/30">
        <div className="container mx-auto max-w-5xl px-4 py-8 sm:px-5 sm:py-10">
          <ExecutionTxHeader txHash={txHash} />
          <ExecutionTxNav
            txHash={txHash}
            pendingHref={pendingHref}
            onPendingNavigate={setPendingHref}
          />
          {switchingView ? (
            <div className="overflow-hidden rounded-2xl border border-line bg-cardBackground shadow-sm">
              <ExecutionInlineSpinner message="Loading view…" />
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}
