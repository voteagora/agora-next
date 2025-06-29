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

interface OptimisticMetrics extends ProposalMetrics {
  vetoThreshold: bigint;
  vetoProgress: number;
  isVetoed: boolean;
  statusVetoThreshold: bigint;
  isVetoedForStatus: boolean;
}

export class OptimisticProposalStrategy extends BaseProposalStrategy {
  private readonly METRICS_DISAPPROVAL_THRESHOLD = 12; // 12% for display
  private readonly STATUS_DISAPPROVAL_THRESHOLD = 50; // 50% for actual status

  parseData(rawData: any): StandardProposalData {
    try {
      // Optimistic proposals use same data structure as standard
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
          type: "STANDARD", // Uses standard data structure
          targets: [],
          values: [],
          signatures: [],
          calldatas: [],
        };
      }

      if (
        targets.length !== values.length ||
        targets.length !== signatures.length ||
        targets.length !== calldatas.length
      ) {
        throw new InvalidProposalDataError(
          "OPTIMISTIC",
          "Transaction array lengths do not match"
        );
      }

      return {
        type: "STANDARD", // Uses standard data structure
        targets: targets as `0x${string}`[],
        values,
        signatures,
        calldatas,
      };
    } catch (error: any) {
      if (error instanceof InvalidProposalDataError) {
        throw error;
      }
      throw new InvalidProposalDataError("OPTIMISTIC", error.message);
    }
  }

  calculateMetrics(proposal: Proposal): OptimisticMetrics {
    try {
      const results = proposal.getResults();
      const votableSupply = proposal.getVotableSupply();
      const context = proposal.getContext();

      // Get disapproval threshold from context or use default
      const metricsThreshold =
        context.disapprovalThreshold || this.METRICS_DISAPPROVAL_THRESHOLD;

      // Calculate veto threshold for metrics display (12%)
      const vetoThreshold = (votableSupply * BigInt(metricsThreshold)) / 100n;

      // Calculate status veto threshold (50%)
      const statusVetoThreshold =
        (votableSupply * BigInt(this.STATUS_DISAPPROVAL_THRESHOLD)) / 100n;

      // Only against votes count toward veto
      const vetoVotes = results.againstVotes;

      // Veto status for display (12% threshold)
      const isVetoed = vetoVotes >= vetoThreshold;

      // Veto status for actual proposal status (50% threshold)
      const isVetoedForStatus = vetoVotes >= statusVetoThreshold;

      // Calculate veto progress based on metrics threshold (for display)
      const vetoProgress = this.safeCalculatePercentage(
        vetoVotes,
        vetoThreshold,
        100n
      );

      // Participation rate (all against votes as percentage of supply)
      const participationRate = this.safeCalculatePercentage(
        vetoVotes,
        votableSupply
      );

      // For optimistic proposals:
      // - No quorum requirement
      // - Proposal passes unless vetoed (using status threshold)
      const quorumMet = true; // Always true for optimistic
      const approvalMet = !isVetoedForStatus; // Use 50% threshold for actual status

      return {
        quorumMet,
        approvalMet,
        participationRate,
        approvalRate: isVetoedForStatus ? 0 : 100, // Binary outcome
        vetoThreshold,
        vetoProgress,
        isVetoed, // For display (12% threshold)
        statusVetoThreshold,
        isVetoedForStatus, // For actual status (50% threshold)
      };
    } catch (error: any) {
      throw new ProposalCalculationError(
        proposal.getId(),
        "optimistic metrics",
        error.message
      );
    }
  }

  protected determineEndedStatus(metrics: OptimisticMetrics): ProposalStatus {
    // Use the status veto threshold (50%), not the display threshold (12%)
    return metrics.isVetoedForStatus
      ? ProposalStatus.DEFEATED
      : ProposalStatus.SUCCEEDED;
  }

  validateData(data: ProposalData): boolean {
    // Optimistic uses standard data structure
    if (data.type !== "STANDARD") {
      return false;
    }

    const standardData = data as StandardProposalData;

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

    // Optimistic proposals can have empty transaction arrays
    return true;
  }

  getTypeDescription(): string {
    return "Optimistic proposal that passes unless vetoed by sufficient against votes";
  }
}
