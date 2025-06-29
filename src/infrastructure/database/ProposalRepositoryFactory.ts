import { ProposalRepository } from "@/domain/proposals/repositories/ProposalRepository";
import { PrismaProposalRepository } from "./PrismaProposalRepository";
import { ProposalFactory } from "@/domain/proposals/factories/ProposalFactory";
import { ProposalTypeRegistry } from "@/domain/proposals/factories/ProposalTypeRegistry";
import { TenantNamespace } from "@/lib/types";

export class ProposalRepositoryFactory {
  private static repositories = new Map<TenantNamespace, ProposalRepository>();

  static getRepository(tenant: TenantNamespace): ProposalRepository {
    if (!this.repositories.has(tenant)) {
      const registry = ProposalTypeRegistry.getInstance();
      const proposalFactory = new ProposalFactory(registry);
      const repository = new PrismaProposalRepository(tenant, proposalFactory);
      this.repositories.set(tenant, repository);
    }

    return this.repositories.get(tenant)!;
  }

  static clearCache(): void {
    this.repositories.clear();
  }
}
