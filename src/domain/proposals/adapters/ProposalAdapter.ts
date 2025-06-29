import { ProposalFactory } from "../factories/ProposalFactory";
import { ProposalTypeRegistry } from "../factories/ProposalTypeRegistry";
import { ProposalStrategyInitializer } from "../services/ProposalStrategyInitializer";
import { Proposal } from "../entities/Proposal";
import { ProposalType } from "../types";
import { TenantNamespace } from "@/lib/types";

/**
 * Adapter to bridge between the old proposal system and the new domain model
 * This allows gradual migration of existing code
 */
export class ProposalAdapter {
  private static initialized = false;
  private static factory: ProposalFactory;

  static initialize(): void {
    if (!this.initialized) {
      ProposalStrategyInitializer.initialize();
      this.factory = new ProposalFactory(ProposalTypeRegistry.getInstance());
      this.initialized = true;
    }
  }

  /**
   * Convert raw database proposal to domain model
   */
  static toDomainModel(
    rawProposal: any,
    votableSupply: bigint,
    context?: {
      tenant: TenantNamespace;
      calculationOptions?: number;
      delegateQuorum?: bigint;
      v6UpgradeBlock?: number;
      disapprovalThreshold?: number;
      budgetChangeDate?: bigint;
    },
    offchainProposal?: any
  ): Proposal {
    this.initialize();

    // Handle hybrid proposal type mapping
    let proposalType = rawProposal.proposal_type as ProposalType;

    // Extract and parse proposal data from JSON field
    let proposalData = this.parseRawProposalData(rawProposal);
    let proposalResults = rawProposal.proposal_results || {};

    // If we have offchain data, this becomes a hybrid proposal
    if (offchainProposal) {
      proposalType = this.mapToHybridType(proposalType);
      proposalData = this.combineHybridData(proposalData, offchainProposal);
      proposalResults = this.combineHybridResults(
        proposalResults,
        offchainProposal
      );
    }

    const payload = {
      id: rawProposal.proposal_id || rawProposal.id,
      proposalNumber: rawProposal.ordinal?.toString(),
      type: proposalType,
      title: this.extractTitle(rawProposal.description),
      description: rawProposal.description || "",
      proposer: rawProposal.proposer,
      data: proposalData,
      results: proposalResults,
      timeline: {
        createdBlock: rawProposal.created_block,
        startBlock: rawProposal.start_block,
        endBlock: rawProposal.end_block,
        queuedBlock: rawProposal.queued_block,
        executedBlock: rawProposal.executed_block,
        cancelledBlock: rawProposal.cancelled_block,
      },
      quorumVotes:
        rawProposal.quorum_votes || this.calculateDefaultQuorum(votableSupply),
      approvalThreshold: rawProposal.approval_threshold || "5000", // 50%
      votableSupply,
      context: context || {
        tenant: "optimism" as TenantNamespace, // Default tenant
        calculationOptions: rawProposal.calculation_options || 0,
        delegateQuorum: undefined,
        v6UpgradeBlock: undefined,
        disapprovalThreshold: undefined,
        budgetChangeDate: undefined,
        rawData: rawProposal,
      },
    };

    return this.factory.createProposal(payload);
  }

