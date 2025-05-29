import { decodeFunctionData, Abi, AbiFunction } from "viem";
import { FunctionFragment } from "ethers";
import { ITokenContract } from "./contracts/common/interfaces/ITokenContract";
import { IMembershipContract } from "./contracts/common/interfaces/IMembershipContract";

// Delegation function categories as union types
type DelegateFunctions = "delegate" | "subdelegateBatched";

// Type guards for function categories
const isDelegateFunction = (
  functionName: string
): functionName is DelegateFunctions => {
  return ["delegate", "subdelegateBatched"].includes(functionName);
};

interface DecodedDelegationTransaction {
  functionName: string;
  parameters: Record<string, { type: string; value: any }>;
  rawData: string;
}

/**
 * Decodes a delegation transaction using the token contract ABI
 */
export function decodeDelegationTransaction(
  calldata: `0x${string}`,
  tokenContract: ITokenContract | IMembershipContract
): DecodedDelegationTransaction | null {
  try {
    // Get all function fragments from the contract ABI
    const functionFragments = tokenContract.interface.fragments.filter(
      (f) => f.type === "function"
    ) as FunctionFragment[];

    for (const fragment of functionFragments) {
      try {
        const abiFragment: AbiFunction = {
          type: "function",
          name: fragment.name,
          inputs: fragment.inputs.map((input) => ({
            name: input.name || "",
            type: input.type,
          })),
          outputs: fragment.outputs.map(
            (output: { name?: string; type: string }) => ({
              name: output.name || "",
              type: output.type,
            })
          ),
          stateMutability: fragment.stateMutability as
            | "pure"
            | "view"
            | "nonpayable"
            | "payable",
        };

        const decoded = decodeFunctionData({
          abi: [abiFragment] as Abi,
          data: calldata,
        });

        if (decoded.args) {
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
        continue;
      }
    }

    return null;
  } catch (error) {
    console.error("Error decoding delegation transaction:", error);
    return null;
  }
}

/**
 * Decodes a delegation transaction and returns the decoded data with delegatees
 */
export function decodeDelegationTransactionWithDelegatees(
  calldata: `0x${string}`,
  tokenContract: ITokenContract | IMembershipContract
) {
  const decoded = decodeDelegationTransaction(calldata, tokenContract);

  if (!decoded || !isDelegateFunction(decoded.functionName)) {
    return null;
  }

  let delegatees: string[] = [];

  // Extract delegatees based on the function type
  switch (decoded.functionName) {
    case "delegate": {
      const { delegatee } = decoded.parameters;
      delegatees = [delegatee.value];
      break;
    }
    case "subdelegateBatched": {
      const { delegatees: delegateesParam } = decoded.parameters;
      delegatees = delegateesParam.value;
      break;
    }
  }

  return {
    functionName: decoded.functionName,
    delegatees,
    parameters: decoded.parameters,
    rawData: decoded.rawData,
  };
}
