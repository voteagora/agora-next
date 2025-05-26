import { decodeFunctionData, Abi, AbiFunction } from "viem";
import Tenant from "./tenant/tenant";
import { IGovernorContract } from "./contracts/common/interfaces/IGovernorContract";
import { Fragment, FunctionFragment } from "ethers";

// Common governor function selectors
const GOVERNOR_FUNCTION_SELECTORS = {
  // Standard governor functions
  propose: "0x9a79018e", // propose(address[],uint256[],bytes[],string)
  proposeWithModule: "0x7b3c71d3", // proposeWithModule(address,tuple,tuple[],tuple[],string)
  castVote: "0x56781388", // castVote(uint256,uint8)
  castVoteWithReason: "0x7b3c71d3", // castVoteWithReason(uint256,uint8,string)
  castVoteWithReasonAndParams: "0x5f398a14", // castVoteWithReasonAndParams(uint256,uint8,string,bytes)
  
  // Uniswap-style functions (using proposalId)
  queueUniswap: "0x160cbed7", // queue(uint256)
  executeUniswap: "0x72db799f", // execute(uint256)
  cancelUniswap: "0x40e58ee5", // cancel(uint256)
  
  // OpenZeppelin-style functions (using descriptionHash)
  queueOZ: "0x2f54bf6e", // queue(address[],uint256[],bytes[],bytes32)
  executeOZ: "0x1cff79cd", // execute(address[],uint256[],bytes[],bytes32)
  cancelOZ: "0x452115d6", // cancel(address[],uint256[],bytes[],bytes32)
  
  // Module functions
  queueWithModule: "0x2f54bf6e", // queueWithModule(address,bytes,bytes32)
  executeWithModule: "0x1cff79cd", // executeWithModule(address,bytes,bytes32)
  cancelWithModule: "0x452115d6", // cancelWithModule(address,bytes,bytes32)
} as const;

type GovernorFunctionName = keyof typeof GOVERNOR_FUNCTION_SELECTORS;

interface DecodedGovernorTransaction {
  functionName: GovernorFunctionName;
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
    // Get the function selector (first 4 bytes)
    const selector = calldata.slice(0, 10);
    
    // Find the matching function name
    const functionName = Object.entries(GOVERNOR_FUNCTION_SELECTORS).find(
      ([_, value]) => value === selector
    )?.[0] as GovernorFunctionName | undefined;

    if (!functionName) {
      return null;
    }

    // Get the ABI for the specific function
    const fragment = governorContract.interface.fragments.find(
      (f) => f.type === "function" && (f as unknown as { name: string }).name === functionName
    ) as FunctionFragment | undefined;

    if (!fragment || fragment.type !== "function") {
      return null;
    }

    // Convert ethers Fragment to viem AbiFunction
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

    // Decode the function data
    const decoded = decodeFunctionData({
      abi: [abiFragment] as Abi,
      data: calldata,
    });

    if (!decoded.args) {
      return null;
    }

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
      functionName,
      parameters,
      rawData: calldata,
    };
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
  
  if (!decoded || !["propose", "proposeWithModule"].includes(decoded.functionName)) {
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
    // proposeWithModule
    const { approvalModuleAddress, encodedData, description, proposalSettings } = decoded.parameters;
    return {
      type: "approval",
      approvalModuleAddress: approvalModuleAddress.value,
      encodedData: encodedData.value,
      description: description.value,
      proposalSettings: proposalSettings.value,
    };
  }
}

/**
 * Decodes a vote transaction and returns the decoded data
 */
export function decodeVoteTransaction(
  calldata: `0x${string}`,
  governorContract: IGovernorContract
) {
  const decoded = decodeGovernorTransaction(calldata, governorContract);
  
  if (!decoded || !["castVote", "castVoteWithReason", "castVoteWithReasonAndParams"].includes(decoded.functionName)) {
    return null;
  }

  // Extract vote data based on the function type
  const { proposalId, support, reason, params } = decoded.parameters;
  
  return {
    proposalId: proposalId.value,
    support: support.value,
    reason: reason?.value,
    params: params?.value,
  };
}

/**
 * Decodes a queue/execute/cancel transaction and returns the decoded data
 */
export function decodeProposalActionTransaction(
  calldata: `0x${string}`,
  governorContract: IGovernorContract
) {
  const decoded = decodeGovernorTransaction(calldata, governorContract);
  
  if (!decoded) return null;

  // Handle Uniswap-style functions (using proposalId)
  if (["queueUniswap", "executeUniswap", "cancelUniswap"].includes(decoded.functionName)) {
    const proposalId = decoded.parameters?.proposalId;
    if (!proposalId?.value) {
      console.error("Missing proposalId in decoded Uniswap transaction:", decoded);
      return null;
    }
    return {
      action: decoded.functionName.replace("Uniswap", "").toLowerCase(),
      proposalId: proposalId.value,
    };
  }

  // Handle OpenZeppelin-style functions (using descriptionHash)
  if (["queueOZ", "executeOZ", "cancelOZ"].includes(decoded.functionName)) {
    const descriptionHash = decoded.parameters?.descriptionHash;
    if (!descriptionHash?.value) {
      console.error("Missing descriptionHash in decoded OZ transaction:", decoded);
      return null;
    }
    return {
      action: decoded.functionName.replace("OZ", "").toLowerCase(),
      descriptionHash: descriptionHash.value,
    };
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