import { toFunctionSelector } from "viem";

import { BridgeKind } from "../../types";
import type { CrossChainExecutionJob } from "../job-types";

const publishMessageSelector = toFunctionSelector(
  "function publishMessage(uint32,bytes,uint8)"
);

export function tryParseWormholePublish(
  targetIndex: number,
  calldata: `0x${string}`
): CrossChainExecutionJob | null {
  if (calldata.length < 10) return null;
  const head = calldata.slice(0, 10).toLowerCase();
  if (head !== publishMessageSelector.toLowerCase()) return null;

  return {
    bridge: BridgeKind.WORMHOLE,
    destinationChainId: 0,
    sourceActionIndex: targetIndex,
    steps: [],
  };
}
