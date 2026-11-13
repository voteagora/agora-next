import { describe, expect, it, vi } from "vitest";
import { Block } from "ethers";

// blockTimes.ts reads Tenant.current() at module load; emulate CIVIC on Base.
vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      namespace: "civic",
      ui: {
        toggle: (_name: string) => ({ enabled: false }),
      },
      contracts: {
        token: { chain: { id: 8453 } },
      },
    }),
  },
}));

import {
  blocksToSeconds,
  getHumanBlockTime,
  getSecondsPerBlock,
  secondsToBlocks,
} from "@/lib/blockTimes";

// Real Base mainnet anchors. Blocks before 53556127 are 2s apart; from
// 53556127 on they are 200ms apart (ten blocks share each 2s span).
const SWITCH_BLOCK = 53556127;
const SWITCH_TS = 1793901601;
const latestBlock = {
  number: 55270538,
  timestamp: 1794244483,
} as Block;

const toSeconds = (date: Date) => Math.round(date.getTime() / 1000);

describe("blockTimes on Base (chain 8453)", () => {
  it("uses 200ms blocks for Base mainnet and sepolia", () => {
    expect(getSecondsPerBlock(8453)).toBe(0.2);
    expect(getSecondsPerBlock(84532)).toBe(0.2);
  });

  it("converts durations at the current rate", () => {
    expect(secondsToBlocks(3600)).toBe(18000);
    expect(blocksToSeconds(1800)).toBe(360);
  });

  it("estimates blocks after the switch at 200ms", () => {
    expect(toSeconds(getHumanBlockTime(SWITCH_BLOCK, latestBlock))).toBe(
      SWITCH_TS
    );
    expect(toSeconds(getHumanBlockTime(SWITCH_BLOCK + 10, latestBlock))).toBe(
      1793901603
    );
  });

  it("estimates blocks before the switch at 2s", () => {
    expect(toSeconds(getHumanBlockTime(SWITCH_BLOCK - 1, latestBlock))).toBe(
      1793901599
    );
    const deploymentBlock = 48296940; // CIVIC membership token
    expect(toSeconds(getHumanBlockTime(deploymentBlock, latestBlock))).toBe(
      SWITCH_TS - (SWITCH_BLOCK - deploymentBlock) * 2
    );
  });

  it("projects future blocks at 200ms", () => {
    const oneHourAhead = Number(latestBlock.number) + 18000;
    expect(toSeconds(getHumanBlockTime(oneHourAhead, latestBlock))).toBe(
      latestBlock.timestamp + 3600
    );
  });

  it("accepts bigint and string block numbers", () => {
    expect(
      toSeconds(getHumanBlockTime(BigInt(SWITCH_BLOCK), latestBlock))
    ).toBe(SWITCH_TS);
    expect(
      toSeconds(getHumanBlockTime(String(SWITCH_BLOCK), latestBlock))
    ).toBe(SWITCH_TS);
  });
});
