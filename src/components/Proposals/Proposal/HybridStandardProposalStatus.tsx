import { Proposal } from "@/app/api/common/proposals/proposal";
import { calculateHybridStandardProposalMetrics } from "@/lib/proposalUtils";

export default function HybridStandardProposalStatus({
  proposal,
}: {
  proposal: Proposal;
}) {
  const {
    totalForVotesPercentage,
    totalAgainstVotesPercentage,
    totalAbstainVotesPercentage,
  } = calculateHybridStandardProposalMetrics(proposal);
  return (
    <div className="flex flex-col items-end gap-1 justify-center">
      <div className="flex flex-row space-between text-primary gap-1">
        <div>{totalForVotesPercentage}% For</div>
        <div>–</div>
        <div>{totalAgainstVotesPercentage}% Against</div>
      </div>

      {totalForVotesPercentage > 0 && (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div
            className=" bg-positive h-1 rounded-l-full"
            style={{ width: `${totalForVotesPercentage}%` }}
          ></div>
          <div
            className=" bg-tertiary h-1"
            style={{ width: `${totalAbstainVotesPercentage}%` }}
          ></div>
          <div
            className=" bg-negative h-1 rounded-r-full"
            style={{ width: `${totalAgainstVotesPercentage}%` }}
          ></div>
        </div>
      )}

      {totalForVotesPercentage === 0 && (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div className=" bg-tertiary h-1" style={{ width: `100%` }}></div>
        </div>
      )}
    </div>
  );
}
