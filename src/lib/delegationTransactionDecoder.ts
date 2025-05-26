import { decodeAbiParameters } from "viem";

// Common delegation function selectors
const DELEGATION_FUNCTION_SELECTORS = {
  delegate: "0x5c19a95c", // delegate(address)
  delegatePartial: "0xaf7b3857", // delegate(PartialDelegation[])
  subdelegateBatched: "0x72b9db46", // subdelegateBatched(address[],uint256[])
} as const;

type DelegationFunctionName = keyof typeof DELEGATION_FUNCTION_SELECTORS;

interface DecodedDelegationTransaction {
  functionName: DelegationFunctionName;
  delegatees: string[];
  rawData: string;
}

interface PartialDelegation {
  _delegatee: `0x${string}`;
  _numerator: bigint;
}

/**
 * Decodes a delegation transaction
 */
export function decodeDelegationTransaction(
  calldata: `0x${string}`
): DecodedDelegationTransaction | null {
  try {
    // Get the function selector (first 4 bytes)
    const selector = calldata.slice(0, 10);
    
    // Find the matching function name
    const functionName = Object.entries(DELEGATION_FUNCTION_SELECTORS).find(
      ([_, value]) => value === selector
    )?.[0] as DelegationFunctionName | undefined;

    if (!functionName) {
      return null;
    }

    const inputData = calldata.slice(10);
    let delegatees: string[] = [];

    switch (functionName) {
      case "delegate": {
        const decoded = decodeAbiParameters(
          [{ type: "address", name: "delegatee" }],
          `0x${inputData}` as `0x${string}`
        );
        delegatees = [decoded[0] as string];
        break;
      }
      case "delegatePartial": {
        const decoded = decodeAbiParameters(
          [
            {
              type: "tuple[]",
              name: "_partialDelegations",
              components: [
                { name: "_delegatee", type: "address" },
                { name: "_numerator", type: "uint96" },
              ],
            },
          ],
          `0x${inputData}` as `0x${string}`
        );
        const partialDelegations = decoded[0] as readonly PartialDelegation[];
        delegatees = partialDelegations.map(d => d._delegatee);
        break;
      }
      case "subdelegateBatched": {
        const decoded = decodeAbiParameters(
          [
            { type: "address[]", name: "delegatees" },
            { type: "uint256[]", name: "rules" },
          ],
          `0x${inputData}` as `0x${string}`
        );
        delegatees = decoded[0] as string[];
        break;
      }
    }

    return {
      functionName,
      delegatees,
      rawData: calldata,
    };
  } catch (error) {
    console.error("Error decoding delegation transaction:", error);
    return null;
  }
} 