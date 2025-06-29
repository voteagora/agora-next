import { ProposalStrategy } from "./ProposalStrategy";
import {
  ProposalData,
  ProposalResults,
  ProposalMetrics,
  ProposalStatus,
} from "../types";
import { Proposal } from "../entities/Proposal";
import {
  InvalidProposalDataError,
  ProposalCalculationError,
} from "../errors/ProposalErrors";

interface HybridProposalData extends ProposalData {
  onchainData: ProposalData;
  offchainData: ProposalData;
  votingGroups: {
    delegates: VotingGroupData;
    apps: VotingGroupData;
    users: VotingGroupData;
    chains: VotingGroupData;
  };
}

interface VotingGroupData {
  forVotes: bigint;
  againstVotes: bigint;
  abstainVotes: bigint;
  totalEligible: bigint;
  weight: number;
  minimumVotes?: bigint;
}

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

export class HybridProposalStrategy implements ProposalStrategy {
  private readonly VOTING_WEIGHTS = {
    delegates: 0.5, // 50%
    apps: 1 / 6, // 16.67%
    users: 1 / 6, // 16.67%
    chains: 1 / 6, // 16.67%
  };

  private readonly MINIMUM_THRESHOLDS = {
    apps: 100n,
    users: 1000n,
    chains: 15n,
  };

  private readonly QUORUM_THRESHOLD = 30; // 30% participation required
  private readonly APPROVAL_THRESHOLD = 30; // 30% weighted approval required

  constructor(
    private onchainStrategy: ProposalStrategy,
    private offchainStrategy: ProposalStrategy,
    private baseType: "STANDARD" | "APPROVAL" | "OPTIMISTIC" = "STANDARD"
  ) {}

  parseData(rawData: any): HybridProposalData {
    try {
      if (!rawData.onchain || !rawData.offchain) {
        throw new InvalidProposalDataError(
          `HYBRID_${this.baseType}`,
          "Missing onchain or offchain data"
        );
      }

      const onchainData = this.onchainStrategy.parseData(rawData.onchain);
      const offchainData = this.offchainStrategy.parseData(rawData.offchain);

      // Parse voting groups
      const votingGroups = this.parseVotingGroups(rawData.votingGroups || {});

      return {
        type: `HYBRID_${this.baseType}` as any,
        onchainData,
        offchainData,
        votingGroups,
      };
    } catch (error: any) {
      if (error instanceof InvalidProposalDataError) {
        throw error;
      }
      throw new InvalidProposalDataError(
        `HYBRID_${this.baseType}`,
        error.message
      );
    }
  }

  parseResults(rawResults: any, proposalData?: any): ProposalResults {
    // Handle hybrid proposal results that combine onchain + offchain data

    // If we have structured hybrid data from API response
    if (
      rawResults.DELEGATES ||
      rawResults.APP ||
      rawResults.USER ||
      rawResults.CHAIN
    ) {
      return this.parseHybridApiResults(rawResults);
    }

    // If we have direct voting groups data
    if (
      rawResults.votingGroups ||
      (proposalData && proposalData.votingGroups)
    ) {
      const groups = rawResults.votingGroups || proposalData.votingGroups;
      let totalFor = 0n;
      let totalAgainst = 0n;
      let totalAbstain = 0n;

      for (const group of Object.values(groups) as any[]) {
        totalFor += BigInt(group.forVotes || 0);
        totalAgainst += BigInt(group.againstVotes || 0);
        totalAbstain += BigInt(group.abstainVotes || 0);
      }

      return {
        forVotes: totalFor,
        againstVotes: totalAgainst,
        abstainVotes: totalAbstain,
        totalVotes: totalFor + totalAgainst + totalAbstain,
      };
    }

    // Fallback to standard parsing
    return {
      forVotes: BigInt(rawResults.forVotes || rawResults.for_votes || 0),
      againstVotes: BigInt(
        rawResults.againstVotes || rawResults.against_votes || 0
      ),
      abstainVotes: BigInt(
        rawResults.abstainVotes || rawResults.abstain_votes || 0
      ),
      totalVotes: BigInt(rawResults.totalVotes || rawResults.total_votes || 0),
    };
  }

