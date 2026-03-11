import { keccak256, stringToBytes } from "viem";

type JsonPrimitive = null | boolean | number | string;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

function normalizeJsonValue(value: unknown): JsonValue {
  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    return value.map((entry) => normalizeJsonValue(entry));
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    const normalized: Record<string, JsonValue> = {};
    for (const [key, entryValue] of entries) {
      normalized[key] = normalizeJsonValue(entryValue);
    }
    return normalized;
  }

  return String(value);
}

export function stableJsonStringify(value: unknown): string {
  return JSON.stringify(normalizeJsonValue(value));
}

export function hashStableJson(value: unknown): `0x${string}` {
  return keccak256(stringToBytes(stableJsonStringify(value)));
}
