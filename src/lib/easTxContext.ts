type TxContext = {
  txHash?: string;
  chainId?: number;
  txInputData?: string;
};

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "bigint") {
    return Number(value);
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

export function extractEasTxInputData(tx: unknown): string | undefined {
  if (!tx || typeof tx !== "object") {
    return undefined;
  }

  const txRecord = tx as Record<string, unknown>;
  if (typeof txRecord.data === "string") {
    return txRecord.data;
  }

  if (
    txRecord.data &&
    typeof txRecord.data === "object" &&
    typeof (txRecord.data as { data?: unknown }).data === "string"
  ) {
    return (txRecord.data as { data: string }).data;
  }

  if (
    txRecord.request &&
    typeof txRecord.request === "object" &&
    typeof (txRecord.request as { data?: unknown }).data === "string"
  ) {
    return (txRecord.request as { data: string }).data;
  }

  return undefined;
}

export function extractFailedEasTxContext(error: unknown): TxContext {
  if (!error || typeof error !== "object") {
    return {};
  }

  const errorRecord = error as Record<string, unknown>;
  const receipt =
    errorRecord.receipt && typeof errorRecord.receipt === "object"
      ? (errorRecord.receipt as Record<string, unknown>)
      : undefined;
  const transaction =
    errorRecord.transaction && typeof errorRecord.transaction === "object"
      ? (errorRecord.transaction as Record<string, unknown>)
      : undefined;

  const txHash =
    (typeof errorRecord.txHash === "string" && errorRecord.txHash) ||
    (typeof errorRecord.transactionHash === "string" &&
      errorRecord.transactionHash) ||
    (typeof receipt?.hash === "string" ? receipt.hash : undefined);

  const chainId =
    toOptionalNumber(errorRecord.chainId) ??
    toOptionalNumber(receipt?.chainId) ??
    toOptionalNumber(transaction?.chainId);

  const txInputData =
    (typeof errorRecord.txInputData === "string" && errorRecord.txInputData) ||
    (typeof transaction?.data === "string" ? transaction.data : undefined);

  return {
    txHash,
    chainId,
    txInputData,
  };
}
