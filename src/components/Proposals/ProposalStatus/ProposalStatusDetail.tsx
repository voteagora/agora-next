import ProposalTimeStatus from "@/components/Proposals/Proposal/ProposalTimeStatus";
import { type ProposalStatus } from "@/lib/proposalUtils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl } from "@/lib/utils";

export default function ProposalStatusDetail({
  proposalStatus,
  proposalEndTime,
  proposalStartTime,
  proposalCancelledTime,
  cancelledTransactionHash,
}: {
  proposalStatus: ProposalStatus | null;
  proposalEndTime: Date | null;
  proposalStartTime: Date | null;
  proposalCancelledTime: Date | null;
  cancelledTransactionHash: string | null;
}) {
  return (
    <div className="flex flex-row justify-between items-center gap-4 bg-wash border-t -mx-4 px-4 py-2 text-secondary rounded-b-md text-xs">
      <div>
        {proposalStatus === "ACTIVE" && (
          <p className="text-blue-600 bg-sky-200 rounded-sm px-1 py-0.5 font-semibold">
            ACTIVE
          </p>
        )}
        {proposalStatus === "QUEUED" && (
          <p className="text-blue-600 bg-blue-200 rounded-sm px-1 py-0.5 font-semibold">
            QUEUED
          </p>
        )}
        {proposalStatus === "EXECUTED" && (
          <p className="text-green-600 bg-green-200 rounded-sm px-1 py-0.5 font-semibold">
            EXECUTED
          </p>
        )}
        {proposalStatus === "SUCCEEDED" && (
          <p className="text-green-600 bg-green-200 rounded-sm px-1 py-0.5 font-semibold">
            SUCCEEDED
          </p>
        )}
        {proposalStatus === "DEFEATED" && (
          <p className="text-red-600 bg-red-200 rounded-sm px-1 py-0.5 font-semibold">
            DEFEATED
          </p>
        )}
        {proposalStatus === "FAILED" && (
          <p className="text-gray-600 bg-gray-300 rounded-sm px-1 py-0.5 font-semibold">
            FAILED
          </p>
        )}
        {proposalStatus === "CANCELLED" && (
          <div className="text-red-600 bg-red-200 rounded-sm px-1 py-0.5 font-semibold">
            {cancelledTransactionHash ? (
              <a
                href={getBlockScanUrl(cancelledTransactionHash)}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center"
              >
                <span>CANCELLED</span>
                <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
              </a>
            ) : (
              <span>CANCELLED</span>
            )}
          </div>
        )}
      </div>
      <div>
        <ProposalTimeStatus
          proposalStatus={proposalStatus}
          proposalStartTime={proposalStartTime}
          proposalEndTime={proposalEndTime}
          proposalCancelledTime={proposalCancelledTime}
        />
      </div>
    </div>
  );
}
