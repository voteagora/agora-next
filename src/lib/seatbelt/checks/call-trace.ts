import type { FluffyCall } from "../types";

/**
 * Given an array of calls, find the call matching the provided from address and calldata by
 * recursively traversing all calls in the trace. This is required because the call we're looking
 * for is not always at the same depth of the call stack. If all governor `execute` calls were made
 * from an EOA this would be true, but because calls to `execute` can also be made from contracts
 * we don't know the depth of the call containing `calldata`
 *
 * Trace data comes from Tenderly and is not guaranteed to be well formed: some calls have an
 * empty or missing `from`. Those are treated as non-matching rather than validated.
 * @dev Using any[] due to incompatible call types (CallTraceCall, FluffyCall) that share common properties
 */
export function findMatchingCall(
  from: string,
  calldata: string,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  calls: any[] | null | undefined
): FluffyCall | null {
  if (!calls || !calls.length) return null;
  const fromLower = from.toLowerCase();
  const callMatches = (f: unknown, c: unknown) =>
    typeof f === "string" && f.toLowerCase() === fromLower && c === calldata;
  for (const call of calls) {
    if (callMatches(call.from, call.input)) return call;
    if (call.calls) {
      const foundCall = findMatchingCall(from, calldata, call.calls);
      if (foundCall) return foundCall;
    }
  }
  return null;
}
