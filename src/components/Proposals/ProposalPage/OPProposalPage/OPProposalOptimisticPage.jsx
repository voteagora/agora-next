import { fetchDelegate as apiFetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { fetchDelegateStatement as apiFetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import { fetchCurrentDelegators as apiFetchCurrentDelegators } from "@/app/api/common/delegations/getDelegations";
import { fetchVotableSupply as apiFetchVoteableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { HStack } from "@/components/Layout/Stack";
import { disapprovalThreshold } from "@/lib/constants";
import { formatNumber } from "@/lib/utils";
import { formatUnits } from "ethers";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import OpManagerDeleteProposal from "./OpManagerDeleteProposal";
import styles from "./OPProposalPage.module.scss";
import OptimisticProposalVotesCard from "../../ProposalPage/OPProposalPage/ProposalVotesCard/OptimisticProposalVotesCard";

async function fetchProposalVotes(proposal_id, page = 1) {
  "use server";

  return fetchVotesForProposal({ proposal_id, page });
}

async function fetchDelegate(addressOrENSName) {
  "use server";

  return await apiFetchDelegate(addressOrENSName);
}

async function fetchUserVotesForProposal(proposal_id, address) {
  "use server";

  return await apiFetchUserVotesForProposal({
    proposal_id,
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
  const proposalVotes = await fetchProposalVotes(proposal.id);

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
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <HStack
      gap={16}
      justifyContent="justify-between"
      alignItems="items-start"
      className={styles.proposal_container}
    >
      <ProposalDescription proposalVotes={proposalVotes} proposal={proposal} />
      <div>
        <OpManagerDeleteProposal proposal={proposal} />
        <OptimisticProposalVotesCard
          proposal={proposal}
          proposalVotes={proposalVotes}
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
    </HStack>
  );
}
