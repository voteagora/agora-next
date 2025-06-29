import { Proposal, ProposalContext } from "../entities/Proposal";
import { ProposalId } from "../value-objects/ProposalId";
import { ProposalType, ProposalTimeline } from "../types";
import { ProposalTypeRegistry } from "./ProposalTypeRegistry";
import { InvalidProposalDataError } from "../errors/ProposalErrors";
import { TenantNamespace } from "@/lib/types";

export interface ProposalPayload {
  id: string;
  proposalNumber?: string;
  type: ProposalType;
  title: string;
  description: string;
  proposer: string;
  data: any;
  results?: any;
  timeline: {
    createdBlock: string | bigint;
    startBlock: string | bigint;
    endBlock: string | bigint;
    queuedBlock?: string | bigint;
    executedBlock?: string | bigint;
    cancelledBlock?: string | bigint;
  };
  quorumVotes: string | bigint;
  approvalThreshold: string | bigint;
  votableSupply: string | bigint;
  context: {
    tenant: TenantNamespace;
    calculationOptions?: number;
    delegateQuorum?: string | bigint;
    v6UpgradeBlock?: number;
    disapprovalThreshold?: number;
    budgetChangeDate?: string | bigint;
    rawData?: any;
  };
}

export class ProposalFactory {
  constructor(private registry: ProposalTypeRegistry) {}

  createProposal(payload: ProposalPayload): Proposal {
    try {
      // Validate proposal type
      const config = this.registry.getConfig(payload.type);
      const strategy = config.strategy;

      // Parse proposal data using strategy
      const proposalData = strategy.parseData(payload.data);

      // Validate parsed data
      if (!strategy.validateData(proposalData)) {
        throw new InvalidProposalDataError(
          payload.type,
          "Failed validation after parsing"
        );
      }

      // Create timeline
      const timeline: ProposalTimeline = {
        createdBlock: BigInt(payload.timeline.createdBlock),
        startBlock: BigInt(payload.timeline.startBlock),
        endBlock: BigInt(payload.timeline.endBlock),
        queuedBlock: payload.timeline.queuedBlock
          ? BigInt(payload.timeline.queuedBlock)
          : undefined,
        executedBlock: payload.timeline.executedBlock
          ? BigInt(payload.timeline.executedBlock)
          : undefined,
        cancelledBlock: payload.timeline.cancelledBlock
          ? BigInt(payload.timeline.cancelledBlock)
          : undefined,
      };

      // Create context
      const context: ProposalContext = {
        tenant: payload.context.tenant,
        calculationOptions: payload.context.calculationOptions,
        delegateQuorum: payload.context.delegateQuorum
          ? BigInt(payload.context.delegateQuorum)
          : undefined,
        v6UpgradeBlock: payload.context.v6UpgradeBlock,
        disapprovalThreshold: payload.context.disapprovalThreshold,
        budgetChangeDate: payload.context.budgetChangeDate
          ? BigInt(payload.context.budgetChangeDate)
          : undefined,
        rawData: payload.context.rawData || payload.data,
      };

      // Parse results directly - strategy can access context if needed
      const results = payload.results
        ? strategy.parseResults(payload.results, payload.data)
        : {
            forVotes: 0n,
            againstVotes: 0n,
            abstainVotes: 0n,
            totalVotes: 0n,
          };

      // Create final proposal entity with parsed results
      return new Proposal(
        new ProposalId(payload.id),
        payload.type,
        strategy,
        payload.title,
        payload.description,
        payload.proposer,
        proposalData,
        results,
        timeline,
        BigInt(payload.quorumVotes),
        BigInt(payload.approvalThreshold),
        BigInt(payload.votableSupply),
        context
      );
    } catch (error: any) {
      if (error instanceof InvalidProposalDataError) {
        throw error;
      }
      throw new InvalidProposalDataError(
        payload.type,
        `Failed to create proposal: ${error.message}`
      );
    }
  }

  createMany(payloads: ProposalPayload[]): Proposal[] {
    return payloads.map((payload) => this.createProposal(payload));
  }
}
