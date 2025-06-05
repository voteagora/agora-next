import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { disapprovalThreshold } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { formatUnits } from "ethers";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import HybridOptimisticProposalVotesCard from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/HybridOptimisticProposalVotesCard";
import Tenant from "@/lib/tenant/tenant";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { ParsedProposalResults } from "@/lib/proposalUtils";

export default async function HybridOptimisticProposalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_OPTIMISTIC_TIERED"]["kind"];
  const votableSupply = await fetchVotableSupply();
  const tokenDecimals = Tenant.current().token.decimals;
  const formattedVotableSupply = Number(
    BigInt(votableSupply) / BigInt(10 ** tokenDecimals)
  );

  // Calculate total against votes from all tiers
  const delegatesAgainst = proposalResults?.DELEGATES?.against || BigInt(0);
  const chainAgainst = proposalResults?.CHAIN?.against || BigInt(0);
  const projectAgainst = proposalResults?.PROJECT?.against || BigInt(0);
  const userAgainst = proposalResults?.USER?.against || BigInt(0);

  const totalAgainst =
    delegatesAgainst + chainAgainst + projectAgainst + userAgainst;

  const againstLengthString = formatNumber(
    totalAgainst,
    tokenDecimals,
    0,
    true
  );
  const againstLength = Number(formatUnits(totalAgainst, tokenDecimals));
  const againstRelativeAmount = parseFloat(
    ((againstLength / formattedVotableSupply) * 100).toFixed(2)
  );
  const status =
    againstRelativeAmount <= disapprovalThreshold ? "approved" : "defeated";

  return (
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <ProposalDescription proposal={proposal} />
        <div>
          <HybridOptimisticProposalVotesCard proposal={proposal} />
        </div>
      </div>
    </div>
  );
}
