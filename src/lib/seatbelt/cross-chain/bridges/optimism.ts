import { decodeFunctionData } from "viem";

import { BridgeKind } from "../../types";
import type { CrossChainExecutionJob } from "../job-types";
import { BLOCK_GAS_LIMIT, DEFAULT_SIMULATION_FROM } from "../../tenderly-api";

const OPTIMISM_CHAIN_ID = 10;

const messengerAbi = [
  {
    type: "function",
    name: "sendMessage",
    inputs: [
      { name: "_target", type: "address" },
      { name: "_message", type: "bytes" },
      { name: "_gasLimit", type: "uint32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export function tryParseOptimismSendMessage(
  targetIndex: number,
  calldata: `0x${string}`
): CrossChainExecutionJob | null {
  try {
    const decoded = decodeFunctionData({
      abi: messengerAbi,
      data: calldata,
    });
    if (decoded.functionName !== "sendMessage") return null;

    const [target, message] = decoded.args as readonly [
      `0x${string}`,
      `0x${string}`,
      number,
    ];

    const bridge = BridgeKind.OPTIMISM_SEND_MESSAGE;

    return {
      bridge,
      destinationChainId: OPTIMISM_CHAIN_ID,
      sourceActionIndex: targetIndex,
      steps: [
        {
          label: "optimism_message_execution",
          buildPayload: ({ simulationTimestamp }) => ({
            network_id: String(OPTIMISM_CHAIN_ID),
            from: DEFAULT_SIMULATION_FROM,
            to: target,
            input: message,
            gas: BLOCK_GAS_LIMIT,
            gas_price: "0",
            value: "0",
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
