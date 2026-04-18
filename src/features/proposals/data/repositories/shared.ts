import { Block } from "ethers";
import { ProposalPayload } from "@/app/api/common/proposals/proposal";
import type { ProposalType, TenantNamespace } from "@/lib/types";

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
): ProposalType | null {
  const proposalType = proposal.proposal_type;
  return typeof proposalType === "string"
    ? (proposalType as ProposalType)
    : null;
}

export function getOffchainParentId(proposal: ProposalPayload): string | null {
  const proposalData = proposal.proposal_data as
    | { onchain_proposalid?: string }
    | undefined;

  return proposalData?.onchain_proposalid ?? null;
}
