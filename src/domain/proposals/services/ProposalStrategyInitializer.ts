import { ProposalTypeRegistry } from "../factories/ProposalTypeRegistry";
import { ProposalTypeConfig } from "../factories/ProposalTypeConfig";
import { StandardProposalStrategy } from "../strategies/StandardProposalStrategy";
import { ApprovalProposalStrategy } from "../strategies/ApprovalProposalStrategy";
import { OptimisticProposalStrategy } from "../strategies/OptimisticProposalStrategy";
import { HybridProposalStrategy } from "../strategies/HybridProposalStrategy";
import { HybridOptimisticTieredStrategy } from "../strategies/HybridOptimisticTieredStrategy";
import { ProposalType } from "../types";

export class ProposalStrategyInitializer {
  static initialize(): void {
    const registry = ProposalTypeRegistry.getInstance();

    // Clear any existing registrations
    registry.clear();

    // Register standard proposal type
    this.registerStandard(registry);

    // Register approval proposal type
    this.registerApproval(registry);

    // Register optimistic proposal type
    this.registerOptimistic(registry);

    // Register offchain types
    this.registerOffchainTypes(registry);

    // Register hybrid types
    this.registerHybridTypes(registry);

    // Register snapshot type
    this.registerSnapshot(registry);
  }

  private static registerStandard(registry: ProposalTypeRegistry): void {
    const standardStrategy = new StandardProposalStrategy();

    registry.register({
      type: "STANDARD",
      strategy: standardStrategy,
      displayName: "Standard Proposal",
      description:
        "Standard on-chain proposal with simple FOR/AGAINST/ABSTAIN voting",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: false,
        hasOffchainComponent: false,
        hasHybridVoting: false,
      },
    });
  }

  private static registerApproval(registry: ProposalTypeRegistry): void {
    const approvalStrategy = new ApprovalProposalStrategy();

    registry.register({
      type: "APPROVAL",
      strategy: approvalStrategy,
      displayName: "Approval Voting",
      description:
        "Multi-choice voting for budget allocation and grant selection",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: true,
        hasOptimisticVeto: false,
        hasOffchainComponent: false,
        hasHybridVoting: false,
      },
    });
  }

  private static registerOptimistic(registry: ProposalTypeRegistry): void {
    const optimisticStrategy = new OptimisticProposalStrategy();

    registry.register({
      type: "OPTIMISTIC",
      strategy: optimisticStrategy,
      displayName: "Optimistic Proposal",
      description:
        "Proposal that passes unless vetoed by sufficient against votes",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: true,
        hasOffchainComponent: false,
        hasHybridVoting: false,
      },
    });
  }

  private static registerOffchainTypes(registry: ProposalTypeRegistry): void {
    // For offchain types, we reuse the same strategies but mark them as offchain
    const standardStrategy = new StandardProposalStrategy();
    const approvalStrategy = new ApprovalProposalStrategy();
    const optimisticStrategy = new OptimisticProposalStrategy();

    // Offchain Standard
    registry.register({
      type: "OFFCHAIN_STANDARD",
      strategy: standardStrategy,
      displayName: "Off-chain Standard",
      description: "Off-chain voting with standard FOR/AGAINST/ABSTAIN options",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: false,
        hasOffchainComponent: true,
        hasHybridVoting: false,
      },
    });

    // Offchain Approval
    registry.register({
      type: "OFFCHAIN_APPROVAL",
      strategy: approvalStrategy,
      displayName: "Off-chain Approval",
      description: "Off-chain multi-choice voting for selections",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: true,
        hasOptimisticVeto: false,
        hasOffchainComponent: true,
        hasHybridVoting: false,
      },
    });

    // Offchain Optimistic
    registry.register({
      type: "OFFCHAIN_OPTIMISTIC",
      strategy: optimisticStrategy,
      displayName: "Off-chain Optimistic",
      description: "Off-chain optimistic proposal with veto mechanism",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: true,
        hasOffchainComponent: true,
        hasHybridVoting: false,
      },
    });

    // Offchain Optimistic Tiered
    registry.register({
      type: "OFFCHAIN_OPTIMISTIC_TIERED",
      strategy: optimisticStrategy, // Can extend for tiered logic
      displayName: "Off-chain Optimistic Tiered",
      description:
        "Off-chain optimistic with different veto thresholds by tier",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: true,
        hasOffchainComponent: true,
        hasHybridVoting: false,
      },
    });
  }

  private static registerHybridTypes(registry: ProposalTypeRegistry): void {
    const standardStrategy = new StandardProposalStrategy();
    const approvalStrategy = new ApprovalProposalStrategy();
    const optimisticStrategy = new OptimisticProposalStrategy();

    // Hybrid Standard
    const hybridStandardStrategy = new HybridProposalStrategy(
      standardStrategy,
      standardStrategy,
      "STANDARD"
    );

    registry.register({
      type: "HYBRID_STANDARD",
      strategy: hybridStandardStrategy,
      displayName: "Hybrid Standard",
      description:
        "Combined on-chain/off-chain voting with weighted stakeholder groups",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: false,
        hasOffchainComponent: true,
        hasHybridVoting: true,
      },
    });

    // Hybrid Approval
    const hybridApprovalStrategy = new HybridProposalStrategy(
      approvalStrategy,
      approvalStrategy,
      "APPROVAL"
    );

    registry.register({
      type: "HYBRID_APPROVAL",
      strategy: hybridApprovalStrategy,
      displayName: "Hybrid Approval",
      description: "Multi-stakeholder approval voting with weighted groups",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: true,
        hasOptimisticVeto: false,
        hasOffchainComponent: true,
        hasHybridVoting: true,
      },
    });

    // Hybrid Optimistic
    const hybridOptimisticStrategy = new HybridProposalStrategy(
      optimisticStrategy,
      optimisticStrategy,
      "OPTIMISTIC"
    );

    registry.register({
      type: "HYBRID_OPTIMISTIC",
      strategy: hybridOptimisticStrategy,
      displayName: "Hybrid Optimistic",
      description:
        "Multi-stakeholder optimistic proposal with veto across groups",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: true,
        hasOffchainComponent: true,
        hasHybridVoting: true,
      },
    });

    // Hybrid Optimistic Tiered
    const hybridOptimisticTieredStrategy = new HybridOptimisticTieredStrategy(
      optimisticStrategy,
      optimisticStrategy,
      "OPTIMISTIC"
    );

    registry.register({
      type: "HYBRID_OPTIMISTIC_TIERED",
      strategy: hybridOptimisticTieredStrategy,
      displayName: "Hybrid Optimistic Tiered",
      description: "Hybrid optimistic with different veto thresholds per group",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: true,
        hasOffchainComponent: true,
        hasHybridVoting: true,
      },
    });
  }

  private static registerSnapshot(registry: ProposalTypeRegistry): void {
    // Snapshot uses standard strategy for parsing
    const standardStrategy = new StandardProposalStrategy();

    registry.register({
      type: "SNAPSHOT",
      strategy: standardStrategy,
      displayName: "Snapshot Proposal",
      description: "Off-chain social signaling vote via Snapshot platform",
      features: {
        hasVotingReason: true,
        hasApprovalOptions: false,
        hasOptimisticVeto: false,
        hasOffchainComponent: true,
        hasHybridVoting: false,
      },
    });
  }
}
