import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalApprovalPage.module.scss";
import ApprovalVotesPanel from "./ApprovalVotesPanel/ApprovalVotesPanel";
import { fetchAllForVoting as apiFetchAllForVoting } from "@/app/api/votes/getVotes";
import { Proposal } from "@/app/api/common/proposals/proposal";
import OpManagerDeleteProposal from "../OPProposalPage/OpManagerDeleteProposal";
import {
  fetchUserVotesForProposal as apiFetchUserVotesForProposal,
  fetchVotesForProposal as apiFetchVotesForProposal,
} from "@/app/api/common/votes/getVotes";
import { fetchDelegate as apiFetchDelegate } from "@/app/api/common/delegates/getDelegates";

async function fetchProposalVotes(proposal_id: string, page = 1) {
  "use server";

  return apiFetchVotesForProposal({
    proposal_id,
    page,
  });
}

async function fetchAllForVoting(
  address: string | `0x${string}`,
  blockNumber: number,
  proposal_id: string
) {
  "use server";

  return await apiFetchAllForVoting(address, blockNumber, proposal_id);
}

async function fetchDelegate(addressOrENSName: string | `0x${string}`) {
  "use server";

  return await apiFetchDelegate(addressOrENSName);
}

async function fetchUserVotesForProposal(
  proposal_id: string,
  address: string | `0x${string}`
) {
  "use server";

  return await apiFetchUserVotesForProposal({
    proposal_id,
    address,
  });
}

export default async function OPProposalApprovalPage({
  proposal,
}: {
  proposal: Proposal;
}) {
  const proposalVotes = await fetchProposalVotes(proposal.id);

  return (
    // 2 Colum Layout: Description on left w/ transactions and Votes / voting on the right
    <HStack
      gap={16}
      justifyContent="justify-between"
      alignItems="items-start"
      className={styles.proposal_container}
    >
      <ProposalDescription proposal={proposal} />
      <div>
        <OpManagerDeleteProposal proposal={proposal} />
        <VStack
          gap={4}
          justifyContent="justify-between"
          className={styles.proposal_votes_container}
        >
          <VStack gap={4} className={styles.proposal_actions_panel}>
            {/* Show the results of the approval vote w/ a tab for votes */}
            <ApprovalVotesPanel
              proposal={proposal}
              initialProposalVotes={proposalVotes}
              fetchVotesForProposal={fetchProposalVotes}
              fetchAllForVoting={fetchAllForVoting}
              fetchUserVotesForProposal={fetchUserVotesForProposal}
            />
          </VStack>
        </VStack>
      </div>
    </HStack>
  );
}
