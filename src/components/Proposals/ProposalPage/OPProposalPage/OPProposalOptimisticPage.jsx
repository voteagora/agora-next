import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { disapprovalThreshold } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import OptimisticProposalVotesCard from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/OptimisticProposalVotesCard";
import { calculateOptimisticProposalMetrics } from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";

export default async function OPProposalPage({ proposal }) {
  const votableSupply = await fetchVotableSupply();
  const tokenDecimals = Tenant.current().token.decimals;

  const { againstRelativeAmount, status } = calculateOptimisticProposalMetrics(
    proposal,
    votableSupply
  );

  const againstLengthString = formatNumber(
    proposal.proposalResults?.against || "0",
    tokenDecimals,
    0,
    true
  );

  return (
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <div className="w-full proposal-description pb-6 md:pb-0">
          <ProposalDescription proposal={proposal} />
        </div>
        <div className="w-full md:max-w-[24rem]">
          <OptimisticProposalVotesCard
            proposal={proposal}
            againstRelativeAmount={againstRelativeAmount}
            againstLengthString={againstLengthString}
            disapprovalThreshold={disapprovalThreshold}
            status={status}
          />
        </div>
      </div>
      {/* Mobile-only spacer to prevent overlap with modal */}
      <div className="block md:hidden" style={{ height: 65 }} />
    </div>
  );
}
