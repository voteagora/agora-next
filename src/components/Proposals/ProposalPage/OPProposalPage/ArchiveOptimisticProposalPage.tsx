import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import OptimisticProposalVotesCard from "./ProposalVotesCard/OptimisticProposalVotesCard";
import { ParsedProposalData } from "@/lib/proposalUtils";
import { formatNumber } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import ArchiveProposalTypeApproval from "../OPProposalPage/ArchiveProposalTypeApproval";

export default function ArchiveOptimisticProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { token } = Tenant.current();
  const tokenDecimals = token.decimals ?? 18;

  // Calculate against relative amount from proposal results
  const proposalResults = proposal.proposalResults as {
    for: bigint;
    against: bigint;
    abstain: bigint;
  } | null;

  const againstVotes = proposalResults?.against ?? 0n;
  const forVotes = proposalResults?.for ?? 0n;
  const totalVotes = Number(againstVotes) + Number(forVotes);

  const againstRelativeAmount =
    totalVotes > 0
      ? (Number(againstVotes) / Number(proposal.votableSupply)) * 100
      : 0;

  const againstLengthString = formatNumber(
    againstVotes.toString(),
    tokenDecimals,
    0,
    true
  );

  // Derive status from proposal status or calculate based on votes
  let status = "approved";
  if (proposal.status === "DEFEATED" || proposal.status === "CANCELLED") {
    status = "defeated";
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <div className="w-full proposal-description pb-8 md:pb-0">
          <ProposalDescription proposal={proposal} />
        </div>
        <div className="w-full md:max-w-[24rem]">
          <ArchiveProposalTypeApproval proposal={proposal} />
          <OptimisticProposalVotesCard
            proposal={proposal}
            againstRelativeAmount={againstRelativeAmount.toFixed(2)}
            againstLengthString={againstLengthString}
            disapprovalThreshold={
              Number(proposal.proposalTypeData?.quorum) / 100
            }
            status={status}
          />
        </div>
      </div>
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
