"use client";

import { useState } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import ProposalVotesFilter from "./ProposalVotesCard/ProposalVotesFilter";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { icons } from "@/assets/icons/icons";

export default function ArchiveProposalVotesCard({
  proposal,
}: {
  proposal: Proposal;
}) {
  const [isClicked, setIsClicked] = useState(false);
  const [showVoters, setShowVoters] = useState(true);
  
  // Check if this is from dao_node source (allows voting)
  // For eas-oodao, we disable voting since it's offchain data
  const proposalData = proposal.proposalData as { source?: string } | undefined;
  const isFromDaoNode = proposalData?.source === "dao_node";
  
  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <div
      className={`fixed flex justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"} sm:overflow-y-auto`}
      style={{
        transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
      }}
    >
      <div className="flex flex-col gap-4 min-h-0 shrink pt-4 w-full">
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block md:hidden"
        >
          <div className="flex flex-col justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </div>
        </button>
        <div className="flex flex-col gap-4">
          <div className="font-semibold px-4 text-primary">Voting activity</div>
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
          <ProposalVotesList
            proposalId={proposal.id}
            offchainProposalId={proposal.offchainProposalId}
          />
        ) : (
          <ProposalNonVoterList
            proposal={proposal}
            offchainProposalId={proposal.offchainProposalId}
          />
        )}
        
        {/* Show cast vote input only for dao_node proposals (onchain voting) */}
        {isFromDaoNode && (
          <div className="border-t border-line">
            <CastVoteInput proposal={proposal} />
          </div>
        )}
      </div>
    </div>
  );
}
