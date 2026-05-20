import { keccak256 } from "viem";
import { toUtf8Bytes } from "ethers";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";
import { ProposalType } from "@/app/proposals/draft/types";
import { proposalToCallArgs } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";

/**
 * Determines if a proposal should use module-based functions
 */
export const isModuleProposal = (proposalType: string): boolean => {
  return proposalType !== "STANDARD";
};

/**
 * Gets the appropriate module address based on proposal type
 */
export const getModuleAddressForProposal = (proposalType: string): string => {
  let moduleAddress: string | null | undefined;

  switch (proposalType) {
    case "APPROVAL":
    case "HYBRID_APPROVAL":
      moduleAddress = getProposalTypeAddress(ProposalType.APPROVAL);
      break;
    case "OPTIMISTIC":
    case "HYBRID_OPTIMISTIC":
    case "HYBRID_OPTIMISTIC_TIERED":
      moduleAddress = getProposalTypeAddress(ProposalType.OPTIMISTIC);
      break;
    case "OPTIMISTIC_EXECUTABLE":
    case "HYBRID_OPTIMISTIC_EXECUTABLE":
      moduleAddress = getProposalTypeAddress(ProposalType.OPTMISTIC_EXECUTABLE);
      break;
    default:
      throw new Error(`Unsupported proposal type: ${proposalType}`);
  }

  if (!moduleAddress) {
    throw new Error(
      `Module address not found for tenant ${Tenant.current().namespace}`
    );
  }

  return moduleAddress;
};

/**
 * Formats proposal data to ensure it has the 0x prefix
 */
export const formatProposalData = (proposalData?: string): string => {
  if (!proposalData) {
    return "0x";
  }
  return proposalData.startsWith("0x") ? proposalData : `0x${proposalData}`;
};

/**
 * Gets the appropriate function arguments for module or standard proposals
 */
export const getProposalCallArgs = (proposal: Proposal): any[] => {
  if (!isModuleProposal(proposal.proposalType!)) {
    return proposalToCallArgs(proposal);
  }

  const moduleAddress = getModuleAddressForProposal(proposal.proposalType!);
  const proposalData = formatProposalData(proposal.unformattedProposalData);
  const descriptionHash = keccak256(toUtf8Bytes(proposal.description!));

  return [moduleAddress, proposalData, descriptionHash];
};

/**
 * Gets the appropriate function name for the proposal action
 */
export const getProposalFunctionName = (
  proposalType: string,
  action: "queue" | "execute" | "cancel"
): string => {
  if (!isModuleProposal(proposalType)) {
    return action;
  }
  return `${action}WithModule`;
};
