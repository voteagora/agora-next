export type DelegateStatementAuthMode = "siwe_jwt" | "signed_message";

export type DelegateStatementAuthPayload =
  | {
      kind: "siwe_jwt";
      jwt: string;
    }
  | {
      kind: "signed_message";
      signature: `0x${string}`;
      chainId: number;
    };

const DEFAULT_DELEGATE_STATEMENT_AUTH_MODE: DelegateStatementAuthMode =
  "signed_message";

function isSiweEnabled() {
  return process.env.NEXT_PUBLIC_SIWE_ENABLED === "true";
}

export function getDelegateStatementAuthMode(): DelegateStatementAuthMode {
  const configuredMode = process.env.NEXT_PUBLIC_DELEGATE_STATEMENT_AUTH_MODE;

  if (configuredMode === "signed_message") {
    return "signed_message";
  }

  if (configuredMode === "siwe_jwt" && isSiweEnabled()) {
    return "siwe_jwt";
  }

  return DEFAULT_DELEGATE_STATEMENT_AUTH_MODE;
}

export function isDelegateStatementSiweAuthMode() {
  return getDelegateStatementAuthMode() === "siwe_jwt";
}
