import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  archiveToProposal,
  ArchiveProposalInput,
  NormalizeArchiveOptions,
} from "@/lib/proposals";

export async function normalizeArchiveProposal(
  proposal: ArchiveProposalInput,
  options: NormalizeArchiveOptions = {}
): Promise<Proposal> {
  return await archiveToProposal(proposal, options);
}
