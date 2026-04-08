import { formatEther } from 'viem';

export function shortenAddress(value: string, size = 4): string {
  if (!value) return '';
  return `${value.slice(0, 2 + size)}...${value.slice(-size)}`;
}

export function formatTokenAmount(value: string | bigint | null | undefined, fractionDigits = 4): string {
  if (value == null) return '0';

  const normalized = typeof value === 'bigint' ? value : BigInt(value);
  const formatted = formatEther(normalized);
  const [whole, decimal = ''] = formatted.split('.');
  const trimmed = decimal.slice(0, fractionDigits).replace(/0+$/, '');

  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function formatUnixDate(seconds: string | null | undefined): string {
  if (!seconds) return 'N/A';
  const date = new Date(Number(seconds) * 1000);
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function supportLabel(support: number): string {
  if (support === 0) return 'Against';
  if (support === 1) return 'For';
  return 'Abstain';
}

export function titleCase(value: string): string {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2');
}