  /**
   * Convert domain model to API response format matching parseProposal output
   */
  static toApiResponse(proposal: Proposal): any {
    const status = proposal.getStatus();
    const data = proposal.getData();
    const results = proposal.getResults();
    const timeline = proposal.getTimeline();
    const context = proposal.getContext();

    // Format the proposal data to match the expected structure
    const proposalData = this.formatProposalDataForApi(data, proposal.getType());
    const proposalResults = this.formatProposalResultsForApi(
      results,
      proposal.getType()
    );

    return {
      // Core fields
      id: proposal.getId(),
      proposer: proposal.getProposer(),
      proposalType: proposal.getType(),
      
      // Description fields
      markdowntitle: proposal.getTitle(),
      description: proposal.getDescription(),
      
      // Timeline fields - convert to numbers/nulls as expected
      snapshotBlockNumber: Number(timeline.createdBlock),
      createdTime: null, // Would need latestBlock to calculate
      startTime: null, // Would need latestBlock to calculate
      startBlock: timeline.startBlock.toString(),
      endTime: null, // Would need latestBlock to calculate
      endBlock: timeline.endBlock.toString(),
      cancelledTime: null, // Would need latestBlock to calculate
      executedTime: null, // Would need latestBlock to calculate
      executedBlock: timeline.executedBlock?.toString() || null,
      queuedTime: null, // Would need latestBlock to calculate
      
      // Voting thresholds
      quorum: proposal.getQuorumVotes().toString(),
      approvalThreshold: proposal.getApprovalThreshold().toString(),
      
      // Proposal data and results in expected format
      proposalData: proposalData,
      unformattedProposalData: null, // Raw data if needed
      proposalResults: proposalResults,
      
      // Status
      status,
      
      // Transaction hashes
      createdTransactionHash: null,
      cancelledTransactionHash: null,
      executedTransactionHash: null,
      
      // Offchain proposal link
      offchainProposalId: context.rawData?.offchainProposalId || null,
    };
  }

  /**
   * Batch convert proposals
   */
  static toDomainModels(
    rawProposals: any[],
    votableSupply: bigint
  ): Proposal[] {
    return rawProposals.map((raw) => this.toDomainModel(raw, votableSupply));
  }

  /**
   * Batch convert to API responses
   */
  static toApiResponses(proposals: Proposal[]): any[] {
    return proposals.map((p) => this.toApiResponse(p));
  }

  /**
   * Get proposal type configuration
   */
  static getTypeConfig(type: ProposalType) {
    this.initialize();
    return ProposalTypeRegistry.getInstance().getConfig(type);
  }

  /**
   * Check if a proposal type is supported
   */
  static isTypeSupported(type: string): boolean {
    this.initialize();
    return ProposalTypeRegistry.getInstance().hasType(type);
  }

