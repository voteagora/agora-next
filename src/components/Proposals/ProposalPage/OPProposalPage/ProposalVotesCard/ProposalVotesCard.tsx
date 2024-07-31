"use client";

import { useState } from "react";
import ProposalVotesSummary from "../ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { icons } from "@/assets/icons/icons";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { PaginatedResult } from "@/app/lib/pagination";
import { Vote } from "@/app/api/common/votes/vote";

const ProposalVotesCard = ({
  proposal,
  proposalVotes,
}: {
  proposal: Proposal;
  proposalVotes: PaginatedResult<Vote[]>;
}) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <div
      className={`fixed flex justify-between gap-4 sm:sticky top-[auto] sm:top-20 sm:max-h-[calc(100vh-162px)] sm:w-[24rem] w-[calc(100%-32px)] max-h-[calc(100%-190px)] items-stretch flex-shrink max-w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${isClicked ? "bottom-[60px]" : "bottom-[calc(-100%+350px)]"}`}
      style={{
        transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
      }}
    >
      <div className="flex flex-col gap-4 min-h-0 shrink py-4 w-full">
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block sm:hidden"
        >
          <div className="flex flex-col justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </div>
        </button>
        <div>
          <div className="px-4 font-semibold mb-2">Proposal votes</div>

          <ProposalVotesSummary
            votes={proposalVotes.data}
            proposal={proposal}
          />
        </div>

        <ProposalVotesList
          initialProposalVotes={proposalVotes}
          proposalId={proposal.id}
        />
        {/* Show the input for the user to vote on a proposal if allowed */}
        <CastVoteInput proposal={proposal} />
      </div>
    </div>
  );
};

export default ProposalVotesCard;
