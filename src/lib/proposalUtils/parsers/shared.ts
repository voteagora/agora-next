import { Block, toUtf8Bytes } from "ethers";
import { Abi, decodeFunctionData } from "viem";

const knownAbis: Record<string, Abi> = {
  "0x5ef2c7f0": [
    {
      constant: false,
      inputs: [
        { name: "_node", type: "bytes32" },
        { name: "_label", type: "bytes32" },
        { name: "_owner", type: "address" },
        { name: "_resolver", type: "address" },
        { name: "_ttl", type: "uint64" },
      ],
      name: "setSubnodeRecord",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x10f13a8c": [
    {
      constant: false,
      inputs: [
        { name: "_node", type: "bytes32" },
        { name: "_key", type: "string" },
        { name: "_value", type: "string" },
      ],
      name: "setText",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0xb4720477": [
    {
      constant: false,
      inputs: [
        { name: "_child", type: "address" },
        { name: "_message", type: "bytes" },
      ],
      name: "sendMessageToChild",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0xa9059cbb": [
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transfer",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x095ea7b3": [
    {
      constant: false,
      inputs: [
        { name: "_spender", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "approve",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x7b1837de": [
    {
      constant: false,
      inputs: [
        { name: "_to", type: "address" },
        { name: "_amount", type: "uint256" },
      ],
      name: "fund",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
  "0x23b872dd": [
    {
      constant: false,
      inputs: [
        { name: "_from", type: "address" },
        { name: "_to", type: "address" },
        { name: "_value", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ],
};

export const decodeCalldata = (calldatas: `0x${string}`[]) => {
  return calldatas.map((calldata) => {
    const parsedCalldata: `0x${string}` = calldata.startsWith("0x")
      ? calldata
      : (("0x" + calldata) as `0x${string}`);
    const abi = knownAbis[parsedCalldata.slice(0, 10)];
    let functionName = "unknown";
    let functionArgs = [] as string[];

    if (abi) {
      const decodedData = decodeFunctionData({
        abi,
        data: parsedCalldata,
      });
      functionName = decodedData.functionName;
      functionArgs = decodedData.args as string[];
    }

    return {
      functionArgs,
      functionName,
    };
  });
};

export function parseIfNecessary(obj: string | object) {
  return typeof obj === "string" ? JSON.parse(obj) : obj;
}

export function parseMultipleStringsSeparatedByComma(obj: string | object) {
  const safeSplit = (str: string): string[] => {
    const result: string[] = [];
    let current = "";
    let parenDepth = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (char === "(") {
        parenDepth++;
        current += char;
      } else if (char === ")") {
        parenDepth--;
        current += char;
      } else if (char === "," && parenDepth === 0) {
        if (current.trim()) {
          result.push(current.trim().replace(/^['"]|['"]$/g, ""));
        }
        current = "";
      } else {
        current += char;
      }
    }

    if (current.trim()) {
      result.push(current.trim().replace(/^['"]|['"]$/g, ""));
    }

    return result;
  };

  return typeof obj === "string"
    ? safeSplit(obj)
    : Array.isArray(obj)
      ? obj
          .map((item) => (typeof item === "string" ? safeSplit(item) : item))
          .flat()
      : obj;
}

export function toApprovalVotingCriteria(
  value: number
): "THRESHOLD" | "TOP_CHOICES" {
  switch (value) {
    case 0:
      return "THRESHOLD";
    case 1:
      return "TOP_CHOICES";
    default:
      throw new Error(`unknown type ${value}`);
  }
}
