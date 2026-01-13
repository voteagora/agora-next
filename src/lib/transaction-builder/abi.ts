import { encodeFunctionData, parseAbiItem, type AbiFunction } from "viem";
import { ContractABI, ParsedFunction } from "./types";

/**
 * Parses a JSON string ABI or an array ABI into our internal structure.
 * Only extracts 'write' functions (stateMutability: nonpayable/payable).
 */
export function parseABI(
  contractAddress: string,
  abiInput: string | any[]
): ContractABI {
  let abi: any[] = [];
  try {
    abi = typeof abiInput === "string" ? JSON.parse(abiInput) : abiInput;
  } catch (e) {
    return { address: contractAddress, abi: [], functions: [] };
  }

  const writeFunctions: ParsedFunction[] = abi
    .filter((item: any) => {
      return (
        item.type === "function" &&
        (item.stateMutability === "nonpayable" ||
          item.stateMutability === "payable")
      );
    })
    .map((item: any) => {
      const inputs = item.inputs || [];
      const signature = `${item.name}(${inputs.map((i: any) => i.type).join(",")})`;
      return {
        name: item.name,
        inputs: inputs.map((i: any) => ({
          name: i.name,
          type: i.type,
          components: i.components,
        })),
        stateMutability: item.stateMutability,
        signature,
      };
    });

  return {
    address: contractAddress,
    abi,
    functions: writeFunctions,
  };
}

/**
 * Encodes the function call data.
 */
export function encodeTransaction(
  functionName: string,
  args: any[],
  abi: any[]
): string {
  try {
    const data = encodeFunctionData({
      abi,
      functionName,
      args,
    });
    return data;
  } catch (e) {
    throw e;
  }
}
