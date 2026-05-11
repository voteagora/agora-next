"use client";

import { useEffect, useState } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesSummary from "./ProposalVotesSummary/ProposalVotesSummary";
import CastEasVoteInput from "@/components/Votes/CastVoteInput/CastEasVoteInput";
import ProposalVotesFilter from "./ProposalVotesCard/ProposalVotesFilter";
import { icons } from "@/assets/icons/icons";
import ArchiveProposalVotesList from "@/components/Votes/ProposalVotesList/ArchiveProposalVotesList";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import ProposalVoterListFilter from "@/components/Votes/ProposalVotesList/ProsalVoterListFilter";
import ProposalVotesSort, {
  SortParams,
} from "@/components/Votes/ProposalVotesList/ProposalVotesSort";
import type { VoterTypes } from "@/app/api/common/votes/vote";

type OODaoProposalVotesCardProps = {
  proposal: Proposal;
};

export default function OODaoProposalVotesCard({
  proposal,
}: OODaoProposalVotesCardProps) {
  const [isClicked, setIsClicked] = useState(false);
  const [showVoters, setShowVoters] = useState(true);
  const [selectedVoterType, setSelectedVoterType] = useState<VoterTypes>({
    type: "ALL",
    value: "All",
  });
  const [sortOption, setSortOption] = useState<SortParams>({
    sortKey: "block_number",
    sortOrder: "desc",
    label: "Most Recent",
  });
  const now = new Date();
  const isProposalActive =
    proposal.endTime && proposal.endTime > now && proposal.status === "ACTIVE";
  const hideTimeSortOptions = ["APP", "USER", "CHAIN"].includes(
    selectedVoterType.type
  );

  useEffect(() => {
    const isTimeSortHidden = hideTimeSortOptions || !showVoters;
    if (isTimeSortHidden && sortOption.sortKey === "block_number") {
      setSortOption({
        sortKey: "weight",
        sortOrder: "desc",
        label: "Most Voting Power",
      });
    }
  }, [hideTimeSortOptions, showVoters, sortOption.sortKey]);

  const handleClick = () => {
    setIsClicked((prev) => !prev);
  };

  return (
    <>
      <div
        className={`fixed flex flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${
          isClicked
            ? "bottom-[20px]"
            : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"
        } sm:overflow-y-auto`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <div className="flex flex-col flex-1 gap-4 min-h-0 pt-4 w-full">
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
            <div className="px-4 flex flex-col gap-4">
              <ProposalVotesFilter
                initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                onSelectionChange={(value: string) => {
                  setShowVoters(value === "Voters");
                }}
              />
              <div className="flex justify-between items-center border-b border-line pb-2">
                <ProposalVoterListFilter
                  selectedVoterType={selectedVoterType}
                  onVoterTypeChange={setSelectedVoterType}
                  showCitizenHouseFilters={
                    proposal.proposalType?.includes("HYBRID") || false
                  }
                />
                {showVoters ? (
                  <ProposalVotesSort
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    hideTimeSortOptions={hideTimeSortOptions}
                  />
                ) : (
                  <ProposalVotesSort
                    sortOption={sortOption}
                    onSortChange={setSortOption}
                    hideTimeSortOptions={true}
                  />
                )}
              </div>
            </div>
          </div>

          {showVoters ? (
            <ArchiveProposalVotesList
              proposal={proposal}
              sort={sortOption.sortKey}
              sortOrder={sortOption.sortOrder}
              voterType={selectedVoterType.type}
            />
          ) : (
            <ArchiveProposalNonVoterList
              proposal={proposal}
              selectedVoterType={selectedVoterType}
              sort={sortOption.sortKey}
              sortOrder={sortOption.sortOrder}
            />
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
