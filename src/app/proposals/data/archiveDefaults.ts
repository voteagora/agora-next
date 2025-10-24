export const ARCHIVE_PROPOSAL_DEFAULTS = {
  quorum: {
    optimism: "30000000000000000000000000", // 30M tokens
    cyber: "1000000000000000000000", // 1000 tokens
    pguild: "1000000000000000000000", // 1000 tokens
    default: "0",
  },
  votableSupply: {
    optimism: "1000000000000000000000000000", // 1B tokens
    cyber: "100000000000000000000000000", // 100M tokens
    pguild: "100000000000000000000000000", // 100M tokens
    default: "0",
  },
  approvalThreshold: "5100", // 51%
  description: "# Proposal\n\nNo description available.",
  title: "Untitled Proposal",
};

export function getArchiveDefaultForNamespace(
  defaults: Record<string, string>,
  namespace?: string | null,
  fallback: string = "0"
) {
  if (!namespace) {
    return defaults.default ?? fallback;
  }

  return defaults[namespace] ?? defaults.default ?? fallback;
}
