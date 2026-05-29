import type { MiradorAttributeMap, MiradorAttributeValue } from "./types";

export function toMiradorAttributeString(value: MiradorAttributeValue): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function normalizeMiradorAttributePayload(
  attributes?: MiradorAttributeMap
): Record<string, string> {
  if (!attributes) {
    return {};
  }

  const normalized: Record<string, string> = {};
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null) {
      continue;
    }

    const normalizedValue = toMiradorAttributeString(value);
    if (normalizedValue === "") {
      continue;
    }

    normalized[key] = normalizedValue;
  }

  return normalized;
}
