import { HybridProposalStrategy } from "./HybridProposalStrategy";
import { ProposalMetrics } from "../types";
import { Proposal } from "../entities/Proposal";
import { ProposalCalculationError } from "../errors/ProposalErrors";

// First get the HybridMetrics interface from the parent class
interface HybridMetrics extends ProposalMetrics {
  groupMetrics: {
    [key: string]: {
      participationRate: number;
      approvalRate: number;
      meetsMinimum: boolean;
    };
  };
  weightedApprovalRate: number;
}

interface HybridOptimisticTieredMetrics extends HybridMetrics {
  groupTallies: Array<{
    group: string;
    vetoPercentage: number;
    againstVotes: number;
  }>;
  vetoTriggered: boolean;
  thresholds: {
    twoGroups: number;
    threeGroups: number;
    fourGroups: number;
  };
}

export class HybridOptimisticTieredStrategy extends HybridProposalStrategy {
  calculateMetrics(proposal: Proposal): HybridOptimisticTieredMetrics {
    try {
      const data = proposal.getData() as any;
      const context = proposal.getContext();
      const rawData = proposal.getRawData();

      // Get tiered thresholds from proposal data
      const tiers =
        rawData?.tiers ||
        (proposal.getType() === "HYBRID_OPTIMISTIC_TIERED"
          ? [55, 45, 35]
          : [65, 65, 65]);

      const thresholds = {
        twoGroups: tiers[0] / 100, // 55% for 2 groups
        threeGroups: tiers[1] / 100, // 45% for 3 groups
        fourGroups: tiers[2] / 100, // 35% for 4 groups
      };

      // Get delegate quorum for eligible voters calculation
      const delegateQuorum = context.delegateQuorum || 100000n;

      // Calculate eligible voters exactly like existing system
      const eligibleVoters = {
        delegates: Number(delegateQuorum) * (100 / 30), // Convert 30% quorum to total eligible
        apps: 100, // Fixed threshold
        users: 1000, // Fixed threshold
        chains: 15, // Fixed threshold
      };

      // Calculate veto percentage for each group
      const groupTallies = [];
      for (const [groupName, groupData] of Object.entries(data.votingGroups)) {
        const againstVotes = Number((groupData as any).againstVotes || 0);
        const totalEligible =
          eligibleVoters[groupName as keyof typeof eligibleVoters];

        const vetoPercentage =
          totalEligible > 0 ? (againstVotes / totalEligible) * 100 : 0;

        groupTallies.push({
          group: groupName,
          vetoPercentage,
          againstVotes,
        });
      }

      // Apply tiered veto logic exactly like existing system
      let vetoTriggered = false;

      // Check if 4+ groups exceed 4-group threshold
      const groupsExceedingFourThreshold = groupTallies.filter(
        (g) => g.vetoPercentage >= thresholds.fourGroups * 100
      );
      if (groupsExceedingFourThreshold.length >= 4) {
        vetoTriggered = true;
      }
      // Check if 3+ groups exceed 3-group threshold
      else if (
        groupTallies.filter(
          (g) => g.vetoPercentage >= thresholds.threeGroups * 100
        ).length >= 3
      ) {
        vetoTriggered = true;
      }
      // Check if 2+ groups exceed 2-group threshold
      else if (
        groupTallies.filter(
          (g) => g.vetoPercentage >= thresholds.twoGroups * 100
        ).length >= 2
      ) {
        vetoTriggered = true;
      }

      // Calculate overall participation rate
      const totalAgainstVotes = groupTallies.reduce(
        (sum, group) => sum + group.againstVotes,
        0
      );
      const totalEligible = Object.values(eligibleVoters).reduce(
        (sum, count) => sum + count,
        0
      );
      const participationRate =
        totalEligible > 0 ? (totalAgainstVotes / totalEligible) * 100 : 0;

      // Calculate required HybridMetrics properties
      const groupMetrics: {
        [key: string]: {
          participationRate: number;
          approvalRate: number;
          meetsMinimum: boolean;
        };
      } = {};
      const weightedApprovalRate = vetoTriggered ? 0 : 100;

      // Build group metrics from tallies
      for (const tally of groupTallies) {
        groupMetrics[tally.group] = {
          participationRate: tally.vetoPercentage,
          approvalRate: 100 - tally.vetoPercentage,
          meetsMinimum: true, // For optimistic proposals, minimum is always met
        };
      }

      return {
        quorumMet: true, // Always true for optimistic
        approvalMet: !vetoTriggered,
        participationRate,
        approvalRate: vetoTriggered ? 0 : 100,
        groupMetrics,
        weightedApprovalRate,
        groupTallies,
        vetoTriggered,
        thresholds,
      };
    } catch (error: any) {
      throw new ProposalCalculationError(
        proposal.getId(),
        "hybrid optimistic tiered metrics",
        error.message
      );
    }
  }

  getTypeDescription(): string {
    return "Hybrid optimistic proposal with tiered veto thresholds across stakeholder groups";
  }
}
