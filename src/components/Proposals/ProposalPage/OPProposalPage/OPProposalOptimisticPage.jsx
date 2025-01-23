import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { disapprovalThreshold } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { formatUnits } from "ethers";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";
import OptimisticProposalVotesCard from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/OptimisticProposalVotesCard";

export default async function OPProposalPage({ proposal }) {
  const votableSupply = await fetchVotableSupply();
  const formattedVotableSupply = Number(
    BigInt(votableSupply) / BigInt(10 ** 18)
  );

  const againstLengthString = formatNumber(
    proposal.proposalResults.against,
    18,
    0
  );
  const againstLength = Number(
    formatUnits(proposal.proposalResults.against, 18)
  );

  const againstRelativeAmount = parseFloat(
    ((againstLength / formattedVotableSupply) * 100).toFixed(2)
  );
  const status =
    againstRelativeAmount <= disapprovalThreshold ? "approved" : "defeated";

  return (
    <div className="flex flex-col">
      <ProposalStateAdmin proposal={proposal} />
      <div className="flex gap-16 justify-between items-start max-w-[76rem] flex-col sm:flex-row sm:items-start sm:justify-between">
        <ProposalDescription proposal={proposal} />
        <OptimisticProposalVotesCard
          proposal={proposal}
          againstRelativeAmount={againstRelativeAmount}
          againstLengthString={againstLengthString}
          disapprovalThreshold={disapprovalThreshold}
          status={status}
        />
      </div>
    </div>
  );
}
