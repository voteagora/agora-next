export type CallFrame = {
  type: string;
  from: string;
  to?: string;
  value?: string;
  gas?: string;
  gasUsed?: string;
  input: string;
  output?: string;
  error?: string;
  calls?: CallFrame[];
};

export function parseCallTracerResult(raw: unknown): CallFrame | null {
  if (raw === null || raw === undefined) {
    return null;
  }
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as CallFrame;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object") {
    return raw as CallFrame;
  }
  return null;
}

type EthMove = { from: string; to: string; valueWei: bigint; path: string[] };

function collectCallEthMoves(
  frame: CallFrame,
  path: string[],
  out: EthMove[]
): void {
  const v = frame.value;
  if (v && v !== "0x0" && v !== "0x") {
    const wei = BigInt(v);
    if (wei > 0n && frame.to) {
      out.push({
        from: frame.from,
        to: frame.to,
        valueWei: wei,
        path: [...path, `${frame.type}`],
      });
    }
  }
  if (frame.calls) {
    for (let i = 0; i < frame.calls.length; i++) {
      collectCallEthMoves(
        frame.calls[i]!,
        path.concat(`${frame.type}[${i}]`),
        out
      );
    }
  }
}

export function flattenEthMovesFromTrace(root: CallFrame | null): EthMove[] {
  if (!root) {
    return [];
  }
  const out: EthMove[] = [];
  collectCallEthMoves(root, [root.type], out);
  return out;
}
