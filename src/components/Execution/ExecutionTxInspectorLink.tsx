import Link from "next/link";
import { SearchCode } from "lucide-react";
import { executionTxViewPath } from "@/lib/execution/executionViewsConfig";
import { cn } from "@/lib/utils";

export function ExecutionTxInspectorIconLink({
  txHash,
  className,
  iconClassName,
}: {
  txHash: string;
  className?: string;
  iconClassName?: string;
}) {
  const href = executionTxViewPath(txHash, "events");
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 text-tertiary transition-colors hover:text-primary",
        className
      )}
      title="Inspect (decoded logs & trace)"
      aria-label="Inspect transaction"
    >
      <SearchCode className={cn("h-4 w-4", iconClassName)} aria-hidden />
    </Link>
  );
}
