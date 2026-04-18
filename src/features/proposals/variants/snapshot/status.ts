import type { ProposalStatus } from "@/lib/proposalUtils/proposalStatus";
import type { ParsedProposalResults } from "@/lib/proposalUtils";

export function getSnapshotProposalStatus(
  status: ParsedProposalResults["SNAPSHOT"]["kind"]["status"]
): ProposalStatus {
  return status.toUpperCase() as ProposalStatus;
}
