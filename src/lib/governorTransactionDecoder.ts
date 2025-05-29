import { decodeFunctionData, Abi, AbiFunction } from "viem";
import { IGovernorContract } from "./contracts/common/interfaces/IGovernorContract";
import { FunctionFragment } from "ethers";
import { getProposalTypeAddress } from "../app/proposals/draft/utils/stages";
import { ProposalType } from "../app/proposals/draft/types";

// Governor function categories as union types
type ProposalFunctions = 
  | "propose"
  | "proposeWithModule";

type VotingFunctions = 
  | "castVote"
  | "castVoteWithReason" 
  | "castVoteWithReasonAndParams"

type LifecycleFunctions = 
  | "queue"
  | "execute" 
  | "cancel"
  | "queueWithModule"
  | "executeWithModule"
  | "cancelWithModule";

// All governor functions union
type GovernorFunctions = ProposalFunctions | VotingFunctions | LifecycleFunctions;

// Type guards for function categories
const isProposalFunction = (functionName: string): functionName is ProposalFunctions => {
  return ["propose", "proposeWithModule"].includes(functionName);
};

const isVotingFunction = (functionName: string): functionName is VotingFunctions => {
  return ["castVote", "castVoteWithReason", "castVoteWithReasonAndParams"].includes(functionName);
};

const isLifecycleFunction = (functionName: string): functionName is LifecycleFunctions => {
  return ["queue", "execute", "cancel", "queueWithModule", "executeWithModule", "cancelWithModule"].includes(functionName);
};

interface DecodedGovernorTransaction {
  functionName: string;
  parameters: Record<string, { type: string; value: any }>;
  rawData: string;
}

/**
 * Decodes a governor transaction using the contract ABI
 */
export function decodeGovernorTransaction(
  calldata: `0x${string}`,
  governorContract: IGovernorContract
): DecodedGovernorTransaction | null {
  try {
    // Get all function fragments from the contract ABI
    const functionFragments = governorContract.interface.fragments.filter(
      (f) => f.type === "function"
    ) as FunctionFragment[];

    for (const fragment of functionFragments) {
      try {
        const abiFragment: AbiFunction = {
          type: "function",
          name: fragment.name,
          inputs: fragment.inputs.map(input => ({
            name: input.name || "",
            type: input.type,
          })),
          outputs: fragment.outputs.map((output: { name?: string; type: string }) => ({
            name: output.name || "",
            type: output.type,
          })),
          stateMutability: fragment.stateMutability as "pure" | "view" | "nonpayable" | "payable",
        };

        const decoded = decodeFunctionData({
          abi: [abiFragment] as Abi,
          data: calldata,
        });

        if (decoded.args) {
          // Format the parameters
          const parameters: Record<string, { type: string; value: any }> = {};
          decoded.args.forEach((value, index) => {
            const param = abiFragment.inputs[index];
            parameters[param.name || `param${index}`] = {
              type: param.type,
              value: value,
            };
          });

          return {
            functionName: fragment.name,
            parameters,
            rawData: calldata,
          };
        }
      } catch (error) {
        // Continue to next fragment if this one fails
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Error decoding governor transaction:", error);
    return null;
  }
}

/**
 * Decodes a proposal transaction and returns the decoded data
 */
export function decodeProposalTransaction(
  calldata: `0x${string}`,
  governorContract: IGovernorContract
) {
  const decoded = decodeGovernorTransaction(calldata, governorContract);
  if (!decoded || !isProposalFunction(decoded.functionName)) {
    return null;
  }

  // Extract proposal data based on the function type
  if (decoded.functionName === "propose") {
    const { targets, values, calldatas, description } = decoded.parameters;
    return {
      type: "standard",
      targets: targets.value,
      values: values.value,
      calldatas: calldatas.value,
      description: description.value,
    };
  } else {
    // proposeWithModule - determine if it's optimistic or approval based
    const { module, proposalData, description, proposalType } = decoded.parameters;
    
    const optimisticModuleAddress = getProposalTypeAddress(ProposalType.OPTIMISTIC);
    const approvalModuleAddress = getProposalTypeAddress(ProposalType.APPROVAL);
    
    let detectedType = "approval"; //default
    const moduleAddress = module?.value?.toLowerCase();
    
    if (moduleAddress && optimisticModuleAddress && moduleAddress === optimisticModuleAddress.toLowerCase()) {
      detectedType = "optimistic";
    } else if (moduleAddress && approvalModuleAddress && moduleAddress === approvalModuleAddress.toLowerCase()) {
      detectedType = "approval";
    }
    
    return {
      type: detectedType,
      module: module.value,
      proposalData: proposalData.value,
      description: description.value,
      proposalType: proposalType.value,
    };
  }
}

/**
 * Decodes a vote transaction and returns the proposalId
 */
export function decodeVoteTransaction(
  calldata: `0x${string}`,
  governorContract: IGovernorContract
) {
  const decoded = decodeGovernorTransaction(calldata, governorContract);
  
  if (!decoded || !isVotingFunction(decoded.functionName)) {
    return null;
  }

  // Extract vote data based on the function type
  const { proposalId } = decoded.parameters;
  
  return { proposalId: proposalId.value };
}

/**
 * Decodes a queue/execute/cancel transaction and returns the proposalId or descriptionHash
 */
export function decodeProposalActionTransaction(
  calldata: `0x${string}`,
  governorContract: IGovernorContract
) {
  const decoded = decodeGovernorTransaction(calldata, governorContract);
  
  if (!decoded || !isLifecycleFunction(decoded.functionName)) {
    return null;
  }

  // Handle queue/execute/cancel functions
  if (["queue", "execute", "cancel"].includes(decoded.functionName)) {
    // Check if it's Uniswap-style (using proposalId) or OpenZeppelin-style (using descriptionHash)
    const proposalId = decoded.parameters?.proposalId;
    const descriptionHash = decoded.parameters?.descriptionHash;
    
    if (proposalId?.value) {
      // Uniswap-style
      return {
        action: decoded.functionName,
        proposalId: proposalId.value,
      };
    } else if (descriptionHash?.value) {
      // OpenZeppelin-style
      return {
        action: decoded.functionName,
        descriptionHash: descriptionHash.value,
      };
    }
  }

  // Handle module functions
  if (["queueWithModule", "executeWithModule", "cancelWithModule"].includes(decoded.functionName)) {
    const descriptionHash = decoded.parameters?.descriptionHash;
    if (!descriptionHash?.value) {
      console.error("Missing descriptionHash in decoded module transaction:", decoded);
      return null;
    }
    return {
      action: decoded.functionName,
      descriptionHash: descriptionHash.value,
    };
  }

  return null;
} 