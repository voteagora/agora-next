export function formatAddress(address: string): string {
  if (address.length <= 12) return `\`${address}\``;
  return `\`${address.slice(0, 6)}…${address.slice(-4)}\``;
}

export function formatFullAddress(address: string): string {
  return `\`${address}\``;
}

export function formatTokenAmount(
  raw: string | number | bigint,
  decimals: number,
  symbol: string
): string {
  const value =
    typeof raw === "bigint"
      ? Number(raw) / 10 ** decimals
      : typeof raw === "string"
        ? parseFloat(raw) / 10 ** decimals
        : raw / 10 ** decimals;

  const formatted = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

  return `${formatted} ${symbol}`;
}

export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

export function mdTable(
  headers: string[],
  rows: string[][]
): string {
  const headerRow = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const dataRows = rows
    .map((row) => `| ${row.join(" | ")} |`)
    .join("\n");
  return `${headerRow}\n${separator}\n${dataRows}`;
}

export function mdSection(title: string, content: string): string {
  return `## ${title}\n\n${content}`;
}

export function mdBold(text: string): string {
  return `**${text}**`;
}

export function mdStatus(status: string): string {
  const emoji: Record<string, string> = {
    ACTIVE: "🟢",
    PENDING: "🟡",
    SUCCEEDED: "✅",
    DEFEATED: "❌",
    QUEUED: "⏳",
    EXECUTED: "🏁",
    CANCELLED: "🚫",
    CLOSED: "🔒",
  };
  return `${emoji[status] ?? "⚪"} ${status}`;
}

export function textResult(text: string) {
  return {
    content: [{ type: "text" as const, text }],
  };
}

export function errorResult(message: string) {
  return textResult(`❌ Error: ${message}`);
}
