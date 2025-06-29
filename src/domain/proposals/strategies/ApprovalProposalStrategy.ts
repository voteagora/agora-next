import { BaseProposalStrategy } from "./BaseProposalStrategy";
import {
  ProposalData,
  ProposalMetrics,
  ProposalStatus,
  ApprovalProposalData,
  ApprovalOption,
  Transaction,
} from "../types";
import { Proposal } from "../entities/Proposal";
import {
  InvalidProposalDataError,
  ProposalCalculationError,
} from "../errors/ProposalErrors";

interface ApprovalMetrics extends ProposalMetrics {
  topOptions: string[];
  optionsMeetingCriteria: string[];
  budgetUtilization: number;
}

export class ApprovalProposalStrategy extends BaseProposalStrategy {
  parseData(rawData: any): ApprovalProposalData {
    try {
      if (!rawData.options || !Array.isArray(rawData.options)) {
        throw new InvalidProposalDataError(
          "APPROVAL",
          "Missing or invalid options array"
        );
      }

      const options: ApprovalOption[] = rawData.options.map(
        (opt: any, index: number) => {
          if (!opt.title) {
            throw new InvalidProposalDataError(
              "APPROVAL",
              `Option at index ${index} missing title`
            );
          }

          return {
            title: opt.title,
            transactions: this.parseTransactions(opt.transactions || []),
            votes: opt.votes ? BigInt(opt.votes) : 0n,
          };
        }
      );

      return {
        type: "APPROVAL",
        options,
        maxApprovals: Number(rawData.maxApprovals || 1),
        criteria:
          rawData.criteria === "TOP_CHOICES" ? "TOP_CHOICES" : "THRESHOLD",
        criteriaValue: Number(rawData.criteriaValue || 0),
        budgetToken: rawData.budgetToken,
        budgetAmount: rawData.budgetAmount
          ? BigInt(rawData.budgetAmount)
          : undefined,
      };
    } catch (error: any) {
      if (error instanceof InvalidProposalDataError) {
        throw error;
      }
      throw new InvalidProposalDataError("APPROVAL", error.message);
    }
  }

  calculateMetrics(proposal: Proposal): ApprovalMetrics {
    try {
      const data = proposal.getData() as ApprovalProposalData;
      const results = proposal.getResults();
      const votableSupply = proposal.getVotableSupply();

      // Calculate total votes across all options
      const totalVotes = data.options.reduce(
        (sum, option) => sum + (option.votes || 0n),
        0n
      );

      // Sort options by votes
      const sortedOptions = [...data.options].sort((a, b) =>
        Number((b.votes || 0n) - (a.votes || 0n))
      );

      // Determine top options based on criteria
      let topOptions: string[] = [];
      let optionsMeetingCriteria: string[] = [];

      if (data.criteria === "TOP_CHOICES") {
        topOptions = sortedOptions
          .slice(0, data.criteriaValue)
          .map((opt) => opt.title);
        optionsMeetingCriteria = topOptions;
      } else {
        // THRESHOLD criteria
        const threshold = BigInt(data.criteriaValue);
        optionsMeetingCriteria = sortedOptions
          .filter((opt) => {
            const percentage =
              totalVotes > 0n ? ((opt.votes || 0n) * 100n) / totalVotes : 0n;
            return percentage >= threshold;
          })
          .map((opt) => opt.title);
        topOptions = optionsMeetingCriteria;
      }

      // Calculate budget utilization
      const selectedOptions = topOptions
        .map((title) => data.options.find((opt) => opt.title === title)!)
        .filter(Boolean);

      const budgetUtilization = this.calculateBudgetUtilization(
        proposal,
        selectedOptions,
        data.budgetAmount
      );

      // Basic metrics
      const participationRate =
        votableSupply > 0n
          ? Number((totalVotes * 10000n) / votableSupply) / 100
          : 0;

      const quorumMet = totalVotes >= proposal.getQuorumVotes();
      const approvalMet = optionsMeetingCriteria.length > 0;

      return {
        quorumMet,
        approvalMet,
        participationRate,
        approvalRate: 0, // Not applicable for approval voting
        topOptions,
        optionsMeetingCriteria,
        budgetUtilization,
      };
    } catch (error: any) {
      throw new ProposalCalculationError(
        proposal.getId(),
        "approval metrics",
        error.message
      );
    }
  }

