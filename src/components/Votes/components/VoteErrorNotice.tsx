"use client";

import { useOpenDialogOptional } from "@/components/Dialogs/DialogProvider/DialogProvider";
import Tenant from "@/lib/tenant/tenant";
import type { ClassifiedVoteError } from "@/lib/voteErrorUtils";

export function VoteErrorNotice({
  error,
  className,
}: {
  error: ClassifiedVoteError | null;
  className?: string;
}) {
  const { contracts } = Tenant.current();
  const openDialog = useOpenDialogOptional();

  if (!error) {
    return null;
  }

  const canSwitchNetwork = error.code === "WRONG_CHAIN" && !!openDialog;

  return (
    <div className={className ?? "mb-3 text-sm text-negative"}>
      <span>{error.message}</span>
      {canSwitchNetwork && (
        <button
          type="button"
          className="ml-2 underline font-semibold"
          onClick={() =>
            openDialog({
              type: "SWITCH_NETWORK",
              params: { chain: contracts.token.chain },
            })
          }
        >
          Switch network
        </button>
      )}
    </div>
  );
}
