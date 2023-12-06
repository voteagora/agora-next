import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalPage.module.scss";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import { getVotesForProposal } from "@/app/api/votes/getVotes";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { getVotingPowerAtSnapshot } from "@/app/api/voting-power/getVotingPower";
import { getAuthorityChains } from "@/app/api/authority-chains/getAuthorityChains";

async function fetchProposalVotes(proposal_id, page = 1) {
  "use server";

  return getVotesForProposal({ proposal_id, page });
}

async function fetchVotingPower(address, blockNumber) {
  "use server";

  console.log("fetchVotingPower", { address, blockNumber });

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

export default async function OPProposalPage({ proposal }) {
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
          {/* Show the summar bar with For, Against, Abstain */}
          <ProposalVotesSummary proposal={proposal} />
          {/* Show the scrolling list of votes for the proposal */}
          <ProposalVotesList
            initialProposalVotes={proposalVotes}
            fetchVotesForProposal={fetchProposalVotes}
            proposal_id={proposal.id}
          />
          {/* Show the input for the user to vote on a proposal if allowed */}
          <CastVoteInput
            proposal={proposal}
            fetchVotingPower={fetchVotingPower}
            fetchAuthorityChains={fetchAuthorityChains}
          />
        </VStack>
      </VStack>
    </HStack>
  );
}
