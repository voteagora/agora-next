import { ethers } from "ethers";
import { DraftProposal, ProposalType } from "../types";
import { decodeFunctionData, encodeAbiParameters, parseEther } from "viem";
import Tenant from "@/lib/tenant/tenant";
import {
  TIMELOCK_TYPE,
  TENANT_NAMESPACES,
  ZERO_ADDRESS,
  GOVERNOR_TYPE,
} from "@/lib/constants";
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
type Agora20BasicInputData = [
  `0x${string}`[],
  number[],
  `0x${string}`[],
  string,
];
type UniBasicInputData = [
  `0x${string}`[],
  number[],
  string[],
  `0x${string}`[],
  string,
];

type ApprovalInputData = [string, string, string, Number];
type AG20InputData = [
  `0x${string}`[],
  number[],
  `0x${string}`[],
  string,
  string,
];
type InputData =
  | OZBasicInputData
  | BasicInputData
  | ApprovalInputData
  | UniBasicInputData
  | AG20InputData
  | null;

const isTransfer = (calldata: string) => {
  // Function Selector: The first 4 bytes of calldata 0xa9059cbb for transfer(address,uint256)
  // TODO: might need to add more types if we have other types of "transfers"
  return calldata.startsWith("0xa9059cbb");
};

export function getInputData(proposal: DraftProposal): {
  inputData: InputData;
} {
  const { namespace, contracts } = Tenant.current();
  const governorType = contracts.governorType;
  const description =
    "# " +
    proposal.title +
    "\n\n" +
    `${
      proposal.temp_check_link &&
      "[Temp Check Discourse link](" + proposal.temp_check_link + ")\n\n"
    }` +
    proposal.abstract;

  if (governorType === GOVERNOR_TYPE.AGORA_20) {
    let options = [] as {
      description: string;
    }[];
    let maxApprovals = 0;
    let criteria = proposal.voting_module_type === ProposalType.BASIC ? 2 : 0;
    let criteriaValue = BigInt(0);
    const minParticipation = BigInt(proposal.min_participation || 3); // 3 is the minimum participation
    const isSignalVote =
      proposal.voting_module_type === ProposalType.APPROVAL
        ? true
        : (proposal.is_signal_vote ?? true);

    if (proposal.voting_module_type === ProposalType.APPROVAL) {
      proposal.approval_options.forEach((option) => {
        options.push({
          description: option.title,
        });
      });
      maxApprovals = proposal.max_options;
      criteria = proposal.criteria === "Threshold" ? 0 : 1;
      criteriaValue =
        proposal.criteria === "Threshold"
          ? parseEther(proposal.threshold.toString())
          : BigInt(proposal.top_choices);
    }

    const settings = {
      minParticipation,
      maxApprovals,
      criteria,
      criteriaValue,
      isSignalVote,
      actionId: proposal.title,
    };

    const abiCoder = ethers.AbiCoder.defaultAbiCoder();

    const proposalData = abiCoder.encode(
      [
        "tuple(string description)[]",
        "tuple(uint256 minParticipation, uint256 maxApprovals, uint8 criteria, uint256 criteriaValue, bool isSignalVote, string actionId)",
      ],
      [options, settings]
    );

    const parsedDescription =
      description + `#proposalTypeId=${proposal.proposal_type}#proposalData=`;

    const timelockAddress = contracts.timelock?.address;

    const inputData: AG20InputData = [
      [timelockAddress as `0x${string}`], // targets
      [0], // values
      ["0xf27a0c92" as `0x${string}`], // calldatas
      // The 3 items above will be ignored by the governor, but are still needed to be included in the input data
      parsedDescription,
      proposalData,
    ];

    return { inputData };
  }

  // Inputs for basic type
  // [targets, values, calldatas, description]
  // [string[], bigint[], string[], string]
  switch (proposal.voting_module_type) {
    case ProposalType.BASIC:
      let targets: `0x${string}`[] = [];
      let values: number[] = [];
      let calldatas: `0x${string}`[] = [];
      let signatures: string[] = [];
      let inputData: BasicInputData | OZBasicInputData | UniBasicInputData = [
        targets,
        values,
        calldatas,
        description,
        parseInt(proposal.proposal_type || "0"),
      ];

      if (proposal.transactions.length === 0) {
        const timelockAddress = contracts.timelock?.address;
        targets.push(
          contracts.supportScopes && timelockAddress
            ? (timelockAddress as `0x${string}`)
            : ZERO_ADDRESS
        );
        values.push(0);
        calldatas.push(
          contracts.supportScopes ? "0xf27a0c92" : ("0x" as `0x${string}`)
        ); // 0xf27a0c92 is the calldata to call the getMinDelay read function on the timelock => its only purpose is to allow for empty signal only proposals
        signatures.push("");
      } else {
        proposal.transactions.forEach((t) => {
          targets.push(ethers.getAddress(t.target) as `0x${string}`);
          values.push(parseInt(t.value) || 0);
          calldatas.push(t.calldata as `0x${string}`);
          // TIMELOCK_TYPE.TIMELOCK_NO_ACCESS_CONTROL can't handle signatures + calldata first 4 bytes signature. One of the two must be empty.
          if (
            contracts.timelockType !== TIMELOCK_TYPE.TIMELOCK_NO_ACCESS_CONTROL
          ) {
            signatures.push(t.signature || "");
          } else {
            signatures.push("");
          }
        });
      }

      // OZ governor does not have proposal types
      // need a better way to read which governor a particular tenant is on
      // would be great if we could read this from the contract, or the tenant
      if (namespace === TENANT_NAMESPACES.ENS) {
        inputData = inputData.slice(0, 4) as OZBasicInputData;
      }

      // Agora 2.0 governor proposal type is defined in the description
      if (governorType === GOVERNOR_TYPE.AGORA_20) {
        const parsedDescription = description + "#proposalTypeId=" + 3;
        inputData = [
          targets,
          values,
          calldatas,
          parsedDescription,
        ] as Agora20BasicInputData;
      }

      if (namespace === TENANT_NAMESPACES.UNISWAP) {
        inputData = [
          targets,
          values,
          signatures,
          calldatas,
          description,
        ] as UniBasicInputData;
      }

      return { inputData };

    // inputs for approval type
    // ((uint256 budgetTokensSpent,address[] targets,uint256[] values,bytes[] calldatas,string description)[] proposalOptions,(uint8 maxApprovals,uint8 criteria,address budgetToken,uint128 criteriaValue,uint128 budgetAmount) proposalSettings)
    case ProposalType.APPROVAL: {
      // Original approval proposal handling for other tenants
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
            formattedOption.values.push(BigInt(proposal.top_choices));
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
          ? contracts.governor.address
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
          `Approval module address not found for tenant ${namespace}`
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
          `Optimistic module address not found for tenant ${namespace}`
        );
      }

      let optimisticInputData: ApprovalInputData = [
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
