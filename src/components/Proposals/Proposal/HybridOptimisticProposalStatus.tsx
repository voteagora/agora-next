import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  calculateHybridOptimisticProposalMetrics,
  getProposalTiers,
} from "@/lib/proposalUtils";

export const HybridOptimisticProposalStatus = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const metrics = calculateHybridOptimisticProposalMetrics(proposal);

  let proposalInfoTxt = "";
  const tiers = getProposalTiers(proposal);

  const statusTxt = proposal.status === "DEFEATED" ? "defeated" : "approved";
  const proposalStatus = proposal.status;

  if (proposalStatus === "DEFEATED") {
    // Determine which tier threshold was exceeded
    const { groupTallies, thresholds } = metrics;

    const groupsExceedingFourThreshold = groupTallies.filter(
      (g) => g.vetoPercentage >= thresholds.fourGroups
    );
    const groupsExceedingThreeThreshold = groupTallies.filter(
      (g) => g.vetoPercentage >= thresholds.threeGroups
    );
    const groupsExceedingTwoThreshold = groupTallies.filter(
      (g) => g.vetoPercentage >= thresholds.twoGroups
    );

    let thresholdText = "";
    if (groupsExceedingFourThreshold.length >= 4) {
      thresholdText = `${metrics.totalAgainstVotes}% / ${thresholds.fourGroups}% against votes`;
    } else if (groupsExceedingThreeThreshold.length >= 3) {
      thresholdText = `${metrics.totalAgainstVotes}% / ${thresholds.threeGroups}% against votes`;
    } else if (groupsExceedingTwoThreshold.length >= 2) {
      thresholdText = `${metrics.totalAgainstVotes}% / ${thresholds.twoGroups}% against votes`;
    }

    proposalInfoTxt = thresholdText;
  } else {
    proposalInfoTxt = `${metrics.totalAgainstVotes}% / ${tiers[0]}% against needed to defeat`;
  }
  return (
    <div className="flex flex-col text-right text-primary">
      <div>
        <div className="text-xs text-secondary">
          <p>{proposalInfoTxt}</p>
        </div>
        <p>Optimistically {statusTxt}</p>
      </div>
    </div>
  );
};
