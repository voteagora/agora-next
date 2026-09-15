import { ZERO_ADDRESS } from "@/lib/constants";

/**
 * 4-byte selector for `getMinDelay()` on the timelock. Governors with scopes
 * reject proposals with empty calldata, so signal-only proposals are created
 * with this harmless read call as a placeholder transaction.
 */
export const NO_OP_TIMELOCK_CALLDATA = "0xf27a0c92";

type TransactionLike = {
  target: string;
  calldata: string;
  value?: string | number | bigint | null;
};

const isZeroValue = (value: TransactionLike["value"]) =>
  value === undefined || value === null || value === "" || BigInt(value) === 0n;

/**
 * Detects the placeholder transaction appended by the proposal creation flow
 * when a BASIC proposal has no transactions attached.
 */
export const isNoOpTransaction = (
  tx: TransactionLike,
  timelockAddress?: string | null
): boolean => {
  if (!isZeroValue(tx.value)) return false;

  const target = tx.target?.toLowerCase();
  const calldata = tx.calldata?.toLowerCase();

  if (target === ZERO_ADDRESS && (calldata === "0x" || calldata === "")) {
    return true;
  }

  return (
    !!timelockAddress &&
    target === timelockAddress.toLowerCase() &&
    calldata === NO_OP_TIMELOCK_CALLDATA
  );
};

/**
 * Strips no-op placeholder transactions from parallel transaction arrays so
 * signal-only proposals render as having no transactions.
 */
export const stripNoOpTransactions = <
  T extends {
    targets: string[];
    calldatas: string[];
    values: (string | number)[];
    signatures?: string[];
    descriptions?: string[];
  },
>(
  data: T,
  timelockAddress?: string | null
): T => {
  const keep = data.targets.map(
    (target, idx) =>
      !isNoOpTransaction(
        {
          target,
          calldata: data.calldatas[idx] ?? "0x",
          value: data.values[idx] ?? 0,
        },
        timelockAddress
      )
  );

  if (keep.every(Boolean)) return data;

  const filter = <U>(arr: U[] | undefined) =>
    arr?.filter((_, idx) => keep[idx] ?? true);

  return {
    ...data,
    targets: filter(data.targets),
    calldatas: filter(data.calldatas),
    values: filter(data.values),
    signatures: filter(data.signatures),
    descriptions: filter(data.descriptions),
  };
};
