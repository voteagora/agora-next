"use client";

import { useState } from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import ProposalVotesSummary from "../ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { icons } from "@/assets/icons/icons";
import styles from "../OPProposalPage.module.scss";
import { Proposal } from "@/app/api/common/proposals/proposal";

const ProposalVotesCard = ({
  proposal,
  proposalVotes,
}: {
  proposal: Proposal;
  proposalVotes: any;
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
    // var div = document.getElementsByClassName("mobile-web-scroll-div")[0];
    // div.scrollTop = 0;
  };

  return (
    <VStack
      gap={4}
      justifyContent="justify-between"
      className={`${styles.proposal_votes_container} transition-all ${isClicked ? "bottom-[-16px]" : "bottom-[calc(-100%+248px)]"}`}
    >
      <VStack gap={4} className={styles.proposal_actions_panel}>
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-white absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block sm:hidden"
        >
          <HStack justifyContent="justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </HStack>
        </button>
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
        <CastVoteInput proposal={proposal} />
      </VStack>
    </VStack>
  );
};

export default ProposalVotesCard;
