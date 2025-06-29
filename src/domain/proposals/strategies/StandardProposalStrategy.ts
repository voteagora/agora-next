import { BaseProposalStrategy } from "./BaseProposalStrategy";
import {
  ProposalData,
  ProposalMetrics,
  ProposalStatus,
  StandardProposalData,
} from "../types";
import { Proposal } from "../entities/Proposal";
import {
  InvalidProposalDataError,
  ProposalCalculationError,
} from "../errors/ProposalErrors";

export class StandardProposalStrategy extends BaseProposalStrategy {
  parseData(rawData: any): StandardProposalData {
    try {
      // Handle missing or empty transaction fields gracefully
      const targets = rawData.targets
        ? this.parseArray(rawData.targets, "targets")
        : [];
      const values = rawData.values
        ? this.parseBigIntArray(rawData.values, "values")
        : [];
      const signatures = rawData.signatures
        ? this.parseArray(rawData.signatures, "signatures")
        : [];
      const calldatas = rawData.calldatas
        ? this.parseArray(rawData.calldatas, "calldatas")
        : [];

      // If all arrays are empty, create a default empty transaction
      if (
        targets.length === 0 &&
        values.length === 0 &&
        signatures.length === 0 &&
        calldatas.length === 0
      ) {
        return {
          type: "STANDARD",
          targets: [],
          values: [],
          signatures: [],
          calldatas: [],
        };
      }

      // Validate array lengths match
      if (
        targets.length !== values.length ||
        targets.length !== signatures.length ||
        targets.length !== calldatas.length
      ) {
        throw new InvalidProposalDataError(
          "STANDARD",
          "Transaction array lengths do not match"
        );
      }

      return {
        type: "STANDARD",
        targets: targets as `0x${string}`[],
        values,
        signatures,
        calldatas,
      };
    } catch (error: any) {
      if (error instanceof InvalidProposalDataError) {
        throw error;
      }
      throw new InvalidProposalDataError("STANDARD", error.message);
    }
  }

  calculateMetrics(proposal: Proposal): ProposalMetrics {
    try {
      const results = proposal.getResults();
      const quorumVotes = proposal.getQuorumVotes();
      const approvalThreshold = proposal.getApprovalThreshold();
      const votableSupply = proposal.getVotableSupply();

      // Use tenant-specific participation calculation
      const participationVotes = this.calculateParticipationVotes(proposal);
      const quorumMet = participationVotes >= quorumVotes;

      // Calculate approval rate (always excludes abstain)
      const totalOpinionVotes = results.forVotes + results.againstVotes;
      const approvalRate = this.safeCalculatePercentage(
        results.forVotes,
        totalOpinionVotes
      );

      // Approval met if FOR > AGAINST (simple majority logic from existing system)
      const approvalMet = results.forVotes > results.againstVotes;

      // Calculate participation rate using tenant-specific participation votes
      const participationRate = this.safeCalculatePercentage(
        participationVotes,
        votableSupply
      );

      return {
        quorumMet,
        approvalMet,
        participationRate,
        approvalRate,
      };
    } catch (error: any) {
      throw new ProposalCalculationError(
        proposal.getId(),
        "metrics",
        error.message
      );
    }
  }

  protected determineEndedStatus(
    metrics: ProposalMetrics,
    proposal?: Proposal
  ): ProposalStatus {
    // Use existing system logic: check quorum first, then approval
    if (!metrics.quorumMet) {
      return ProposalStatus.DEFEATED;
    }

    if (metrics.approvalMet) {
      return ProposalStatus.SUCCEEDED;
    }

    return ProposalStatus.DEFEATED;
  }

  validateData(data: ProposalData): boolean {
    if (data.type !== "STANDARD") {
      return false;
    }

    const standardData = data as StandardProposalData;

    // Validate arrays exist and have same length
    if (
      !Array.isArray(standardData.targets) ||
      !Array.isArray(standardData.values) ||
      !Array.isArray(standardData.signatures) ||
      !Array.isArray(standardData.calldatas)
    ) {
      return false;
    }

    const length = standardData.targets.length;
    if (
      standardData.values.length !== length ||
      standardData.signatures.length !== length ||
      standardData.calldatas.length !== length
    ) {
      return false;
    }

    // Standard proposals must have at least one transaction
    // But some proposals (like offchain) may have empty arrays
    // Allow empty arrays for now to support various proposal types
    return true;
  }

  getTypeDescription(): string {
    return "Standard on-chain proposal with simple FOR/AGAINST/ABSTAIN voting";
  }
}
