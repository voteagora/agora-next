import { HStack } from "@/components/Layout/Stack";
import ProposalTimeStatus from "@/components/Proposals/Proposal/ProposalTimeStatus";
import { type ProposalStatus } from "@/lib/proposalUtils";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/20/solid";
import { getBlockScanUrl } from "@/lib/utils";

export default function ProposalStatusDetail({
  proposalStatus,
  proposalEndTime,
  proposalStartTime,
}: {
  proposalStatus: ProposalStatus | null;
  proposalEndTime: Date | null;
  proposalStartTime: Date | null;
}) {
  return (
    <HStack
      justifyContent="justify-between"
      alignItems="items-center"
      className="bg-gray-fa border-t -mx-4 px-4 py-2 text-gray-4f rounded-b-md text-xs"
    >
      <div>
        {proposalStatus === "ACTIVE" && (
          <p className="text-blue-600 bg-sky-200 rounded-sm px-1 py-0.5 font-semibold">
            ACTIVE
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
        {proposalStatus === "CANCELLED" && (
          <div className="text-red-600 bg-red-200 rounded-sm px-1 py-0.5 font-semibold flex items-center">
            <span>CANCELLED</span>
            {/* TODO: this hash url */}
            <a
              href={getBlockScanUrl("hash2")}
              target="_blank"
              rel="noreferrer noopener"
            >
              <ArrowTopRightOnSquareIcon className="w-3 h-3 ml-1" />
            </a>
          </div>
        )}
      </div>
      <div>
        <ProposalTimeStatus
          proposalStatus={proposalStatus}
          proposalStartTime={proposalStartTime}
          proposalEndTime={proposalEndTime}
        />
      </div>
    </HStack>
  );
}
