import type { CrossChainExecutionJob } from "./job-types";
import { tryParseArbitrumRetryable } from "./bridges/arbitrum";
import { tryParseOptimismSendMessage } from "./bridges/optimism";
import { tryParseWormholePublish } from "./bridges/wormhole";

const parsers: Array<
  (
    targetIndex: number,
    calldata: `0x${string}`
  ) => CrossChainExecutionJob | null
> = [
  tryParseArbitrumRetryable,
  tryParseOptimismSendMessage,
  tryParseWormholePublish,
];

export function collectCrossChainJobs(
  calldatas: string[]
): CrossChainExecutionJob[] {
  const jobs: CrossChainExecutionJob[] = [];
  for (let i = 0; i < calldatas.length; i++) {
    const raw = calldatas[i];
    if (!raw || raw === "0x") continue;
    const cd = (raw.startsWith("0x") ? raw : `0x${raw}`) as `0x${string}`;
    for (const parse of parsers) {
      const job = parse(i, cd);
      if (job) {
        jobs.push(job);
        break;
      }
    }
  }
  return jobs;
}
