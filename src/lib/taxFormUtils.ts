export const PAYEE_KEY_PRIMARY = "payee_recipient";
export const PAYEE_KEY_FALLBACK = "payee_recipient_0";
export const FORM_COMPLETED_KEY = "form_completed";
export const PAYEE_FORM_URL_KEY = "payee_form_url";
export const COWRIE_VERIFICATION_COMPLETED_KEY =
  "cowrie_verification_completed";
export const EXECUTION_TRANSACTIONS_KEY = "execution_transactions";
export const TAX_FORM_MANUAL_STATUS_KEY = "tax_form_manual_status";

// Chain ID to block explorer URL mapping
export const CHAIN_EXPLORERS: Record<number, string> = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io",
  10: "https://optimistic.etherscan.io",
  42161: "https://arbiscan.io",
  137: "https://polygonscan.com",
  8453: "https://basescan.org",
};

export const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  11155111: "Sepolia",
  10: "Optimism",
  42161: "Arbitrum",
  137: "Polygon",
  8453: "Base",
};

export const getExplorerTxUrl = (chainId: number, txHash: string): string => {
  const baseUrl = CHAIN_EXPLORERS[chainId] || CHAIN_EXPLORERS[1];
  return `${baseUrl}/tx/${txHash}`;
};

const hasOwn = (metadata: Record<string, unknown>, key: string) =>
  Object.prototype.hasOwnProperty.call(metadata, key);

export const normalizeAddress = (value?: string | null) => {
  if (!value) return undefined;
  return value
    .trim()
    .replace(/^"+|"+$/g, "")
    .toLowerCase();
};

export const addressesMatch = (a?: string | null, b?: string | null) => {
  const na = normalizeAddress(a);
  const nb = normalizeAddress(b);
  if (!na || !nb) return false;
  return na === nb;
};

export const normalizeBoolean = (value: unknown): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  if (typeof value === "number") return value !== 0;
  return false;
};

export const extractPayeeFromMetadata = (
  metadata: Record<string, unknown>
): {
  hasPayeeKey: boolean;
  payeeAddress?: string;
} => {
  const hasPrimary = hasOwn(metadata, PAYEE_KEY_PRIMARY);
  const hasFallback = hasOwn(metadata, PAYEE_KEY_FALLBACK);
  const hasPayeeKey = hasPrimary || hasFallback;

  const payeeRaw =
    (metadata[PAYEE_KEY_PRIMARY] as unknown) ??
    (metadata[PAYEE_KEY_FALLBACK] as unknown);

  const payeeValue =
    typeof payeeRaw === "string"
      ? payeeRaw
      : typeof payeeRaw === "object" && payeeRaw !== null
        ? ((payeeRaw as { address?: string; value?: string }).address ??
          (payeeRaw as { address?: string; value?: string }).value)
        : payeeRaw != null
          ? String(payeeRaw)
          : undefined;

  return {
    hasPayeeKey,
    payeeAddress: normalizeAddress(payeeValue),
  };
};
