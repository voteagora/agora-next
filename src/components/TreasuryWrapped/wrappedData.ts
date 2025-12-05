export interface WrappedHighlight {
  slideNumber: number;
  headline: string;
  insight: string;
  stat: string;
  statLabel: string;
}

export interface WrappedSummaryStat {
  value: string;
  label: string;
}

export interface WrappedData {
  reportId: string;
  title: string;
  period: string;
  pdfUrl: string;
  forumUrl: string;
  highlights: WrappedHighlight[];
  summaryStats: WrappedSummaryStat[];
}

export const wrappedData: WrappedData = {
  reportId: "q3-2025-financial-statement",
  title: "Syndicate Q3 2025 Financial Statement",
  period: "Q3 2025",
  pdfUrl: "/documents/snc-q3-2025-financial-statements.pdf",
  forumUrl: "https://forum.syndicate.io",
  highlights: [
    {
      slideNumber: 1,
      headline: "Treasury, Wrapped",
      insight:
        "You're now the proud steward of a nine-figure onchain treasury. 267 million SYND tokens, valued at fair market.",
      stat: "$138.4M",
      statLabel: "in SYND tokens",
    },
    {
      slideNumber: 2,
      headline: "Running Lean",
      insight:
        "Operating the DUNA cost just $8,800 this quarter - that's 0.006% of the treasury. Token custody and governance management, nothing else.",
      stat: "$8.8K",
      statLabel: "total Q3 expenses",
    },
    {
      slideNumber: 3,
      headline: "Paper Gains",
      insight:
        "Almost everything came from mark-to-market, not from spending. The SYND tokens appreciated $138.3M since the treasury was established.",
      stat: "$138.3M",
      statLabel: "unrealized gains",
    },
    {
      slideNumber: 4,
      headline: "Tax Time",
      insight:
        "Current federal tax estimate: $82K on realized income. The big number - $29M in deferred taxes - only comes due if tokens are sold.",
      stat: "$82K",
      statLabel: "current liability",
    },
  ],
  summaryStats: [
    { value: "$138.4M", label: "SYND token value" },
    { value: "267.2M", label: "SYND tokens held" },
    { value: "$8.8K", label: "Q3 expenses" },
    { value: "$82K", label: "Current tax due" },
  ],
};

export const WRAPPED_STORAGE_KEY = "treasury-wrapped-q3-2025-viewed";
export const WRAPPED_BANNER_STORAGE_KEY =
  "treasury-wrapped-q3-2025-banner-dismissed";
