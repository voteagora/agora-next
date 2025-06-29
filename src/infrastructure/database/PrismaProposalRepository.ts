import { ProposalRepository } from "@/domain/proposals/repositories/ProposalRepository";
import { Proposal } from "@/domain/proposals/entities/Proposal";
import { ProposalId } from "@/domain/proposals/value-objects/ProposalId";
import { SearchCriteria, PaginatedResult } from "@/domain/proposals/types";
import { ProposalFactory } from "@/domain/proposals/factories/ProposalFactory";
// import { prismaWeb3Client } from "@/lib/prismaClient";
// Mock for now - actual implementation would use real prisma client
const prismaWeb3Client = {} as any;
import { TenantNamespace } from "@/lib/types";

export class PrismaProposalRepository implements ProposalRepository {
  constructor(
    private tenant: TenantNamespace,
    private proposalFactory: ProposalFactory
  ) {}

  async findById(id: ProposalId): Promise<Proposal | null> {
    const proposalData = await this.getProposalModel().findUnique({
      where: { proposal_id: id.getValue() },
    });

    if (!proposalData) {
      return null;
    }

    return this.mapToDomainModel(proposalData);
  }

  async findByIds(ids: ProposalId[]): Promise<Proposal[]> {
    const proposalIds = ids.map((id) => id.getValue());

    const proposalsData = await this.getProposalModel().findMany({
      where: {
        proposal_id: { in: proposalIds },
      },
    });

    return Promise.all(
      proposalsData.map((data: any) => this.mapToDomainModel(data))
    );
  }

  async findMany(criteria: SearchCriteria): Promise<PaginatedResult<Proposal>> {
    const where = this.buildWhereClause(criteria);
    const orderBy = this.buildOrderBy(criteria);

    const [items, total] = await Promise.all([
      this.getProposalModel().findMany({
        where,
        orderBy,
        take: criteria.limit || 50,
        skip: criteria.offset || 0,
      }),
      this.getProposalModel().count({ where }),
    ]);

    const proposals = await Promise.all(
      items.map((data: any) => this.mapToDomainModel(data))
    );

    return {
      items: proposals,
      total,
      limit: criteria.limit || 50,
      offset: criteria.offset || 0,
    };
  }

  async save(proposal: Proposal): Promise<void> {
    // For read-only repository, this would typically not be implemented
    // or would use prismaWeb2Client for write operations
    throw new Error("Save operation not supported in read-only repository");
  }

  async saveMany(proposals: Proposal[]): Promise<void> {
    // For read-only repository, this would typically not be implemented
    throw new Error("Save operation not supported in read-only repository");
  }

  async count(criteria: SearchCriteria): Promise<number> {
    const where = this.buildWhereClause(criteria);
    return this.getProposalModel().count({ where });
  }

  async exists(id: ProposalId): Promise<boolean> {
    const count = await this.getProposalModel().count({
      where: { proposal_id: id.getValue() },
    });
    return count > 0;
  }

  private getProposalModel() {
    // Switch based on tenant to get the correct Prisma model
    switch (this.tenant) {
      case "optimism":
        return prismaWeb3Client.optimismProposals;
      case "ens":
        return prismaWeb3Client.ensProposals;
      case "uniswap":
        return prismaWeb3Client.uniswapProposals;
      case "cyber":
        return prismaWeb3Client.cyberProposals;
      case "scroll":
        return prismaWeb3Client.scrollProposals;
      case "derive":
        return prismaWeb3Client.deriveProposals;
      case "linea":
        return prismaWeb3Client.lineaProposals;
      case "etherfi":
        return prismaWeb3Client.etherfiProposals;
      case "pguild":
        return prismaWeb3Client.pguildProposals;
      case "boost":
        return prismaWeb3Client.boostProposals;
      case "xai":
        return prismaWeb3Client.xaiProposals;
      case "b3":
        return prismaWeb3Client.b3Proposals;
      case "demo":
        return prismaWeb3Client.demoProposals;
      default:
        throw new Error(`Unsupported tenant: ${this.tenant}`);
    }
  }

  private buildWhereClause(criteria: SearchCriteria): any {
    const where: any = {};

    if (criteria.type) {
      where.proposal_type = criteria.type;
    }

    if (criteria.status) {
      // Status is computed, not stored directly
      // This would need to be handled differently
    }

    if (criteria.proposer) {
      where.proposer = criteria.proposer.toLowerCase();
    }

    return where;
  }

  private buildOrderBy(criteria: SearchCriteria): any {
    const orderBy: any = {};

    switch (criteria.orderBy) {
      case "createdAt":
        orderBy.created_block = criteria.orderDirection || "desc";
        break;
      case "startBlock":
        orderBy.start_block = criteria.orderDirection || "desc";
        break;
      case "endBlock":
        orderBy.end_block = criteria.orderDirection || "desc";
        break;
      default:
        orderBy.ordinal = "desc"; // Default ordering
    }

    return orderBy;
  }

  private async mapToDomainModel(data: any): Promise<Proposal> {
    // Get votable supply (this might need to be fetched separately)
    const votableSupply = await this.getVotableSupply();

    // Map database model to domain payload
    const payload = {
      id: data.proposal_id,
      proposalNumber: data.ordinal?.toString(),
      type: data.proposal_type as any,
      title: this.extractTitle(data.description),
      description: data.description || "",
      proposer: data.proposer,
      data: data.proposal_data || {},
      results: data.proposal_results || {},
      timeline: {
        createdBlock: data.created_block,
        startBlock: data.start_block,
        endBlock: data.end_block,
        queuedBlock: data.queued_block,
        executedBlock: data.executed_block,
        cancelledBlock: data.cancelled_block,
      },
      quorumVotes: data.quorum_votes || this.calculateQuorum(votableSupply),
      approvalThreshold: data.approval_threshold || "5000", // 50% default
      votableSupply,
      context: {
        tenant: this.tenant,
        calculationOptions: data.calculation_options,
        delegateQuorum: data.delegate_quorum
          ? BigInt(data.delegate_quorum)
          : undefined,
        v6UpgradeBlock: data.v6_upgrade_block,
        disapprovalThreshold: data.disapproval_threshold,
        budgetChangeDate: data.budget_change_date
          ? BigInt(data.budget_change_date)
          : undefined,
        rawData: data,
      },
    };

    return this.proposalFactory.createProposal(payload);
  }

  private extractTitle(description: string | null): string {
    if (!description) return "Untitled Proposal";

    // Extract title from description (usually first line or up to first newline)
    const lines = description.split("\n");
    const firstLine = lines[0] || "";

    // Remove markdown headers if present
    const title = firstLine.replace(/^#+\s*/, "").trim();

    // Limit length
    return title.length > 100 ? title.substring(0, 97) + "..." : title;
  }

  private async getVotableSupply(): Promise<bigint> {
    // This would need to be fetched from the appropriate source
    // For now, return a placeholder
    return 100000000n; // 100M tokens
  }

  private calculateQuorum(votableSupply: bigint): bigint {
    // Default quorum calculation (e.g., 4% of supply)
    return (votableSupply * 4n) / 100n;
  }
}
