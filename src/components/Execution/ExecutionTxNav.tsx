"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoltIcon, ArrowsRightLeftIcon } from "@heroicons/react/20/solid";
import { cn } from "@/lib/utils";
import {
  type ExecutionViewId,
  getExecutionView,
  executionTxViewPath,
  listExecutionViewIds,
} from "@/lib/execution/executionViewsConfig";

const TAB_ICON: Record<ExecutionViewId, typeof BoltIcon> = {
  events: BoltIcon,
  state: ArrowsRightLeftIcon,
};

export function ExecutionTxNav({
  txHash,
  pendingHref,
  onPendingNavigate,
}: {
  txHash: string;
  pendingHref: string | null;
  onPendingNavigate: (href: string) => void;
}) {
  const pathname = usePathname();
  const ids = listExecutionViewIds();

  return (
    <div
      className="mb-8 rounded-xl border border-line bg-wash/70 p-1.5 shadow-sm"
      role="tablist"
      aria-label="Execution views"
    >
      <div className="grid grid-cols-2 gap-1 sm:flex sm:flex-nowrap sm:gap-1">
        {ids.map((id) => {
          const view = getExecutionView(id);
          const href = executionTxViewPath(txHash, id);
          const active = pendingHref != null ? pendingHref === href : pathname === href;
          const Icon = TAB_ICON[id];

          return (
            <Link
              key={id}
              href={href}
              onClick={() => {
                if (href !== pathname) {
                  onPendingNavigate(href);
                }
              }}
              className={cn(
                "flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:flex-1",
                active
                  ? "bg-cardBackground text-primary shadow-sm ring-1 ring-line"
                  : "text-secondary hover:bg-cardBackground/80 hover:text-primary"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {view.tabLabel}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
