export const PAYEE_KEY_PRIMARY = "payee_recipient";
export const PAYEE_KEY_FALLBACK = "payee_recipient_0";
export const FORM_COMPLETED_KEY = "form_completed";
export const PAYEE_FORM_URL_KEY = "payee_form_url";
export const COWRIE_VERIFICATION_COMPLETED_KEY =
  "cowrie_verification_completed";

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
