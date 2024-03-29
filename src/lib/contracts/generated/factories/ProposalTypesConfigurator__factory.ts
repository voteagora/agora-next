/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Interface, type ContractRunner } from "ethers";
import type {
  ProposalTypesConfigurator,
  ProposalTypesConfiguratorInterface,
} from "../ProposalTypesConfigurator";

const _abi = [
  {
    inputs: [
      {
        internalType: "contract IOptimismGovernor",
        name: "governor_",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "InvalidApprovalThreshold",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidQuorum",
    type: "error",
  },
  {
    inputs: [],
    name: "NotManager",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "proposalTypeId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "quorum",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "uint16",
        name: "approvalThreshold",
        type: "uint16",
      },
      {
        indexed: false,
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "ProposalTypeSet",
    type: "event",
  },
  {
    inputs: [],
    name: "PERCENT_DIVISOR",
    outputs: [
      {
        internalType: "uint16",
        name: "",
        type: "uint16",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "governor",
    outputs: [
      {
        internalType: "contract IOptimismGovernor",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalTypeId",
        type: "uint256",
      },
    ],
    name: "proposalTypes",
    outputs: [
      {
        components: [
          {
            internalType: "uint16",
            name: "quorum",
            type: "uint16",
          },
          {
            internalType: "uint16",
            name: "approvalThreshold",
            type: "uint16",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
        ],
        internalType: "struct IProposalTypesConfigurator.ProposalType",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalTypeId",
        type: "uint256",
      },
      {
        internalType: "uint16",
        name: "quorum",
        type: "uint16",
      },
      {
        internalType: "uint16",
        name: "approvalThreshold",
        type: "uint16",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
    ],
    name: "setProposalType",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export class ProposalTypesConfigurator__factory {
  static readonly abi = _abi;
  static createInterface(): ProposalTypesConfiguratorInterface {
    return new Interface(_abi) as ProposalTypesConfiguratorInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): ProposalTypesConfigurator {
    return new Contract(
      address,
      _abi,
      runner
    ) as unknown as ProposalTypesConfigurator;
  }
}
