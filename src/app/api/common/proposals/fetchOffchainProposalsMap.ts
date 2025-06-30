import { findOffchainProposalsByOnchainIds } from "@/lib/prismaUtils";
import { TenantNamespace } from "@/lib/types";

import { ProposalPayload } from "./proposal";

/**
 * Fetches offchain proposals that match the given onchain proposal IDs
 * and returns them as a map keyed by onchain proposal ID
 */
export async function fetchOffchainProposalsMap({
  namespace,
  proposalIds,
}: {
  namespace: TenantNamespace;
  proposalIds: string[];
}): Promise<Map<string, ProposalPayload>> {
  const offchainProposalsMap = new Map<string, ProposalPayload>();

  if (proposalIds.length === 0) {
    return offchainProposalsMap;
  }

  const offchainProposals = await findOffchainProposalsByOnchainIds({
    namespace,
    onchainProposalIds: proposalIds,
  });

  // Create a map of offchain proposals by their onchain_proposalid
  (offchainProposals as ProposalPayload[]).forEach((offchainProposal) => {
    const onchainId = (offchainProposal.proposal_data as any)
      ?.onchain_proposalid;
    if (onchainId) {
      offchainProposalsMap.set(onchainId, offchainProposal);
    }
  });

  return offchainProposalsMap;
}
