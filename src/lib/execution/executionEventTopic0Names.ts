import type { Log } from "viem";

const EXECUTION_EVENT_TOPIC0_NAME: Record<string, string> = {
  "0x6c7f3182d7e4cb876251f9ae1489975fdbbf15d9f35d393f2ac9b1ff57cec69f":
    "NewPost",
};

export function getExecutionEventNameForTopic0(
  topic0: `0x${string}` | null | undefined
): string | null {
  if (!topic0) {
    return null;
  }
  return EXECUTION_EVENT_TOPIC0_NAME[topic0.toLowerCase()] ?? null;
}

export function getExecutionEventNameForLog(
  log: Pick<Log, "topics">
): string | null {
  return getExecutionEventNameForTopic0(log.topics[0] ?? null);
}
