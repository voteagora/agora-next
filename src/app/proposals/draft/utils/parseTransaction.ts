import Tenant from "@/lib/tenant/tenant";
import { decodeFunctionData, formatUnits } from "viem";
import { ProposalDraftTransaction } from "@prisma/client";
import { ProposalType, TransactionType, DraftProposal } from "../types";

const transferABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

const isTransfer = (calldata: string) => {
  // Function Selector: The first 4 bytes of calldata 0xa9059cbb for transfer(address,uint256)
  // TODO: might need to add more types if we have other types of "transfers"
  return calldata.startsWith("0xa9059cbb");
};

const parseTransaction = (t: ProposalDraftTransaction) => {
  const tenant = Tenant.current();
  if (isTransfer(t.calldata)) {
    const {
      args: [recipient, amount],
    } = decodeFunctionData({
      abi: transferABI,
      data: t.calldata as `0x${string}`,
    });

    return {
      target: t.target,
      value: t.value,
      calldata: t.calldata,
      type: TransactionType.TRANSFER,
      description: t.description,
      recipient,
      amount: formatUnits(amount, tenant.token.decimals),
      simulation_state: t.simulation_state,
      simulation_id: t.simulation_id,
    };
  } else {
    return {
      target: t.target,
      value: t.value,
      calldata: t.calldata,
      description: t.description,
      type: TransactionType.CUSTOM,
      simulation_state: t.simulation_state,
      simulation_id: t.simulation_id,
    };
  }
};
// Used to translate a draftProposal database record into its form representation
export const parseProposalToForm = (proposal: DraftProposal) => {
  switch (proposal.voting_module_type) {
    case ProposalType.BASIC:
      return {
        type: ProposalType.BASIC,
        title: proposal.title,
        abstract: proposal.abstract,
        transactions: proposal.transactions.map((t) => parseTransaction(t)),
      };
    case ProposalType.SOCIAL:
      return {
        type: ProposalType.SOCIAL,
        title: proposal.title,
        abstract: proposal.abstract,
        socialProposal: {
          start_date: proposal.start_date_social,
          end_date: proposal.end_date_social,
          options: proposal.social_options,
        },
      };
    case ProposalType.APPROVAL:
      return {
        type: ProposalType.APPROVAL,
        title: proposal.title,
        abstract: proposal.abstract,
        approvalProposal: {
          criteria: proposal.criteria,
          budget: proposal.budget?.toString(),
          maxOptions: proposal.max_options?.toString(),
          threshold: proposal.threshold?.toString(),
          topChoices: proposal.top_choices?.toString(),
          options: proposal.approval_options?.map((option) => {
            return {
              title: option.title,
              transactions: option.transactions.map((t) => parseTransaction(t)),
            };
          }),
        },
      };
    case ProposalType.OPTIMISTIC:
      return {
        type: ProposalType.OPTIMISTIC,
        title: proposal.title,
        abstract: proposal.abstract,
      };
  }
};