  private static extractTitle(description: string | null): string {
    if (!description) return "Untitled Proposal";

    const lines = description.split("\n");
    const firstLine = lines[0] || "";
    const title = firstLine.replace(/^#+\s*/, "").trim();

    return title.length > 100 ? title.substring(0, 97) + "..." : title;
  }

  private static calculateDefaultQuorum(votableSupply: bigint): bigint {
    // Default 4% quorum
    return (votableSupply * 4n) / 100n;
  }

  /**
   * Parse raw proposal data from database JSON field and transform to domain format
   */
  private static parseRawProposalData(rawProposal: any): any {
    try {
      const proposalData = rawProposal.proposal_data || {};
      const proposalType = rawProposal.proposal_type as string;

      // Parse the JSON data
      let parsedData: any;
      if (typeof proposalData === "object" && proposalData !== null) {
        parsedData = proposalData;
      } else if (typeof proposalData === "string") {
        parsedData = JSON.parse(proposalData);
      } else {
        console.warn(
          "[ProposalAdapter] Proposal data is neither object nor string:",
          typeof proposalData
        );
        return {};
      }

      // Transform based on proposal type to match domain strategy expectations
      return this.transformProposalDataForDomain(
        parsedData,
        proposalType,
        rawProposal
      );
    } catch (error) {
      console.warn(
        "[ProposalAdapter] Failed to parse proposal_data:",
        error,
        "Raw data:",
        rawProposal.proposal_data
      );
      return {};
    }
  }

  /**
   * Transform database proposal data format to domain-expected format
   */
  private static transformProposalDataForDomain(
    parsedData: any,
    proposalType: string,
    rawProposal: any
  ): any {
    switch (proposalType) {
      case "STANDARD":
      case "OFFCHAIN_STANDARD":
      case "HYBRID_STANDARD":
      case "SNAPSHOT":
        return this.transformStandardProposalData(parsedData);

      case "APPROVAL":
      case "OFFCHAIN_APPROVAL":
      case "HYBRID_APPROVAL":
        return this.transformApprovalProposalData(parsedData);

      case "OPTIMISTIC":
      case "OFFCHAIN_OPTIMISTIC":
      case "OFFCHAIN_OPTIMISTIC_TIERED":
      case "HYBRID_OPTIMISTIC":
      case "HYBRID_OPTIMISTIC_TIERED":
        return this.transformOptimisticProposalData(parsedData);

      default:
        console.debug(
          "[ProposalAdapter] Unknown proposal type, returning raw data:",
          proposalType
        );
        return parsedData;
    }
  }

  /**
   * Transform STANDARD proposal data: {targets, values, signatures, calldatas}
   */
  private static transformStandardProposalData(parsedData: any): any {
    // Standard proposals can be in object format already
    if (
      parsedData.targets &&
      parsedData.values &&
      parsedData.signatures &&
      parsedData.calldatas
    ) {
      return {
        targets: this.ensureArray(parsedData.targets),
        values: this.ensureArray(parsedData.values),
        signatures: this.ensureArray(parsedData.signatures),
        calldatas: this.ensureArray(parsedData.calldatas),
      };
    }

    // Handle empty or missing data
    return {
      targets: [],
      values: [],
      signatures: [],
      calldatas: [],
    };
  }

  /**
   * Transform APPROVAL proposal data: nested array format to domain format
   */
  private static transformApprovalProposalData(parsedData: any): any {
    try {
      // Database format: [options_array, settings_array]
      if (Array.isArray(parsedData) && parsedData.length >= 2) {
        const optionsArray = parsedData[0] || [];
        const settingsArray = parsedData[1] || [];

        // Validate optionsArray is actually an array
        if (!Array.isArray(optionsArray)) {
          console.warn(
            "[ProposalAdapter] Options array is not an array:",
            typeof optionsArray
          );
          return {
            options: [],
            maxApprovals: 1,
            criteria: "THRESHOLD",
            criteriaValue: 0,
            budgetToken: "",
            budgetAmount: 0,
          };
        }

        // Transform options from nested arrays to objects
        const options = optionsArray.map((option: any[], index: number) => {
          if (!Array.isArray(option) || option.length < 4) {
            console.warn(
              `[ProposalAdapter] Option at index ${index} has invalid format:`,
              option
            );
            return {
              title: `Option ${index + 1}`,
              transactions: [],
              votes: 0,
            };
          }

          // Handle both 4-element and 5-element formats
          const [budgetTokensSpent, targets, values, calldatas, description] =
            option.length === 4
              ? [null, option[0], option[1], option[2], option[3]]
              : [option[0], option[1], option[2], option[3], option[4]];

          // Transform targets, values, and calldatas into individual transactions
          const targetsArray = this.ensureArray(targets);
          const valuesArray = this.ensureArray(values);
          const calldatasArray = this.ensureArray(calldatas);

          // Create transaction objects for each target
          const transactions = targetsArray.map((target, txIndex) => ({
            type: "CUSTOM" as const,
            target: target as `0x${string}`,
            value: BigInt(valuesArray[txIndex] || "0"),
            calldata: calldatasArray[txIndex] || "0x",
            signature: "", // Usually empty for approval proposals
          }));

          return {
            title: description || `Option ${index + 1}`,
            transactions: transactions.length > 0 ? transactions : [],
            votes: 0, // Will be filled from results
            budgetTokensSpent: budgetTokensSpent
              ? Number(budgetTokensSpent)
              : 0,
          };
        });

        // Parse settings
        const [
          maxApprovals,
          criteria,
          budgetToken,
          criteriaValue,
          budgetAmount,
        ] = settingsArray;

        return {
          options,
          maxApprovals: Number(maxApprovals || 1),
          criteria: Number(criteria) === 1 ? "TOP_CHOICES" : "THRESHOLD",
          criteriaValue: Number(criteriaValue || 0),
          budgetToken: budgetToken || "",
          budgetAmount: budgetAmount ? Number(budgetAmount) : 0,
        };
      }

      // Check if it's already in the expected domain format
      if (parsedData.options && Array.isArray(parsedData.options)) {
        console.log(
          "[ProposalAdapter] Approval data already in domain format"
        );
        return parsedData;
      }

      // Log the unexpected format for debugging
      console.warn(
        "[ProposalAdapter] Unexpected approval data format:",
        JSON.stringify(parsedData).substring(0, 200)
      );

      // Fallback for unexpected format
      return {
        options: [],
        maxApprovals: 1,
        criteria: "THRESHOLD",
        criteriaValue: 0,
        budgetToken: "",
        budgetAmount: 0,
      };
    } catch (error) {
      console.warn(
        "[ProposalAdapter] Failed to transform approval data:",
        error,
        "Raw data:",
        JSON.stringify(parsedData).substring(0, 200)
      );
      return {
        options: [],
        maxApprovals: 1,
        criteria: "THRESHOLD",
        criteriaValue: 0,
        budgetToken: "",
        budgetAmount: 0,
      };
    }
  }

  /**
   * Transform OPTIMISTIC proposal data: usually empty transactions
   */
  private static transformOptimisticProposalData(parsedData: any): any {
    // Optimistic proposals typically have empty or minimal transaction data
    return {
      targets: this.ensureArray(parsedData.targets) || [],
      values: this.ensureArray(parsedData.values) || [],
      signatures: this.ensureArray(parsedData.signatures) || [],
      calldatas: this.ensureArray(parsedData.calldatas) || [],
    };
  }

  /**
   * Ensure value is an array, handling comma-separated strings
   */
  private static ensureArray(value: any): any[] {
    if (Array.isArray(value)) {
      return value;
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
    return [];
  }

  /**
   * Map onchain proposal type to hybrid equivalent when offchain data is present
   */
  private static mapToHybridType(onchainType: ProposalType): ProposalType {
    switch (onchainType) {
      case "STANDARD":
        return "HYBRID_STANDARD";
      case "APPROVAL":
        return "HYBRID_APPROVAL";
      case "OPTIMISTIC":
        return "HYBRID_OPTIMISTIC";
      default:
        // If it's already a hybrid type or unknown, keep as-is
        return onchainType;
    }
  }

  /**
   * Combine onchain proposal data with offchain proposal data
   */
  private static combineHybridData(
    onchainData: any,
    offchainProposal: any
  ): any {
    const offchainData = offchainProposal.proposal_data || {};

    return {
      // Include original onchain data
      onchainData: onchainData,

      // Include offchain data
      offchainData: offchainData,

      // Link to offchain proposal
      offchainProposalId: offchainProposal.proposal_id,
      onchain_proposalid: offchainData.onchain_proposalid,

      // Preserve all onchain fields for compatibility
      ...onchainData,

      // Add offchain-specific fields
      votingGroups: {
        delegates: {
          // Delegate votes come from onchain data
          source: "onchain",
        },
        apps: offchainData.apps || {},
        users: offchainData.users || {},
        chains: offchainData.chains || {},
      },
    };
  }

  /**
   * Combine onchain results with offchain results for hybrid voting
   */
  private static combineHybridResults(
    onchainResults: any,
    offchainProposal: any
  ): any {
    const offchainResults = offchainProposal.proposal_results || {};

    // Parse onchain results (delegate votes)
    let delegateResults = {};
    if (onchainResults) {
      try {
        const parsed =
          typeof onchainResults === "string"
            ? JSON.parse(onchainResults)
            : onchainResults;
        if (parsed.standard) {
          delegateResults = {
            for: parsed.standard[1] || 0,
            against: parsed.standard[0] || 0,
            abstain: parsed.standard[2] || 0,
          };
        }
      } catch (error) {
        console.warn("Failed to parse onchain results:", error);
      }
    }

    // Combine with offchain results
    return {
      // Original onchain results
      onchain: onchainResults,

      // Structured hybrid results
      DELEGATES: delegateResults,
      APP: offchainResults.APP || {},
      USER: offchainResults.USER || {},
      CHAIN: offchainResults.CHAIN || {},

      // Preserve compatibility with existing structure
      ...onchainResults,

      // Add offchain data
      offchain: offchainResults,
    };
  }

  /**
   * Format proposal data for API response to match parseProposal output
   */
  private static formatProposalDataForApi(
    data: any,
    proposalType: ProposalType
  ): any {
    switch (proposalType) {
      case "STANDARD":
      case "OFFCHAIN_STANDARD":
      case "OPTIMISTIC":
      case "OFFCHAIN_OPTIMISTIC":
      case "OFFCHAIN_OPTIMISTIC_TIERED":
        // Standard format with options array
        return {
          options: [
            {
              description: "Transaction Batch",
              targets: data.targets || [],
              values: (data.values || []).map((v: bigint) => v.toString()),
              signatures: data.signatures || [],
              calldatas: data.calldatas || [],
            },
          ],
        };

      case "APPROVAL":
        // Approval format with multiple options and proposalSettings
        return {
          options: (data.options || []).map((option: any) => ({
            description: option.title,
            targets:
              option.transactions?.flatMap((tx: any) => [tx.target]) || [],
            values:
              option.transactions?.flatMap((tx: any) => [
                tx.value?.toString() || "0",
              ]) || [],
            signatures: option.transactions?.flatMap(() => [""]) || [],
            calldatas:
              option.transactions?.flatMap((tx: any) => [tx.calldata]) || [],
            budgetTokensSpent: option.budgetTokensSpent || null,
            functionArgsName: [], // Add if needed for UI compatibility
          })),
          proposalSettings: {
            maxApprovals: data.maxApprovals || 1,
            criteria: data.criteria || "THRESHOLD",
            budgetToken: data.budgetToken || "",
            criteriaValue: BigInt(data.criteriaValue || 0),
            budgetAmount: BigInt(data.budgetAmount || 0),
          },
        };

      case "OFFCHAIN_APPROVAL":
        // OFFCHAIN_APPROVAL has a different structure with choices
        return {
          options: [],
          choices: (data.options || []).map((option: any) => option.title),
          onchainProposalId: data.onchainProposalId,
          created_attestation_hash: data.created_attestation_hash,
          cancelled_attestation_hash: data.cancelled_attestation_hash,
        };

      case "HYBRID_STANDARD":
      case "HYBRID_OPTIMISTIC":
      case "HYBRID_OPTIMISTIC_TIERED":
        // For hybrid, use the onchain data structure
        const baseData = data.onchainData || data;
        return this.formatProposalDataForApi(
          baseData,
          proposalType.replace("HYBRID_", "") as ProposalType
        );

      case "HYBRID_APPROVAL":
        // For hybrid approval, use the same format as APPROVAL
        const hybridData = data.onchainData || data;
        return this.formatProposalDataForApi(hybridData, "APPROVAL");

      default:
        // Return raw data for unknown types
        return data;
    }
  }

  /**
   * Format proposal results for API response to match parseProposal output
   * This should match the output of parseProposalResults().kind
   */
  private static formatProposalResultsForApi(
    results: any,
    proposalType: ProposalType
  ): any {
    switch (proposalType) {
      case "STANDARD":
      case "OFFCHAIN_STANDARD":
      case "OPTIMISTIC":
      case "OFFCHAIN_OPTIMISTIC":
      case "OFFCHAIN_OPTIMISTIC_TIERED":
        // Match parseProposalResults().kind for STANDARD proposals
        return {
          for: results.forVotes || 0n,
          against: results.againstVotes || 0n,
          abstain: results.abstainVotes || 0n,
        };

      case "APPROVAL":
      case "OFFCHAIN_APPROVAL":
        // Match parseProposalResults().kind for APPROVAL proposals
        return {
          for: results.forVotes || 0n,
          against: results.againstVotes || 0n,
          abstain: results.abstainVotes || 0n,
          options: (results.optionVotes || []).map((option: any) => ({
            option: option.title,
            votes: option.votes || 0n,
          })),
          criteria: results.criteria || "THRESHOLD",
          criteriaValue: BigInt(results.criteriaValue || 0),
        };

      case "HYBRID_STANDARD":
      case "HYBRID_APPROVAL":
      case "HYBRID_OPTIMISTIC":
      case "HYBRID_OPTIMISTIC_TIERED":
        // Match parseProposalResults().kind for HYBRID proposals
        return {
          DELEGATES: results.DELEGATES || {
            for: 0n,
            against: 0n,
            abstain: 0n,
          },
          APP: results.APP || {},
          USER: results.USER || {},
          CHAIN: results.CHAIN || {},
        };

      default:
        return results;
    }
  }
}
