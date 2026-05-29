import React from "react";

type Props = {
  againstRelativeAmount: number;
  disapprovalThreshold: number;
  status: string;
};

export function OPOptimisticArchiveStatusView({
  againstRelativeAmount,
  disapprovalThreshold,
  status,
}: Props) {
  return (
    <div className="flex flex-col text-right text-primary">
      <div>
        <div className="text-xs text-secondary">
          <p>
            {againstRelativeAmount}% / {disapprovalThreshold}% against needed to
            defeat
          </p>
        </div>
        <p>Optimistically {status}</p>
      </div>
    </div>
  );
}
