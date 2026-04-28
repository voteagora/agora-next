export const CALL_INPUT_SELECTOR_LABELS: Record<string, string> = {
  "0xfe0d94c1": "execute",
  "0x0825f38f": "executeTransaction",
  "0xe9e05c42": "depositTransaction",
  "0x3dbb202b": "sendMessage",
};

export function labelCallInputSelector(
  input: string | undefined
): string | null {
  if (!input || input === "0x" || input.length < 10) {
    return null;
  }
  return CALL_INPUT_SELECTOR_LABELS[input.slice(0, 10).toLowerCase()] ?? null;
}
