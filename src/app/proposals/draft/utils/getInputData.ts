import { ethers } from "ethers";
import { ProposalDraft, ProposalDraftTransaction } from "@prisma/client";
import {
  ProposalType,
  DraftProposal,
  BasicProposal,
  SocialProposal,
  ApprovalProposal,
  OptimisticProposal,
} from "../types";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import Tenant from "@/lib/tenant/tenant";

type BasicInputData = [`0x${string}`[], bigint[], `0x${string}`[], string];

export function getInputData(
  proposal: ProposalDraft & { transactions: ProposalDraftTransaction[] }
): {
  inputData: BasicInputData;
} {
  const description =
    "# " +
    proposal.title +
    "\n\n" +
    `${
      proposal.temp_check_link &&
      "[Temp Check Discourse link](" + proposal.temp_check_link + ")\n"
    }` +
    "\n\n ## Abstract \n" +
    proposal.abstract;

  // provide default values for basic proposal
  let targets: `0x${string}`[] = [];
  let values: bigint[] = [];
  let calldatas: `0x${string}`[] = [];
  let inputData: BasicInputData = [targets, values, calldatas, description];

  // TODO: validate transastion data
  try {
    if (proposal.transactions.length === 0) {
      targets.push(ethers.ZeroAddress as `0x${string}`);
      values.push(0n);
      calldatas.push("0x");
    } else {
      proposal.transactions.forEach((t) => {
        targets.push(ethers.getAddress(t.target) as `0x${string}`);
        values.push(ethers.parseEther(t.value.toString() || "0"));
        calldatas.push(t.calldata as `0x${string}`);
      });
    }
  } catch (e) {}

  return { inputData };
}

const useCreateBasicProposalAction = (proposalData: BasicProposal) => {
  const { contracts } = Tenant.current();
  const { inputData } = getInputData(proposalData);

  const { config } = usePrepareContractWrite({
    address: contracts.governor.address as `0x${string}`,
    chainId: contracts.governor.chain.id,
    abi: contracts.governor.abi,
    functionName: "propose",
    args: inputData,
  });

  const { writeAsync, isLoading: isWriteLoading } = useContractWrite(config);
};

const createSocialProposalAction = (proposalData: SocialProposal) => {
  // TODO: implement
};

const createApprovalProposalAction = (proposalData: ApprovalProposal) => {
  // TODO: implement
};

const createOptimisticProposalAction = (proposalData: OptimisticProposal) => {
  // TODO: implement
};

/**
 *
 * @param proposalData
 * @returns action to create a proposal based on the proposal type
 * @throws Error if the proposal type is invalid
 */
const useCreateProposalAction = (proposalData: DraftProposal) => {
  switch (proposalData.type) {
    case ProposalType.BASIC:
      return useCreateBasicProposalAction(proposalData);
    case ProposalType.SOCIAL:
      return createSocialProposalAction(proposalData);
    case ProposalType.APPROVAL:
      return createApprovalProposalAction(proposalData);
    case ProposalType.OPTIMISTIC:
      return createOptimisticProposalAction(proposalData);
    default:
      throw new Error("Invalid proposal type");
  }
};
