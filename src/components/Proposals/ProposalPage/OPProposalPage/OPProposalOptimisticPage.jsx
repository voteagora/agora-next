import { fetchDelegate as apiFetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { fetchDelegateStatement as apiFetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import { fetchVotableSupply as apiFetchVoteableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { fetchVotersWhoHaveNotVotedForProposal } from "@/app/proposals/actions";
import { disapprovalThreshold } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { formatUnits } from "ethers";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import OptimisticProposalVotesCard from "../../ProposalPage/OPProposalPage/ProposalVotesCard/OptimisticProposalVotesCard";
import { ProposalStateAdmin } from "@/app/proposals/components/ProposalStateAdmin";

async function fetchProposalVotes(proposalId, pagintaion) {
  "use server";

  return fetchVotesForProposal({ proposalId, pagintaion });
}

async function fetchDelegate(addressOrENSName) {
  "use server";

  return await apiFetchDelegate(addressOrENSName);
}

async function fetchUserVotesForProposal(proposalId, address) {
  "use server";

  return await apiFetchUserVotesForProposal({
    proposalId,
    address,
  });
}

async function fetchVotableSupply() {
  "use server";

  return apiFetchVoteableSupply();
}

async function fetchDelegateStatement(addressOrENSName) {
  "use server";

  return await apiFetchDelegateStatement(addressOrENSName);
}

async function fetchCurrentDelegators(addressOrENSName) {
  "use server";

  return apiFetchCurrentDelegators(addressOrENSName);
}

export default async function OPProposalPage({ proposal }) {
  const votableSupply = await fetchVotableSupply();
  const proposalVotes = await fetchProposalVotes(proposal.id, {
    limit: 250,
    offset: 0,
  });
  const nonVoters = await fetchVotersWhoHaveNotVotedForProposal(proposal.id);

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
        <ProposalDescription
          proposalVotes={proposalVotes}
          proposal={proposal}
        />
        <OptimisticProposalVotesCard
          proposal={proposal}
          proposalVotes={proposalVotes}
          nonVoters={nonVoters}
          againstRelativeAmount={againstRelativeAmount}
          againstLengthString={againstLengthString}
          disapprovalThreshold={disapprovalThreshold}
          fetchProposalVotes={fetchProposalVotes}
          fetchDelegate={fetchDelegate}
          fetchDelegateStatement={fetchDelegateStatement}
          fetchUserVotesForProposal={fetchUserVotesForProposal}
          fetchCurrentDelegators={fetchCurrentDelegators}
          status={status}
        />
      </div>
    </div>
  );
}
