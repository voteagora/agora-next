import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { Proposal } from "@/app/api/common/proposals/proposal";
import OptimisticProposalVotesCard from "./ProposalVotesCard/OptimisticProposalVotesCard";
import { ParsedProposalData, ParsedProposalResults } from "@/lib/proposalUtils";
import { formatNumber } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import OODaoProposalTypeApproval from "../OPProposalPage/OODaoProposalTypeApproval";

export default function OODaoOptimisticProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const { token } = Tenant.current();
  const tokenDecimals = token.decimals ?? 18;

  // Calculate against relative amount from proposal results
  const proposalResults = proposal.proposalResults as
    | ParsedProposalResults["STANDARD"]["kind"]
    | null;

  const againstVotes = BigInt(proposalResults?.against ?? 0);
  const votableSupply = BigInt(proposal.votableSupply ?? 0);

  // Use BigInt math to avoid precision loss with large wei values
  const againstRelativeAmount =
    votableSupply > 0n
      ? Number((againstVotes * 10000n) / votableSupply) / 100
      : 0;

  const againstLengthString = formatNumber(
    againstVotes.toString(),
    tokenDecimals,
    0,
    true
  );

  // Get disapproval threshold from proposalData (already computed during normalization)
  const proposalData =
    proposal.proposalData as ParsedProposalData["OPTIMISTIC"]["kind"];
  const disapprovalThreshold = proposalData?.disapprovalThreshold ?? 0;

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
          <OODaoProposalTypeApproval proposal={proposal} />
          <OptimisticProposalVotesCard
            proposal={proposal}
            againstRelativeAmount={againstRelativeAmount.toFixed(2)}
            againstLengthString={againstLengthString}
            disapprovalThreshold={disapprovalThreshold}
            status={status}
          />
        </div>
      </div>
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
