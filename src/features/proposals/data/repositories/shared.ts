import { Block } from "ethers";
import { ProposalPayload } from "@/app/api/common/proposals/proposal";
import type { LegacyProposalType, TenantNamespace } from "@/lib/types";

export type ProposalRepositoryContext = {
  namespace: TenantNamespace;
  contracts: any;
  ui: any;
};

export function getLatestBlockPromise(ui: any, contracts: any): Promise<Block> {
  return ui.toggle("use-l1-block-number")?.enabled
    ? contracts.providerForTime?.getBlock("latest")
    : contracts.token.provider.getBlock("latest");
}

export function getProposalTypeValue(
  proposal: ProposalPayload
): LegacyProposalType | null {
  const proposalType = proposal.proposal_type;
  return typeof proposalType === "string"
    ? (proposalType as LegacyProposalType)
    : null;
}

export function getOffchainParentId(proposal: ProposalPayload): string | null {
  const proposalData = proposal.proposal_data as
    | { onchain_proposalid?: string }
    | undefined;

  return proposalData?.onchain_proposalid ?? null;
}
