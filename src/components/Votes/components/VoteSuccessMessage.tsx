import { CheckCircleIcon } from "@heroicons/react/20/solid";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import { formatDistanceToNow } from "date-fns";

interface VoteSuccessMessageProps {
  transactionHash?: string | null;
  timestamp?: Date | null;
  showTimestamp?: boolean;
}

export function VoteSuccessMessage({
  transactionHash,
  timestamp,
  showTimestamp = false,
}: VoteSuccessMessageProps) {
  return (
    <div className="w-full rounded-lg border border-line bg-neutral p-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <CheckCircleIcon className="h-6 w-6 text-positive flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary">
              Vote submitted successfully!
            </p>
            {showTimestamp && timestamp && (
              <p className="text-xs text-secondary mt-1">
                Voted {formatDistanceToNow(timestamp)} ago
              </p>
            )}
          </div>
        </div>
        {transactionHash && (
          <BlockScanUrls
            className="text-xs font-medium text-tertiary"
            hash1={transactionHash}
          />
        )}
      </div>
    </div>
  );
}
