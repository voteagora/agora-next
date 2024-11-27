import { ethers } from "ethers";
import { DraftProposal, ProposalType } from "../types";
import { decodeFunctionData, encodeAbiParameters, parseEther } from "viem";
import Tenant from "@/lib/tenant/tenant";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { disapprovalThreshold } from "@/lib/constants";
import { getProposalTypeAddress } from "./stages";

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

type BasicInputData = [
  `0x${string}`[],
  number[],
  `0x${string}`[],
  string,
  number,
];

type OZBasicInputData = [`0x${string}`[], number[], `0x${string}`[], string];
type ApprovalInputData = [string, string, string, Number];
type InputData = OZBasicInputData | BasicInputData | ApprovalInputData | null;

const isTransfer = (calldata: string) => {
  // Function Selector: The first 4 bytes of calldata 0xa9059cbb for transfer(address,uint256)
  // TODO: might need to add more types if we have other types of "transfers"
  return calldata.startsWith("0xa9059cbb");
};

export function getInputData(proposal: DraftProposal): {
  inputData: InputData;
} {
  const tenant = Tenant.current();
  const description =
    "# " +
    proposal.title +
    "\n\n" +
    `${
      proposal.temp_check_link &&
      "[Temp Check Discourse link](" + proposal.temp_check_link + ")\n"
    }` +
    "\n\n ## Description \n" +
    proposal.abstract;

  // Inputs for basic type
  // [targets, values, calldatas, description]
  // [string[], bigint[], string[], string]
  switch (proposal.voting_module_type) {
    case ProposalType.BASIC:
      let targets: `0x${string}`[] = [];
      let values: number[] = [];
      let calldatas: `0x${string}`[] = [];
      let inputData: BasicInputData | OZBasicInputData = [
        targets,
        values,
        calldatas,
        description,
        parseInt(proposal.proposal_type || "0"),
      ];

      if (proposal.transactions.length === 0) {
        // empty eth transfer from governor
        const governorAddress = tenant.contracts.governor.address;
        targets.push(governorAddress as `0x${string}`);
        values.push(0);
        calldatas.push("0x" as `0x${string}`);
      } else {
        proposal.transactions.forEach((t) => {
          targets.push(ethers.getAddress(t.target) as `0x${string}`);
          values.push(parseInt(t.value) || 0);
          calldatas.push(t.calldata as `0x${string}`);
        });
      }

      // OZ governor does not have proposal types
      // need a better way to read which governor a particular tenant is on
      // would be great if we could read this from the contract, or the tenant
      if (tenant.namespace === TENANT_NAMESPACES.ENS) {
        inputData = inputData.slice(0, 4) as OZBasicInputData;
      }

      return { inputData };

    // inputs for approval type
    // ((uint256 budgetTokensSpent,address[] targets,uint256[] values,bytes[] calldatas,string description)[] proposalOptions,(uint8 maxApprovals,uint8 criteria,address budgetToken,uint128 criteriaValue,uint128 budgetAmount) proposalSettings)
    case ProposalType.APPROVAL: {
      let options = [] as {
        budgetTokensSpent: bigint;
        targets: `0x${string}`[];
        values: bigint[];
        calldatas: `0x${string}`[];
        description: string;
      }[];

      proposal.approval_options.forEach((option) => {
        const formattedOption = {
          budgetTokensSpent: BigInt(0),
          targets: [] as `0x${string}`[],
          values: [] as bigint[],
          calldatas: [] as `0x${string}`[],
          description: option.title,
        };

        option.transactions.forEach((t) => {
          if (isTransfer(t.calldata)) {
            const {
              args: [_recipient, amount],
            } = decodeFunctionData({
              abi: transferABI,
              data: t.calldata as `0x${string}`,
            });

            formattedOption.budgetTokensSpent += amount;
            formattedOption.targets.push(t.target as `0x${string}`);
            formattedOption.values.push(BigInt(0));
            formattedOption.calldatas.push(t.calldata as `0x${string}`);
          } else {
            formattedOption.targets.push(
              ethers.getAddress(t.target) as `0x${string}`
            );
            formattedOption.values.push(parseEther(t.value.toString() || "0"));
            formattedOption.calldatas.push(t.calldata as `0x${string}`);
          }
        });
        options.push(formattedOption);
      });

      // typescript saying budget is 'never'?
      const budget = proposal.budget as number;

      const settings = {
        maxApprovals: proposal.max_options,
        criteria: proposal.criteria === "Threshold" ? 0 : 1,
        budgetToken: (proposal.budget > 0
          ? tenant.contracts.governor.address
          : ethers.ZeroAddress) as `0x${string}`,
        criteriaValue:
          proposal.criteria === "Threshold"
            ? parseEther(proposal.threshold.toString())
            : BigInt(proposal.top_choices),
        budgetAmount: parseEther(budget.toString()),
      };

      const calldata = encodeAbiParameters(
        [
          {
            name: "proposalOptions",
            type: "tuple[]",
            components: [
              { name: "budgetTokensSpent", type: "uint256" },
              { name: "targets", type: "address[]" },
              { name: "values", type: "uint256[]" },
              { name: "calldatas", type: "bytes[]" },
              { name: "description", type: "string" },
            ],
          },
          {
            name: "proposalSettings",
            type: "tuple",
            components: [
              { name: "maxApprovals", type: "uint8" },
              { name: "criteria", type: "uint8" },
              { name: "budgetToken", type: "address" },
              { name: "criteriaValue", type: "uint128" },
              { name: "budgetAmount", type: "uint128" },
            ],
          },
        ],
        [options, settings]
      );

      const approvalModuleAddress = getProposalTypeAddress(
        ProposalType.APPROVAL
      );

      if (!approvalModuleAddress) {
        throw new Error(
          `Approval module address not found for tenant ${tenant.namespace}`
        );
      }

      const approvalInputData: ApprovalInputData = [
        approvalModuleAddress,
        calldata,
        description,
        parseInt(proposal.proposal_type || "0"),
      ];

      return { inputData: approvalInputData };
    }

    case ProposalType.OPTIMISTIC: {
      const calldata = encodeAbiParameters(
        [
          {
            name: "settings",
            type: "tuple",
            components: [
              { name: "againstThreshold", type: "uint248" },
              { name: "isRelativeToVotableSupply", type: "bool" },
            ],
          },
        ],
        [
          {
            againstThreshold: BigInt(disapprovalThreshold * 100),
            isRelativeToVotableSupply: true,
          },
        ]
      );

      const optimisticModuleAddress = getProposalTypeAddress(
        ProposalType.OPTIMISTIC
      );

      if (!optimisticModuleAddress) {
        throw new Error(
          `Optimistic module address not found for tenant ${tenant.namespace}`
        );
      }

      const optimisticInputData: ApprovalInputData = [
        optimisticModuleAddress,
        calldata,
        description,
        parseInt(proposal.proposal_type || "0"),
      ];

      return { inputData: optimisticInputData };
    }

    default:
      return {
        inputData: null,
      };
  }
}