  /**
   * Parse hybrid API results that come from combined onchain/offchain data
   */
  private parseHybridApiResults(rawResults: any): ProposalResults {
    let totalFor = 0n;
    let totalAgainst = 0n;
    let totalAbstain = 0n;

    // Combine votes from all groups (DELEGATES, APP, USER, CHAIN)
    const groups = ["DELEGATES", "APP", "USER", "CHAIN"];

    for (const groupName of groups) {
      const group = rawResults[groupName];
      if (group) {
        totalFor += BigInt(group.for || group.forVotes || 0);
        totalAgainst += BigInt(group.against || group.againstVotes || 0);
        totalAbstain += BigInt(group.abstain || group.abstainVotes || 0);
      }
    }

    return {
      forVotes: totalFor,
      againstVotes: totalAgainst,
      abstainVotes: totalAbstain,
      totalVotes: totalFor + totalAgainst + totalAbstain,
    };
  }

  calculateMetrics(proposal: Proposal): HybridMetrics {
    try {
      const data = proposal.getData() as HybridProposalData;
      const context = proposal.getContext();
      const groupMetrics: HybridMetrics["groupMetrics"] = {};

      // Get delegate quorum from context
      const delegateQuorum = context.delegateQuorum || 100000n;

      // Calculate eligible voters exactly like existing system
      const eligibleVoters = {
        delegates: Number(delegateQuorum) * (100 / this.QUORUM_THRESHOLD), // Convert 30% quorum to total eligible
        apps: 100, // Fixed threshold
        users: 1000, // Fixed threshold
        chains: 15, // Fixed threshold
      };

      let weightedApprovalSum = 0;
      let totalWeight = 0;

      // Calculate tally for each group exactly like existing system
      for (const [groupName, groupData] of Object.entries(data.votingGroups)) {
        const forVotes = Number(groupData.forVotes);
        const againstVotes = Number(groupData.againstVotes);
        const abstainVotes = Number(groupData.abstainVotes);
        const totalVotes = forVotes + againstVotes;

        // Apply calculation options for quorum
        let quorumVotes = forVotes + abstainVotes; // Default
        if (context.calculationOptions === 1) {
          quorumVotes = forVotes; // Only FOR votes
        }

        const eligibleCount =
          eligibleVoters[groupName as keyof typeof eligibleVoters];
        const participationRate =
          eligibleCount > 0 ? (quorumVotes / eligibleCount) * 100 : 0;

        const approvalRate = totalVotes > 0 ? (forVotes / totalVotes) * 100 : 0;

        // Check minimum participation thresholds
        const minimumRequired =
          this.MINIMUM_THRESHOLDS[
            groupName as keyof typeof this.MINIMUM_THRESHOLDS
          ];
        const meetsMinimumVotes =
          !minimumRequired || BigInt(quorumVotes) >= minimumRequired;

        // Check quorum threshold (30%)
        const passingQuorum = participationRate >= this.QUORUM_THRESHOLD;
        const passingApproval = totalVotes > 0 ? approvalRate >= 50 : false; // 50% approval threshold

        const meetsMinimum = meetsMinimumVotes && passingQuorum;

        groupMetrics[groupName] = {
          participationRate,
          approvalRate,
          meetsMinimum,
        };

        // Add to weighted calculation if group qualifies
        if (meetsMinimum) {
          const weight =
            this.VOTING_WEIGHTS[groupName as keyof typeof this.VOTING_WEIGHTS];
          weightedApprovalSum += approvalRate * weight;
          totalWeight += weight;
        }
      }

      // Calculate final weighted approval rate
      const weightedApprovalRate =
        totalWeight > 0 ? weightedApprovalSum / totalWeight : 0;

      // Quorum requires at least 3 of 4 groups to participate
      const participatingGroups = Object.values(groupMetrics).filter(
        (m) => m.meetsMinimum
      ).length;
      const quorumMet = participatingGroups >= 3;

      // Approval threshold is 30% weighted
      const approvalMet = weightedApprovalRate >= this.APPROVAL_THRESHOLD;

      // Calculate overall participation rate
      const totalVotes = Object.values(data.votingGroups).reduce(
        (sum, group) => sum + group.forVotes + group.againstVotes,
        0n
      );
      const totalEligible = Object.values(eligibleVoters).reduce(
        (sum, count) => sum + count,
        0
      );
      const participationRate =
        totalEligible > 0 ? (Number(totalVotes) / totalEligible) * 100 : 0;

      return {
        quorumMet,
        approvalMet,
        participationRate,
        approvalRate: weightedApprovalRate,
        groupMetrics,
        weightedApprovalRate,
      };
    } catch (error: any) {
      throw new ProposalCalculationError(
        proposal.getId(),
        "hybrid metrics",
        error.message
      );
    }
  }

