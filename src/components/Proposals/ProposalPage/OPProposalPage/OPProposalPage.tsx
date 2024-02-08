import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalDescription from "../ProposalDescription/ProposalDescription";
import styles from "./OPProposalPage.module.scss";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { Proposal } from "@/app/api/common/proposals/proposal";
import OpManagerDeleteProposal from "./OpManagerDeleteProposal";
import { fetchAllForVoting, fetchProposalVotes } from "@/app/proposals/actions";

export default async function OPProposalPage({
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
            <div>
              <div className={styles.proposal_header}>Proposal votes</div>
              {/* Show the summar bar with For, Against, Abstain */}
              <ProposalVotesSummary proposal={proposal} />
            </div>
            {/* Show the scrolling list of votes for the proposal */}
            <ProposalVotesList
              initialProposalVotes={proposalVotes}
              proposal_id={proposal.id}
            />
            {/* Show the input for the user to vote on a proposal if allowed */}
            <CastVoteInput
              proposal={proposal}
              fetchAllForVoting={fetchAllForVoting}
            />
          </VStack>
        </VStack>
      </div>
    </HStack>
  );
}
