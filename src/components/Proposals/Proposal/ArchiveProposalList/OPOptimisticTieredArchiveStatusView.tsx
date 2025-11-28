import React from "react";

type Props = {
  infoText: string;
  statusText: string;
};

export function OPOptimisticTieredArchiveStatusView({
  infoText,
  statusText,
}: Props) {
  return (
    <div className="flex flex-col text-right text-primary">
      <div>
        <div className="text-xs text-secondary">
          <p>{infoText}</p>
        </div>
        <p>Optimistically {statusText}</p>
      </div>
    </div>
  );
}