  determineStatus(proposal: Proposal): ProposalStatus {
    // Delegate to base strategy for status determination
    return this.onchainStrategy.determineStatus(proposal);
  }

  validateData(data: ProposalData): boolean {
    const hybridData = data as HybridProposalData;

    if (!hybridData.onchainData || !hybridData.offchainData) {
      return false;
    }

    if (!hybridData.votingGroups) {
      return false;
    }

    // Validate all required groups exist
    const requiredGroups = ["delegates", "apps", "users", "chains"];
    for (const group of requiredGroups) {
      if (
        !hybridData.votingGroups[group as keyof typeof hybridData.votingGroups]
      ) {
        return false;
      }
    }

    // Validate base data
    return (
      this.onchainStrategy.validateData(hybridData.onchainData) &&
      this.offchainStrategy.validateData(hybridData.offchainData)
    );
  }

  getTypeDescription(): string {
    return `Hybrid ${this.baseType.toLowerCase()} proposal with weighted voting across multiple stakeholder groups`;
  }

  private parseVotingGroups(
    rawGroups: any
  ): HybridProposalData["votingGroups"] {
    const defaultGroup = (): VotingGroupData => ({
      forVotes: 0n,
      againstVotes: 0n,
      abstainVotes: 0n,
      totalEligible: 0n,
      weight: 0,
    });

    return {
      delegates: this.parseVotingGroup(
        rawGroups.delegates,
        this.VOTING_WEIGHTS.delegates
      ),
      apps: this.parseVotingGroup(rawGroups.apps, this.VOTING_WEIGHTS.apps),
      users: this.parseVotingGroup(rawGroups.users, this.VOTING_WEIGHTS.users),
      chains: this.parseVotingGroup(
        rawGroups.chains,
        this.VOTING_WEIGHTS.chains
      ),
    };
  }

  private parseVotingGroup(rawGroup: any, weight: number): VotingGroupData {
    if (!rawGroup) {
      return {
        forVotes: 0n,
        againstVotes: 0n,
        abstainVotes: 0n,
        totalEligible: 0n,
        weight,
      };
    }

    return {
      forVotes: BigInt(rawGroup.forVotes || 0),
      againstVotes: BigInt(rawGroup.againstVotes || 0),
      abstainVotes: BigInt(rawGroup.abstainVotes || 0),
      totalEligible: BigInt(rawGroup.totalEligible || 0),
      weight,
    };
  }

  private checkQuorum(
    proposal: Proposal,
    groupMetrics: HybridMetrics["groupMetrics"]
  ): boolean {
    // For hybrid proposals, check if enough groups participated
    const participatingGroups = Object.values(groupMetrics).filter(
      (m) => m.meetsMinimum && m.participationRate > 0
    ).length;

    // Require at least 3 out of 4 groups to participate
    return participatingGroups >= 3;
  }

  private checkApproval(
    weightedRate: number,
    groupMetrics: HybridMetrics["groupMetrics"]
  ): boolean {
    // Standard approval: weighted rate >= 50%
    if (this.baseType === "STANDARD") {
      return weightedRate >= 50;
    }

    // Optimistic: check if NOT vetoed (inverse logic)
    if (this.baseType === "OPTIMISTIC") {
      return weightedRate >= 50; // Not vetoed if approval >= 50%
    }

    // Approval: at least one group approved
    return Object.values(groupMetrics).some(
      (m) => m.meetsMinimum && m.approvalRate > 0
    );
  }
}
