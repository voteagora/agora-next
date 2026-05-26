export type MiradorEventSeverity = "info" | "warn" | "error";

const USER_CANCELLATION_ERROR_CODES = new Set([
  "4001",
  "ACTION_REJECTED",
  "USER_REJECTED",
  "exited_link_flow",
  "exited_update_flow",
]);

const USER_CANCELLATION_MESSAGE_PATTERNS = [
  "user rejected",
  "user denied",
  "denied transaction signature",
  "denied message signature",
  "rejected the request",
  "rejected signature",
  "exited_link_flow",
  "exited_update_flow",
];

function collectDetailValues(value: unknown, values: string[], depth = 0) {
  if (value == null || depth > 4) {
    return;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    values.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectDetailValues(item, values, depth + 1);
    }
    return;
  }

  if (typeof value === "object") {
    const errorLike = value as {
      name?: unknown;
      message?: unknown;
      shortMessage?: unknown;
      details?: unknown;
      code?: unknown;
      errorCode?: unknown;
      cause?: unknown;
    };

    for (const directValue of [
      errorLike.name,
      errorLike.message,
      errorLike.shortMessage,
      errorLike.details,
      errorLike.code,
      errorLike.errorCode,
    ]) {
      if (directValue !== undefined) {
        collectDetailValues(directValue, values, depth + 1);
      }
    }

    if (errorLike.cause !== undefined) {
      collectDetailValues(errorLike.cause, values, depth + 1);
    }

    for (const [key, nestedValue] of Object.entries(
      value as Record<string, unknown>
    )) {
      if (key === "code" || key === "errorCode") {
        values.push(`${nestedValue}`);
      }
      collectDetailValues(nestedValue, values, depth + 1);
    }
  }
}

export function isUserCancellationDetails(
  details?: unknown
): boolean {
  const values: string[] = [];
  collectDetailValues(details, values);

  return values.some((value) => {
    const normalized = value.trim().toLowerCase();
    return (
      USER_CANCELLATION_ERROR_CODES.has(value) ||
      USER_CANCELLATION_ERROR_CODES.has(normalized.toUpperCase()) ||
      USER_CANCELLATION_MESSAGE_PATTERNS.some((pattern) =>
        normalized.includes(pattern)
      )
    );
  });
}

export function inferMiradorEventSeverity(
  eventName: string,
  details?: unknown
): MiradorEventSeverity {
  if (isUserCancellationDetails(details)) {
    return "info";
  }

  if (eventName.endsWith("_failed") || eventName.endsWith("_error")) {
    return "error";
  }

  if (
    eventName.endsWith("_skipped") ||
    eventName.includes("_mismatch") ||
    eventName.endsWith("_replaced")
  ) {
    return "warn";
  }

  return "info";
}