  protected determineEndedStatus(
    metrics: ApprovalMetrics,
    proposal?: Proposal
  ): ProposalStatus {
    return metrics.quorumMet && metrics.approvalMet
      ? ProposalStatus.SUCCEEDED
      : ProposalStatus.DEFEATED;
  }

  private calculateBudgetUtilization(
    proposal: Proposal,
    selectedOptions: ApprovalOption[],
    budgetAmount?: bigint
  ): number {
    if (!budgetAmount || budgetAmount === 0n) return 0;

    const context = proposal.getContext();
    const createdAt = proposal.getTimeline().createdBlock;

    // Check if proposal was created before budget change (if applicable)
    const budgetChangeDate = context.budgetChangeDate;
    const useOldBudgetLogic = budgetChangeDate && createdAt < budgetChangeDate;

    if (useOldBudgetLogic) {
      // Use old budget calculation logic if needed
      return this.calculateOldBudgetUtilization(selectedOptions);
    }

    // Calculate budget used by selected options
    const budgetUsed = selectedOptions.reduce((sum, option) => {
      const transfers = option.transactions.filter(
        (tx) => tx.type === "TRANSFER"
      );
      const optionBudget = transfers.reduce(
        (txSum, tx) => txSum + (tx.amount || 0n),
        0n
      );
      return sum + optionBudget;
    }, 0n);

    return this.safeCalculatePercentage(budgetUsed, budgetAmount);
  }

  private calculateOldBudgetUtilization(
    selectedOptions: ApprovalOption[]
  ): number {
    // Implement old budget calculation logic if needed
    // For now, use the same calculation
    return 0;
  }

  validateData(data: ProposalData): boolean {
    if (data.type !== "APPROVAL") {
      return false;
    }

    const approvalData = data as ApprovalProposalData;

    // Validate options
    if (
      !Array.isArray(approvalData.options) ||
      approvalData.options.length === 0
    ) {
      return false;
    }

    // Validate each option
    for (const option of approvalData.options) {
      if (!option.title || option.title.trim() === "") {
        return false;
      }
      if (!Array.isArray(option.transactions)) {
        return false;
      }
    }

    // Validate settings
    if (approvalData.maxApprovals < 1) {
      return false;
    }

    if (
      approvalData.criteria === "TOP_CHOICES" &&
      approvalData.criteriaValue < 1
    ) {
      return false;
    }

    if (
      approvalData.criteria === "THRESHOLD" &&
      (approvalData.criteriaValue < 0 || approvalData.criteriaValue > 100)
    ) {
      return false;
    }

    return true;
  }

  getTypeDescription(): string {
    return "Approval voting proposal for selecting multiple options with budget allocation";
  }

  private parseTransactions(rawTransactions: any[]): Transaction[] {
    if (!Array.isArray(rawTransactions)) {
      return [];
    }

    return rawTransactions.map((tx, index) => {
      if (!tx.target) {
        throw new InvalidProposalDataError(
          "APPROVAL",
          `Transaction at index ${index} missing target`
        );
      }

      return {
        type: tx.type === "TRANSFER" ? "TRANSFER" : "CUSTOM",
        target: tx.target,
        value: tx.value ? BigInt(tx.value) : 0n,
        calldata: tx.calldata || "0x",
        signature: tx.signature,
        token: tx.token,
        recipient: tx.recipient,
        amount: tx.amount ? BigInt(tx.amount) : undefined,
      };
    });
  }
}
