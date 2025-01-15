"use client";

import { useState } from "react";
import ProposalVotesSummary from "../ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { icons } from "@/assets/icons/icons";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { PaginatedResult } from "@/app/lib/pagination";
import ProposalVotesFilter from "./ProposalVotesFilter";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";

const ProposalVotesCard = ({
  proposal,
  nonVoters,
}: {
  proposal: Proposal;
  nonVoters: PaginatedResult<any[]>; // TODO: add better types
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const [showVoters, setShowVoters] = useState(true);

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
      <div className="flex flex-col gap-4 min-h-0 shrink pt-4 w-full">
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block sm:hidden"
        >
          <div className="flex flex-col justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </div>
        </button>
        <div className="flex flex-col gap-4">
          <div className="font-semibold px-4 text-primary">Proposal votes</div>
          <ProposalVotesSummary proposal={proposal} />
          <div className="px-4">
            <ProposalVotesFilter
              initialSelection={showVoters ? "Voters" : "Hasn't voted"}
              onSelectionChange={(value) => {
                setShowVoters(value === "Voters");
              }}
            />
          </div>
        </div>

        {showVoters ? (
          <ProposalVotesList proposalId={proposal.id} />
        ) : (
          <ProposalNonVoterList
            proposal={proposal}
            initialNonVoters={nonVoters}
          />
        )}
        {/* Show the input for the user to vote on a proposal if allowed */}
        <CastVoteInput proposal={proposal} />
      </div>
    </div>
  );
};

export default ProposalVotesCard;
