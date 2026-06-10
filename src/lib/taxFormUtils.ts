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

// Per-payee info extracted from metadata
export type PayeeBannerInfo = {
  address: string;
  index: number;
  isFormCompleted: boolean;
  paymentType: string | null;
  paymentAmount: string | null;
  txHash: string | null;
};

/**
 * Extract all payees from proposal metadata. Handles:
 * - New per-payee indexed keys (payee_recipient_0, _1, …)
 * - Legacy comma-separated `payee_recipient` key
 * - Legacy single `payee_recipient` / `payee_recipient_0`
 */
export const extractPayeesFromMetadata = (
  metadata: Record<string, unknown>
): PayeeBannerInfo[] => {
  // Collect addresses from indexed keys
  const indexed: { index: number; address: string }[] = [];
  for (const key of Object.keys(metadata)) {
    const match = key.match(/^payee_recipient_(\d+)$/);
    if (match && metadata[key]) {
      const rawVal = metadata[key];
      const addr =
        typeof rawVal === "string"
          ? rawVal.trim()
          : typeof rawVal === "object" && rawVal !== null
            ? ((rawVal as { address?: string; value?: string }).address ??
              (rawVal as { address?: string; value?: string }).value ??
              "")
            : rawVal != null
              ? String(rawVal)
              : "";
      if (addr) indexed.push({ index: parseInt(match[1], 10), address: addr });
    }
  }

  if (indexed.length > 0) {
    indexed.sort((a, b) => a.index - b.index);
    return indexed.map(({ address, index }) => ({
      address: normalizeAddress(address) ?? address,
      index,
      isFormCompleted: resolvePayeeFormCompleted(metadata, index, false),
      paymentType: resolvePayeeType(metadata, index, false),
      paymentAmount: resolvePayeeAmount(metadata, index, false),
      txHash: resolvePayeeTxHash(metadata, index),
    }));
  }

  // Fall back to legacy un-suffixed key (may be comma-separated)
  const legacyRaw = metadata[PAYEE_KEY_PRIMARY] ?? metadata[PAYEE_KEY_FALLBACK];
  if (!legacyRaw) return [];

  const legacyStr =
    typeof legacyRaw === "string"
      ? legacyRaw
      : typeof legacyRaw === "object" && legacyRaw !== null
        ? ((legacyRaw as { address?: string; value?: string }).address ??
          (legacyRaw as { address?: string; value?: string }).value ??
          "")
        : String(legacyRaw);

  const addrs = legacyStr
    .split(",")
    .map((a) => a.trim())
    .filter((a) => a.length > 0);

  if (addrs.length === 0) return [];

  const isSingle = addrs.length === 1;
  return addrs.map((addr, i) => ({
    address: normalizeAddress(addr) ?? addr,
    index: i,
    isFormCompleted: resolvePayeeFormCompleted(metadata, i, isSingle),
    paymentType: resolvePayeeType(metadata, i, isSingle),
    paymentAmount: resolvePayeeAmount(metadata, i, isSingle),
    txHash: resolvePayeeTxHash(metadata, i),
  }));
};

function resolvePayeeFormCompleted(
  metadata: Record<string, unknown>,
  index: number,
  isLegacySingle: boolean
): boolean {
  // Per-payee manual status
  const perPayeeManual = metadata[`tax_form_manual_status_${index}`];
  if (perPayeeManual === "complete" || perPayeeManual === "done") return true;
  if (perPayeeManual === "pending" || perPayeeManual === "not_done")
    return false;

  // Legacy single-payee: check un-suffixed manual status
  if (isLegacySingle && index === 0 && perPayeeManual === undefined) {
    const globalManual = metadata[TAX_FORM_MANUAL_STATUS_KEY];
    if (globalManual === "complete" || globalManual === "done") return true;
    if (globalManual === "pending" || globalManual === "not_done") return false;
  }

  // Per-payee Cowrie / form_completed
  const cowrieKey = `cowrie_verification_completed_${index}`;
  const formKey = `form_completed_${index}`;
  const cowrieVal = metadata[cowrieKey];
  const formVal = metadata[formKey];

  if (cowrieVal !== undefined) return normalizeBoolean(cowrieVal);
  if (formVal !== undefined) return normalizeBoolean(formVal);

  // Legacy single-payee: fall back to global keys
  if (isLegacySingle && index === 0) {
    if (hasOwn(metadata, COWRIE_VERIFICATION_COMPLETED_KEY)) {
      return normalizeBoolean(metadata[COWRIE_VERIFICATION_COMPLETED_KEY]);
    }
    return normalizeBoolean(metadata[FORM_COMPLETED_KEY]);
  }

  return false;
}

function resolvePayeeTxHash(
  metadata: Record<string, unknown>,
  index: number
): string | null {
  const val = metadata[`payee_tx_hash_${index}`];
  return typeof val === "string" && val ? val : null;
}

function resolvePayeeType(
  metadata: Record<string, unknown>,
  index: number,
  isLegacySingle: boolean
): string | null {
  const val = metadata[`payment_type_${index}`];
  if (typeof val === "string" && val) return val;
  if (isLegacySingle && index === 0) {
    const global = metadata.payment_type;
    return typeof global === "string" && global ? global : null;
  }
  return null;
}

function resolvePayeeAmount(
  metadata: Record<string, unknown>,
  index: number,
  isLegacySingle: boolean
): string | null {
  const val = metadata[`payment_amount_${index}`];
  if (typeof val === "string" && val) return val;
  if (isLegacySingle && index === 0) {
    const global = metadata.payment_amount;
    return typeof global === "string" && global ? global : null;
  }
  return null;
}

/**
 * Legacy helper: extract a single payee address from metadata.
 * Used by Cowrie integration and older code paths.
 */
export const extractPayeeFromMetadata = (
  metadata: Record<string, unknown>
): {
  hasPayeeKey: boolean;
  payeeAddress?: string;
} => {
  const payees = extractPayeesFromMetadata(metadata);
  return {
    hasPayeeKey: payees.length > 0,
    payeeAddress: payees[0]?.address,
  };
};
