import type { DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { hashStableJson } from "@/lib/crypto/stableJson";
import { sanitizeContent } from "@/lib/sanitizationUtils";

export const DELEGATE_STATEMENT_SIWE_SIGNATURE_MARKER = "siwe:jwt";

export function buildStoredDelegateStatementPayload(
  delegateStatement: DelegateStatementFormValues
) {
  const { email: _email, delegateStatement: statement, ...rest } =
    delegateStatement;

  return {
    ...rest,
    delegateStatement: sanitizeContent(statement),
  };
}

export function getDelegateStatementPayloadHash(payload: unknown) {
  return hashStableJson(payload);
}
