import { formatNumber } from "@/lib/utils";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalStateAdmin } from "@/components/Proposals/ProposalStateAdmin";
import OptimisticProposalVotesCard from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/OptimisticProposalVotesCard";
import {
  calculateOptimisticProposalMetrics,
  ParsedProposalData,
} from "@/lib/proposalUtils";
import Tenant from "@/lib/tenant/tenant";
import { Proposal } from "@/lib/types/proposal";
import { TaxFormBanner } from "../TaxFormBanner";

export default function OPProposalPage({
  proposal,
  votableSupply = "",
}: {
  proposal: Proposal;
  votableSupply?: string;
}) {
  const tokenDecimals = Tenant.current().token.decimals;

  const { againstRelativeAmount, status } = calculateOptimisticProposalMetrics(
    proposal,
    votableSupply
  );

  const againstLengthString = formatNumber(
    (proposal.proposalResults as any)?.against || "0",
    tokenDecimals,
    0,
    true
  );

  const proposalData =
    proposal.proposalData as ParsedProposalData["OPTIMISTIC"]["kind"];
  const disapprovalThreshold = proposalData.disapprovalThreshold;

  return (
    <div className="flex flex-col">
      <TaxFormBanner proposal={proposal} />
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-0 md:gap-16 justify-between items-start max-w-[76rem] flex-col md:flex-row md:items-start md:justify-between">
        <div className="w-full proposal-description pb-6 md:pb-0">
          <ProposalDescription proposal={proposal} />
        </div>
        <div className="w-full md:max-w-[24rem]">
          <OptimisticProposalVotesCard
            proposal={proposal}
            againstRelativeAmount={againstRelativeAmount.toString()}
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
