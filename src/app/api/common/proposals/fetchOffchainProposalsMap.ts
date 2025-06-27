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
  const offlineProposalsMap = new Map<string, ProposalPayload>();

  if (proposalIds.length === 0) {
    return offlineProposalsMap;
  }

  const offlineProposals = await findOffchainProposalsByOnchainIds({
    namespace,
    onchainProposalIds: proposalIds,
  });

  // Create a map of offline proposals by their onchain_proposalid
  (offlineProposals as ProposalPayload[]).forEach((offlineProposal) => {
    const onchainId = (offlineProposal.proposal_data as any)
      ?.onchain_proposalid;
    if (onchainId) {
      offlineProposalsMap.set(onchainId, offlineProposal);
    }
  });

  return offlineProposalsMap;
}
