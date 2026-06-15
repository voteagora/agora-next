export function getWalletErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.length > 0) {
    return error;
  }

  return fallback;
}

export type WalletErrorDiagnostics = {
  errorName?: string;
  errorCode?: string | number;
  shortMessage?: string;
  errorDetails?: string;
  httpStatus?: number;
  rpcHost?: string;
};

const MAX_ERROR_CAUSE_DEPTH = 6;

function getErrorHost(url: unknown): string | undefined {
  if (typeof url !== "string" || url.length === 0) {
    return undefined;
  }

  try {
    // Host only: RPC URLs can carry a `?secret=` query that must never be sent
    // to a third-party trace.
    return new URL(url).host;
  } catch {
    return undefined;
  }
}

export function getWalletErrorDiagnostics(
  error: unknown
): WalletErrorDiagnostics {
  const diagnostics: WalletErrorDiagnostics = {};
  let current: unknown = error;
  let depth = 0;

  while (
    current &&
    typeof current === "object" &&
    depth < MAX_ERROR_CAUSE_DEPTH
  ) {
    const node = current as Record<string, unknown>;

    if (diagnostics.errorName === undefined && typeof node.name === "string") {
      diagnostics.errorName = node.name;
    }
    if (
      diagnostics.shortMessage === undefined &&
      typeof node.shortMessage === "string"
    ) {
      diagnostics.shortMessage = node.shortMessage;
    }
    if (
      diagnostics.errorDetails === undefined &&
      typeof node.details === "string" &&
      node.details.length > 0
    ) {
      diagnostics.errorDetails = node.details;
    }
    if (
      diagnostics.errorCode === undefined &&
      (typeof node.code === "number" || typeof node.code === "string")
    ) {
      diagnostics.errorCode = node.code;
    }
    if (
      diagnostics.httpStatus === undefined &&
      typeof node.status === "number"
    ) {
      diagnostics.httpStatus = node.status;
    }
    if (diagnostics.rpcHost === undefined) {
      const host = getErrorHost(node.url);
      if (host) {
        diagnostics.rpcHost = host;
      }
    }

    current = node.cause;
    depth += 1;
  }

  return diagnostics;
}
