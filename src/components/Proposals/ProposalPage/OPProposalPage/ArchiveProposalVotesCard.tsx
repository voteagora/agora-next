"use client";

import { useState } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import CastEasVoteInput from "@/components/Votes/CastVoteInput/CastEasVoteInput";
import ProposalVotesFilter from "./ProposalVotesCard/ProposalVotesFilter";
import { icons } from "@/assets/icons/icons";
import ArchiveProposalVotesList from "@/components/Votes/ProposalVotesList/ArchiveProposalVotesList";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";

type ArchiveProposalVotesCardProps = {
  proposal: Proposal;
};

export default function ArchiveProposalVotesCard({
  proposal,
}: ArchiveProposalVotesCardProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [showVoters, setShowVoters] = useState(true);
  console.log("proposal", proposal);
  const now = new Date();
  const isProposalActive =
    proposal.endTime && proposal.endTime > now && proposal.status === "ACTIVE";

  const handleClick = () => {
    setIsClicked((prev) => !prev);
  };

  return (
    <>
      <div
        className={`fixed flex justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${
          isClicked
            ? "bottom-[20px]"
            : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"
        } sm:overflow-y-auto`}
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
            <div className="font-semibold px-4 text-primary">
              Voting activity
            </div>
            <ProposalVotesSummary proposal={proposal} />
            <div className="px-4">
              <ProposalVotesFilter
                initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                onSelectionChange={(value: string) => {
                  setShowVoters(value === "Voters");
                }}
              />
            </div>
          </div>

          {showVoters ? (
            <ArchiveProposalVotesList proposal={proposal} />
          ) : (
            <ArchiveProposalNonVoterList proposal={proposal} />
          )}

          {isProposalActive && (
            <div className="p-4">
              <CastEasVoteInput proposal={proposal} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
