export function parseProposalType(
  proposalData: string
): "STANDARD" | "APPROVAL" {
  const data = JSON.parse(proposalData);
  if (Array.isArray(data)) {
    return "APPROVAL";
  }
  return "STANDARD";
}
