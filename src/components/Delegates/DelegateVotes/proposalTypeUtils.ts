import { ProposalType } from "@/app/proposals/draft/types";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";

export type ProposalModuleAddresses = {
  approval: string | null;
  optimistic: string | null;
};

export function getProposalModuleAddresses(): ProposalModuleAddresses {
  let approval: string | null = null;
  let optimistic: string | null = null;

  try {
    approval =
      getProposalTypeAddress(ProposalType.APPROVAL)?.toLowerCase() ?? null;
  } catch {}

  try {
    optimistic =
      getProposalTypeAddress(ProposalType.OPTIMISTIC)?.toLowerCase() ?? null;
  } catch {}

  return { approval, optimistic };
}

function matchesProposalType(
  proposalType: string | null | undefined,
  literalType: string,
  moduleAddress: string | null | undefined
) {
  const normalizedProposalType = proposalType?.toLowerCase();

  return (
    normalizedProposalType === literalType.toLowerCase() ||
    (!!moduleAddress && normalizedProposalType === moduleAddress.toLowerCase())
  );
}

export function isApprovalProposalType(
  proposalType: string | null | undefined,
  moduleAddresses?: ProposalModuleAddresses
) {
  return matchesProposalType(
    proposalType,
    "APPROVAL",
    moduleAddresses?.approval
  );
}

export function isOptimisticProposalType(
  proposalType: string | null | undefined,
  moduleAddresses?: ProposalModuleAddresses
) {
  return matchesProposalType(
    proposalType,
    "OPTIMISTIC",
    moduleAddresses?.optimistic
  );
}
