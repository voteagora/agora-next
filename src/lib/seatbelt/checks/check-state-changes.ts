import { getAddress } from "@ethersproject/address";
import { bullet } from "../report";
import type { ProposalCheck, StateDiff } from "../types";
import { getContractName } from "../simulate";
import { decodeStorageSlot } from "../../seatbelt/encode-state";

/**
 * Reports all state changes from the proposal
 */
export const checkStateChanges: ProposalCheck = {
  name: "Reports all state changes from the proposal",
  async checkProposal(_, sim, deps) {
    const info: string[] = [];
    const warnings = [];
    // Check if the transaction reverted, and if so return revert reason
    if (!sim.transaction.status) {
      const txInfo = sim.transaction.transaction_info;
      const callTraceError = txInfo.call_trace.error_reason;
      const reason = callTraceError
        ? callTraceError
        : txInfo.stack_trace
          ? txInfo.stack_trace[0].error_reason
          : "unknown error";
      const error = `Transaction reverted with reason: ${reason}`;
      return { info: [], warnings: [], errors: [error] };
    }

    // State diffs in the simulation are an array, so first we organize them by address. We skip
    // recording state changes for (1) the `queuedTransactions` mapping of the timelock, and
    // (2) the `proposal.executed` change of the governor, because this will be consistent across
    // all proposals and mainly add noise to the output
    if (!sim.transaction.transaction_info.state_diff) {
      const warnings = "State diff is empty";
      return { info: [], warnings: [warnings], errors: [] };
    }

    const stateDiffs = sim.transaction.transaction_info.state_diff.reduce(
      (diffs, diff) => {
        const addr = getAddress(diff.raw[0].address);
        // Check if this is a diff that should be filtered out
        const isGovernor = getAddress(addr) === deps.governor.address;
        const isProposalsVar =
          diff.soltype?.name === "proposals" ||
          diff.soltype?.name === "_proposals";
        const isTimelock = getAddress(addr) === deps.timelock.address;
        const isTimelockTimestamps = diff.soltype?.name === "_timestamps";
        const isQueuedTx = diff.soltype?.name.includes("queuedTransactions");
        const isExecutedSlot =
          diff.raw[0].original ===
            "0x0000000000000000000000000000000000000000000000000000000000000000" &&
          diff.raw[0].dirty ===
            "0x0000000000000000000000000000000000000000000000000000000000000100";

        const shouldSkipDiff =
          (isGovernor && isProposalsVar) ||
          (isGovernor && isExecutedSlot) ||
          (isTimelock && isQueuedTx) ||
          (isTimelock && isTimelockTimestamps);

        // Skip diffs as required and add the rest to our diffs object
        if (shouldSkipDiff) return diffs;
        if (!diffs[addr]) {
          diffs[addr] = [diff];
        } else {
          diffs[addr].push(diff);
        }
        return diffs;
      },
      {} as Record<string, StateDiff[]>
    );

    // Return if no state diffs to show
    if (!Object.keys(stateDiffs).length)
      return { info: ["No state changes"], warnings: [], errors: [] };

    // Parse state changes at each address
    // ETH balance changes are now handled by the checkEthBalanceChanges module
    for (const [address, diffs] of Object.entries(stateDiffs)) {
      // Use contracts array to get contract name of address
      const contract = sim.contracts.find((c) => c.address === address);
      info.push(bullet(getContractName(contract)));

      // Track processed state changes to deduplicate
      const processedChanges = new Set<string>();

      // Parse each diff. A single diff may involve multiple storage changes, e.g. a proposal that
      // executes three transactions will show three state changes to the `queuedTransactions`
      // mapping within a single `diff` element. We always JSON.stringify the values so structs
      // (i.e. tuples) don't print as [object Object]
      for (const diff of diffs) {
        if (!diff.soltype) {
          // In this branch, state change is not decoded, so return raw data of each storage write
          // (all other branches have decoded state changes)
          for (const w of diff.raw) {
            const oldVal = JSON.stringify(w.original);
            const newVal = JSON.stringify(w.dirty);
            const changeKey = `${w.key}:${oldVal}:${newVal}`;
            if (!processedChanges.has(changeKey)) {
              // Try to decode the storage slot
              const decodedPath = contract
                ? await decodeStorageSlot(
                    contract.address,
                    w.key,
                    sim.transaction.network_id
                  )
                : null;

              if (decodedPath) {
                // If we successfully decoded the path, show it in a more readable format
                info.push(
                  bullet(
                    `\`${decodedPath}\` (slot \`${w.key}\`) changed from \`${oldVal}\` to \`${newVal}\``,
                    1
                  )
                );
              } else {
                // If decoding failed, show the raw slot
                info.push(
                  bullet(
                    `Storage slot \`${w.key}\` changed from \`${oldVal}\` to \`${newVal}\``,
                    1
                  )
                );
              }
              processedChanges.add(changeKey);
            }
          }
        } else if (diff.soltype.simple_type) {
          // This is a simple type with a single changed value
          const oldVal =
            typeof diff.original === "object"
              ? JSON.stringify(diff.original)
              : String(diff.original);
          const newVal =
            typeof diff.dirty === "object"
              ? JSON.stringify(diff.dirty)
              : String(diff.dirty);
          const changeKey = `${diff.soltype.name}:${oldVal}:${newVal}`;
          if (!processedChanges.has(changeKey)) {
            info.push(
              bullet(
                `\`${diff.soltype.name}\` changed from \`${oldVal}\` to \`${newVal}\``,
                1
              )
            );
            processedChanges.add(changeKey);
          }
        } else if (diff.soltype.type.startsWith("mapping")) {
          // This is a complex type like a mapping, which may have multiple changes. The diff.original
          // and diff.dirty fields can be strings or objects, and for complex types they are objects,
          // so we cast them as such

          // The original object can be null if the key was not present in the original state
          // Unsure if the same can happen to dirty, let's assume its possible to collect all keys
          const keys = Object.keys(diff.original || {}).concat(
            Object.keys(diff.dirty || {})
          );

          const original = diff.original as Record<string, string>;
          const dirty = diff.dirty as Record<string, string>;
          for (const k of keys) {
            const oldVal = JSON.stringify(
              original && k in original ? original[k] : ""
            );
            const newVal = JSON.stringify(dirty && k in dirty ? dirty[k] : "");
            const changeKey = `${diff.soltype?.name}:${k}:${oldVal}:${newVal}`;
            if (!processedChanges.has(changeKey)) {
              info.push(
                bullet(
                  `\`${diff.soltype?.name}\` key \`${k}\` changed from \`${oldVal}\` to \`${newVal}\``,
                  1
                )
              );
              processedChanges.add(changeKey);
            }
          }
        } else {
          // For complex types that we can't decode directly, try to decode each raw slot
          for (const w of diff.raw) {
            // Ensure we properly stringify object values
            const oldVal =
              typeof w.original === "object"
                ? JSON.stringify(w.original)
                : String(w.original);
            const newVal =
              typeof w.dirty === "object"
                ? JSON.stringify(w.dirty)
                : String(w.dirty);

            const changeKey = `${w.key}:${oldVal}:${newVal}`;
            if (!processedChanges.has(changeKey)) {
              // Try to decode the storage slot
              const decodedPath = contract
                ? await decodeStorageSlot(
                    contract.address,
                    w.key,
                    sim.transaction.network_id
                  )
                : null;

              if (decodedPath) {
                info.push(
                  bullet(
                    `\`${decodedPath}\` (slot \`${w.key}\`) changed from \`${oldVal}\` to \`${newVal}\``,
                    1
                  )
                );
              } else {
                info.push(
                  bullet(
                    `Storage slot \`${w.key}\` changed from \`${oldVal}\` to \`${newVal}\``,
                    1
                  )
                );
                warnings.push(
                  `Could not parse state: add support for formatting type ${diff.soltype?.type} (slot ${w.key})`
                );
              }
              processedChanges.add(changeKey);
            }
          }
        }
      }
    }

    return { info, warnings: [], errors: [] };
  },
};
