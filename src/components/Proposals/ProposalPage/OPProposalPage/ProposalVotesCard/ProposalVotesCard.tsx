"use client";

import { useState } from "react";
import ProposalVotesSummary from "../ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { icons } from "@/assets/icons/icons";
import styles from "../StandardProposalPage.module.scss";
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
  };

  return (
    <div
      className={`flex flex-col gap-4 justify-between ${styles.proposal_votes_container} transition-all ${isClicked ? "bottom-[60px]" : "bottom-[calc(-100%+350px)]"}`}
    >
      <div className={`flex flex-col gap-4 ${styles.proposal_actions_panel}`}>
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-white absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block sm:hidden"
        >
          <div className="flex flex-col justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </div>
        </button>
        <div>
          <div className={styles.proposal_header}>Proposal votes</div>

          <ProposalVotesSummary
            votes={proposalVotes.votes}
            proposal={proposal}
          />
        </div>

        <ProposalVotesList
          initialProposalVotes={proposalVotes}
          proposal_id={proposal.id}
        />
        {/* Show the input for the user to vote on a proposal if allowed */}
        <CastVoteInput proposal={proposal} />
      </div>
    </div>
  );
};

export default ProposalVotesCard;
