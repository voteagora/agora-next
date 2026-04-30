import { decodeFunctionData } from "viem";

import { BridgeKind } from "../../types";
import type { CrossChainExecutionJob } from "../job-types";
import { BLOCK_GAS_LIMIT, DEFAULT_SIMULATION_FROM } from "../../tenderly-api";

const ARBITRUM_ONE_CHAIN_ID = 42161;

const inboxRetryableAbi = [
  {
    type: "function",
    name: "createRetryableTicket",
    inputs: [
      { name: "to", type: "address" },
      { name: "l2CallValue", type: "uint256" },
      { name: "maxSubmissionCost", type: "uint256" },
      { name: "excessFeeRefundAddress", type: "address" },
      { name: "callValueRefundAddress", type: "address" },
      { name: "gasLimit", type: "uint256" },
      { name: "maxFeePerGas", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [{ name: "ticketId", type: "uint256" }],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "unsafeCreateRetryableTicket",
    inputs: [
      { name: "to", type: "address" },
      { name: "l2CallValue", type: "uint256" },
      { name: "maxSubmissionCost", type: "uint256" },
      { name: "excessFeeRefundAddress", type: "address" },
      { name: "callValueRefundAddress", type: "address" },
      { name: "gasLimit", type: "uint256" },
      { name: "maxFeePerGas", type: "uint256" },
      { name: "data", type: "bytes" },
    ],
    outputs: [{ name: "ticketId", type: "uint256" }],
    stateMutability: "payable",
  },
] as const;

export function tryParseArbitrumRetryable(
  targetIndex: number,
  calldata: `0x${string}`
): CrossChainExecutionJob | null {
  try {
    const decoded = decodeFunctionData({
      abi: inboxRetryableAbi,
      data: calldata,
    });
    if (
      decoded.functionName !== "createRetryableTicket" &&
      decoded.functionName !== "unsafeCreateRetryableTicket"
    ) {
      return null;
    }
    const [
      to,
      l2CallValue,
      _maxSubmissionCost,
      _excessFeeRefundAddress,
      _callValueRefundAddress,
      _gasLimit,
      _maxFeePerGas,
      data,
    ] = decoded.args as readonly [
      `0x${string}`,
      bigint,
      bigint,
      `0x${string}`,
      `0x${string}`,
      bigint,
      bigint,
      `0x${string}`,
    ];

    const bridge = BridgeKind.ARBITRUM_RETRYABLE;

    return {
      bridge,
      destinationChainId: ARBITRUM_ONE_CHAIN_ID,
      sourceActionIndex: targetIndex,
      steps: [
        {
          label: "arbitrum_retryable_execution",
          buildPayload: ({ simulationTimestamp }) => ({
            network_id: String(ARBITRUM_ONE_CHAIN_ID),
            from: DEFAULT_SIMULATION_FROM,
            to,
            input: data,
            gas: BLOCK_GAS_LIMIT,
            gas_price: "0",
            value: l2CallValue.toString(),
            save: true,
            save_if_fails: true,
            generate_access_list: true,
            block_header: simulationTimestamp
              ? { timestamp: `0x${simulationTimestamp.toString(16)}` }
              : undefined,
          }),
        },
      ],
    };
  } catch {
    return null;
  }
}
