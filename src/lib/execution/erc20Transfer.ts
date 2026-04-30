import { decodeEventLog, type Log } from "viem";

export const TRANSFER_EVENT_ABI = [
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
] as const;

export const TRANSFER_TOPIC =
  `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef` as const;

export function tryDecodeErc20Transfer(
  log: Log
): { from: `0x${string}`; to: `0x${string}`; value: bigint } | null {
  if (log.topics[0]?.toLowerCase() !== TRANSFER_TOPIC) {
    return null;
  }
  if (log.topics.length !== 3) {
    return null;
  }
  try {
    const decoded = decodeEventLog({
      abi: TRANSFER_EVENT_ABI,
      data: log.data,
      topics: log.topics,
    });
    if (!decoded.args) return null;
    const { from, to, value } = decoded.args as {
      from: `0x${string}`;
      to: `0x${string}`;
      value: bigint;
    };
    return { from, to, value };
  } catch {
    return null;
  }
}
