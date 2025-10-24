import { Proposal } from "@/app/api/common/proposals/proposal";
import { calculateHybridStandardProposalMetrics } from "@/lib/proposalUtils";

type HybridStandardStatusViewProps = {
  forPercentage: number;
  againstPercentage: number;
  abstainPercentage: number;
};

export function HybridStandardStatusView({
  forPercentage,
  againstPercentage,
  abstainPercentage,
}: HybridStandardStatusViewProps) {
  const hasVotes = forPercentage + againstPercentage + abstainPercentage > 0;

  return (
    <div className="flex flex-col items-end gap-1 justify-center">
      <div className="flex flex-row space-between text-primary gap-1">
        <div>{forPercentage}% For</div>
        <div>–</div>
        <div>{againstPercentage}% Against</div>
      </div>

      {hasVotes ? (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div
            className=" bg-positive h-1 rounded-l-full"
            style={{ width: `${forPercentage}%` }}
          ></div>
          <div
            className=" bg-tertiary h-1"
            style={{ width: `${abstainPercentage}%` }}
          ></div>
          <div
            className=" bg-negative h-1 rounded-r-full"
            style={{ width: `${againstPercentage}%` }}
          ></div>
        </div>
      ) : (
        <div className="flex w-52 h-1 bg-wash rounded-full">
          <div className=" bg-tertiary h-1" style={{ width: `100%` }}></div>
        </div>
      )}
    </div>
  );
}

export type HybridStandardStatusData = HybridStandardStatusViewProps;

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
    <HybridStandardStatusView
      forPercentage={totalForVotesPercentage}
      againstPercentage={totalAgainstVotesPercentage}
      abstainPercentage={totalAbstainVotesPercentage}
    />
  );
}
