import { ProposalId } from "../value-objects/ProposalId";
import {
  ProposalType,
  ProposalData,
  ProposalResults,
  ProposalMetrics,
  ProposalStatus,
  ProposalTimeline,
} from "../types";
import { ProposalStrategy } from "../strategies/ProposalStrategy";
import { TenantNamespace } from "@/lib/types";

export interface ProposalContext {
  tenant: TenantNamespace;
  calculationOptions?: number;
  delegateQuorum?: bigint;
  v6UpgradeBlock?: number;
  disapprovalThreshold?: number;
  budgetChangeDate?: bigint;
  rawData?: any;
}

export class Proposal {
  constructor(
    private readonly id: ProposalId,
    private readonly type: ProposalType,
    private readonly strategy: ProposalStrategy,
    private readonly title: string,
    private readonly description: string,
    private readonly proposer: string,
    private data: ProposalData,
    private results: ProposalResults,
    private readonly timeline: ProposalTimeline,
    private readonly quorumVotes: bigint,
    private readonly approvalThreshold: bigint,
    private readonly votableSupply: bigint,
    private readonly context: ProposalContext
  ) {}

  getId(): string {
    return this.id.getValue();
  }

  getType(): ProposalType {
    return this.type;
  }

  getTitle(): string {
    return this.title;
  }

  getDescription(): string {
    return this.description;
  }

  getProposer(): string {
    return this.proposer;
  }

  getData(): ProposalData {
    return this.data;
  }

  getResults(): ProposalResults {
    return this.results;
  }

  getTimeline(): ProposalTimeline {
    return this.timeline;
  }

  getStatus(): ProposalStatus {
    return this.strategy.determineStatus(this);
  }

  getMetrics(): ProposalMetrics {
    return this.strategy.calculateMetrics(this);
  }

  getQuorumVotes(): bigint {
    return this.quorumVotes;
  }

  getApprovalThreshold(): bigint {
    return this.approvalThreshold;
  }

  getVotableSupply(): bigint {
    return this.votableSupply;
  }

  getContext(): ProposalContext {
    return this.context;
  }

  getRawData(): any {
    return this.context.rawData;
  }

  updateResults(results: ProposalResults): void {
    this.results = results;
  }

  isActive(currentBlock: bigint): boolean {
    return (
      currentBlock >= this.timeline.startBlock &&
      currentBlock <= this.timeline.endBlock
    );
  }

  hasEnded(currentBlock: bigint): boolean {
    return currentBlock > this.timeline.endBlock;
  }

  isQueued(): boolean {
    return this.timeline.queuedBlock !== undefined;
  }

  isExecuted(): boolean {
    return this.timeline.executedBlock !== undefined;
  }

  isCancelled(): boolean {
    return this.timeline.cancelledBlock !== undefined;
  }
}
