import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalApprovalPage.module.scss";
import ApprovalVotesPanel from "./ApprovalVotesPanel/ApprovalVotesPanel";
import { getVotesForProposal } from "@/app/api/votes/getVotes";
import { getVotingPowerAtSnapshot } from "@/app/api/voting-power/getVotingPower";
import { getAuthorityChains } from "@/app/api/authority-chains/getAuthorityChains";

async function fetchProposalVotes(proposal_id, page = 1) {
  "use server";

  return getVotesForProposal({ proposal_id, page });
}

async function fetchVotingPower(address, blockNumber) {
  "use server";

  return {
    votingPower: (await getVotingPowerAtSnapshot({ blockNumber, address }))
      .totalVP,
  };
}

async function fetchAuthorityChains(address, blockNumber) {
  "use server";

  return {
    chains: await getAuthorityChains({ blockNumber, address }),
  };
}

export default async function OPProposalApprovalPage({ proposal }) {
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
          />
        </VStack>
      </VStack>
    </HStack>
  );
}
