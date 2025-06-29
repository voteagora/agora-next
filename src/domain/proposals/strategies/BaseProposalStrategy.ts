import { ProposalStrategy } from "./ProposalStrategy";
import { ProposalResults, ProposalStatus } from "../types";
import { Proposal } from "../entities/Proposal";
import { TenantNamespace } from "@/lib/types";

export abstract class BaseProposalStrategy implements ProposalStrategy {
  abstract parseData(rawData: any): any;
  abstract calculateMetrics(proposal: Proposal): any;
  abstract validateData(data: any): boolean;
  abstract getTypeDescription(): string;

  parseResults(rawResults: any, proposalData?: any): ProposalResults {
    // For hybrid proposals, delegate to specific hybrid parsing logic
    if (proposalData && this.isHybridProposalData(proposalData)) {
      return this.parseHybridResults(rawResults, proposalData);
    }

    // Standard ordering
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

  determineStatus(proposal: Proposal): ProposalStatus {
    const currentBlock = BigInt(Date.now()); // TODO: Get from blockchain
    const timeline = proposal.getTimeline();

    // Common status determination logic
    if (proposal.isCancelled()) {
      return ProposalStatus.CANCELLED;
    }

    if (proposal.isExecuted()) {
      return ProposalStatus.EXECUTED;
    }

    if (proposal.isQueued()) {
      return ProposalStatus.QUEUED;
    }

    if (proposal.isActive(currentBlock)) {
      return ProposalStatus.ACTIVE;
    }

    if (currentBlock < timeline.startBlock) {
      return ProposalStatus.PENDING;
    }

    if (proposal.hasEnded(currentBlock)) {
      const metrics = this.calculateMetrics(proposal);
      return this.determineEndedStatus(metrics, proposal);
    }

    return ProposalStatus.PENDING;
  }

  protected abstract determineEndedStatus(
    metrics: any,
    proposal?: Proposal
  ): ProposalStatus;

  protected parseArray(value: any, fieldName: string): string[] {
    if (Array.isArray(value)) {
      return value.map((v) => String(v));
    }

    if (typeof value === "string") {
      if (value.includes(",")) {
        return value
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v);
      }
      return value.trim() ? [value.trim()] : [];
    }

    throw new Error(`Invalid ${fieldName} format`);
  }

  protected parseBigIntArray(value: any, fieldName: string): bigint[] {
    return this.parseArray(value, fieldName).map((v) => BigInt(v));
  }

  // Tenant-specific quorum calculation
  protected calculateParticipationVotes(proposal: Proposal): bigint {
    const results = proposal.getResults();
    const context = proposal.getContext();

    switch (context.tenant) {
      case "uniswap":
        // Only FOR votes count for quorum
        return results.forVotes;

      case "scroll":
        // All votes count for quorum
        return results.forVotes + results.againstVotes + results.abstainVotes;

      case "optimism":
        if (context.calculationOptions === 1) {
          return results.forVotes; // Only FOR votes
        } else {
          return results.forVotes + results.abstainVotes; // FOR + ABSTAIN (default)
        }

      default:
        // DEFAULT: FOR + ABSTAIN
        return results.forVotes + results.abstainVotes;
    }
  }

  // Safe division with overflow protection
  protected safeCalculatePercentage(
    numerator: bigint,
    denominator: bigint,
    scale = 10000n
  ): number {
    if (denominator === 0n) return 0;

    try {
      const result = (numerator * scale) / denominator;
      return Number(result) / Number(scale / 100n);
    } catch (error) {
      // Handle overflow gracefully
      console.warn("Calculation overflow detected, using safe calculation");
      return 0;
    }
  }

  // Helper methods for hybrid proposal handling
  protected isHybridProposalData(proposalData: any): boolean {
    return (
      proposalData &&
      (proposalData.onchainData ||
        proposalData.offchainData ||
        proposalData.votingGroups ||
        // Check for offchain proposal link
        proposalData.onchain_proposalid)
    );
  }

  protected parseHybridResults(
    rawResults: any,
    proposalData: any
  ): ProposalResults {
    // Default hybrid parsing - combines onchain delegate votes with offchain voting
    // This can be overridden by specific hybrid strategies

    if (proposalData.votingGroups) {
      // Direct hybrid data structure
      const delegates = proposalData.votingGroups.delegates || {};
      return {
        forVotes: BigInt(delegates.forVotes || 0),
        againstVotes: BigInt(delegates.againstVotes || 0),
        abstainVotes: BigInt(delegates.abstainVotes || 0),
        totalVotes:
          BigInt(delegates.forVotes || 0) +
          BigInt(delegates.againstVotes || 0) +
          BigInt(delegates.abstainVotes || 0),
      };
    }

    // For linked offchain proposals, extract onchain delegate results
    if (rawResults.DELEGATES) {
      return {
        forVotes: BigInt(rawResults.DELEGATES.for || 0),
        againstVotes: BigInt(rawResults.DELEGATES.against || 0),
        abstainVotes: BigInt(rawResults.DELEGATES.abstain || 0),
        totalVotes:
          BigInt(rawResults.DELEGATES.for || 0) +
          BigInt(rawResults.DELEGATES.against || 0) +
          BigInt(rawResults.DELEGATES.abstain || 0),
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
}
