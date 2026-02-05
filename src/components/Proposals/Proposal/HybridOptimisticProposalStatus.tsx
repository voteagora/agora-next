import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  calculateHybridOptimisticProposalMetrics,
  getProposalTiers,
} from "@/lib/proposalUtils";

type HybridOptimisticStatusViewProps = {
  infoText: string;
  statusText: string;
};

export function HybridOptimisticStatusView({
  infoText,
  statusText,
}: HybridOptimisticStatusViewProps) {
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

export const HybridOptimisticProposalStatus = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const metrics = calculateHybridOptimisticProposalMetrics(proposal);
  const tiers = getProposalTiers(proposal);

  const statusText = proposal.status === "DEFEATED" ? "defeated" : "approved";

  let infoText = `${metrics.totalAgainstVotes}% / ${tiers[0]}% against needed to defeat`;

  if (proposal.status === "DEFEATED") {
    const { groupTallies, thresholds } = metrics;
    const groupsExceedingThreshold = groupTallies.filter(
      (g) => g.exceedsThreshold
    );

    if (groupsExceedingThreshold.length >= 4) {
      infoText = `${metrics.totalAgainstVotes}% / ${thresholds.fourGroups}% against votes`;
    } else if (groupsExceedingThreshold.length >= 3) {
      infoText = `${metrics.totalAgainstVotes}% / ${thresholds.threeGroups}% against votes`;
    } else if (groupsExceedingThreshold.length >= 2) {
      infoText = `${metrics.totalAgainstVotes}% / ${thresholds.twoGroups}% against votes`;
    }
  }

  return (
    <HybridOptimisticStatusView infoText={infoText} statusText={statusText} />
  );
};

export type HybridOptimisticStatusData = HybridOptimisticStatusViewProps;
