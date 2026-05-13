import React from "react";
import { pluralize } from "@/lib/utils";

type Props = {
  maxApprovals: number;
  optionCount: number;
};

export function OPApprovalArchiveStatusView({
  maxApprovals,
  optionCount,
}: Props) {
  return (
    <div className="flex flex-col items-end">
      <div className="text-xs text-secondary">Select {maxApprovals} of</div>
      <div className="flex flex-row gap-1">
        {pluralize("Option", optionCount)}
      </div>
    </div>
  );
}
