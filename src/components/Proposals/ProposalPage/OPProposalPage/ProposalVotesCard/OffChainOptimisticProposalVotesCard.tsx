"use client";

import { useState, useMemo } from "react";
import ProposalVotesSort, {
  SortParams,
} from "@/components/Votes/ProposalVotesList/ProposalVotesSort";
import { VoterTypes } from "@/app/api/common/votes/vote";
import ProposalVoterListFilter from "@/components/Votes/ProposalVotesList/ProsalVoterListFilter";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesFilter from "./ProposalVotesFilter";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import {
  ParsedProposalResults,
  calculateHybridOptimisticProposalMetrics,
  getProposalTiers,
} from "@/lib/proposalUtils";
import { ProposalVotesTab } from "@/components/common/ProposalVotesTab";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";
import { InfoIcon } from "@/icons/InfoIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { VotesBar } from "@/components/common/VotesBar";
import { HStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import ArchiveProposalVotesList from "@/components/Votes/ProposalVotesList/ArchiveProposalVotesList";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import Tenant from "@/lib/tenant/tenant";
import { useEffect } from "react";

interface Props {
  proposal: Proposal;
}

const OffChainOptimisticVotesGroup = ({ proposal }: { proposal: Proposal }) => {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["OFFCHAIN_OPTIMISTIC_TIERED"]["kind"];

  const { groupTallies } = useMemo(
    () => calculateHybridOptimisticProposalMetrics(proposal),
    [proposal]
  );

  const voteGroups = [
    {
      name: "Chains",
      againstVotes: proposalResults?.CHAIN?.against || "0",
      votePercentage:
        groupTallies
          .find((g) => g.name === "chains")
          ?.vetoPercentage?.toFixed(1) + "%" || "0%",
      weightedPercentage: "33.33%",
    },
    {
      name: "Apps",
      againstVotes: proposalResults?.APP?.against || "0",
      votePercentage:
        groupTallies
          .find((g) => g.name === "apps")
          ?.vetoPercentage?.toFixed(1) + "%" || "0%",
      weightedPercentage: "33.33%",
    },
    {
      name: "Users",
      againstVotes: proposalResults?.USER?.against || "0",
      votePercentage:
        groupTallies
          .find((g) => g.name === "users")
          ?.vetoPercentage?.toFixed(1) + "%" || "0%",
      weightedPercentage: "33.33%",
    },
  ];

  return (
    <VotesGroupTable
      groups={voteGroups}
      columns={[
        {
          key: "againstVotes",
          header: "Against",
          width: "w-[60px]",
          textColorClass: "text-negative",
        },
        {
          key: "votePercentage",
          header: "% Vote",
          width: "w-[60px]",
        },
        {
          key: "weightedPercentage",
          header: "% Weighted",
          width: "w-[60px]",
        },
      ]}
    />
  );
};

const OffChainOptimisticProposalVotesCard = ({ proposal }: Props) => {
  const [selectedVoterType, setSelectedVoterType] = useState<VoterTypes>({
    type: "ALL",
    value: "All",
  });
  const [sortOption, setSortOption] = useState<SortParams>({
    sortKey: "weight",
    sortOrder: "desc",
    label: "Most Voting Power",
  });
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const { ui } = Tenant.current();
  const useArchiveVoteHistory = ui.toggle(
    "use-archive-for-vote-history"
  )?.enabled;

  const hideTimeSortOptions = ["APP", "USER", "CHAIN"].includes(
    selectedVoterType.type
  );

  useEffect(() => {
    if (hideTimeSortOptions && sortOption.sortKey === "block_number") {
      setSortOption({
        sortKey: "weight",
        sortOrder: "desc",
        label: "Most Voting Power",
      });
    }
  }, [hideTimeSortOptions, sortOption.sortKey]);

  const { totalAgainstVotes } = useMemo(
    () => calculateHybridOptimisticProposalMetrics(proposal),
    [proposal]
  );

  const proposalQuorum = getProposalTiers(proposal);
  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  const renderVoteCriteriaTooltip = () => {
    return (
      <div className="flex items-center gap-0.5">
        <div className="text-black text-xs font-bold leading-[18px]">
          Threshold
        </div>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="w-3 h-3 fill-neutral stroke-tertiary" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] p-4 text-xs text-tertiary">
              <p className="text-primary font-bold mb-2">Threshold</p>
              <p className="line-height-[32px]">
                3 groups {proposalQuorum[0] || 20}%
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"}`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block md:hidden"
        >
          <HStack justifyContent="justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </HStack>
        </button>
        <div className="border border-line rounded-xl mb-2 bg-neutral">
          <ProposalVotesTab setTab={setActiveTab} activeTab={activeTab} />
          {activeTab === "results" ? (
            <>
              <div className="p-4 border-b border-line">
                <ProposalStatusDetail
                  proposalStatus={proposal.status}
                  proposalEndTime={proposal.endTime}
                  proposalStartTime={proposal.startTime}
                  proposalCancelledTime={proposal.cancelledTime}
                  proposalExecutedTime={proposal.executedTime}
                  cancelledTransactionHash={proposal.cancelledTransactionHash}
                  className="border-none m-0 p-0 bg-neutral"
                />
              </div>

              <div className="flex-1 p-4">
                <div className="border border-line rounded-lg">
                  <div className="">
                    <VotesBar
                      forVotes={0}
                      againstVotes={totalAgainstVotes}
                      quorumPercentage={proposalQuorum[0] || 65}
                      showVotesPercentage
                    />
                  </div>
                  <OffChainOptimisticVotesGroup proposal={proposal} />
                  <div className="border-t border-line p-4">
                    {renderVoteCriteriaTooltip()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-4 px-4 py-3">
                <ProposalVotesFilter
                  initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                  onSelectionChange={(value) => {
                    setShowVoters(value === "Voters");
                  }}
                />
                <div className="flex justify-between items-center border-b border-line pb-2">
                  <ProposalVoterListFilter
                    selectedVoterType={selectedVoterType}
                    onVoterTypeChange={setSelectedVoterType}
                    isOffchain
                  />
                  {showVoters && (
                    <ProposalVotesSort
                      sortOption={sortOption}
                      onSortChange={setSortOption}
                      hideTimeSortOptions={hideTimeSortOptions}
                    />
                  )}
                </div>
              </div>
              {useArchiveVoteHistory ? (
                showVoters ? (
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
                  />
                )
              ) : showVoters ? (
                <ProposalVotesList
                  proposalId={proposal.id}
                  offchainProposalId={proposal.offchainProposalId}
                  sort={sortOption.sortKey}
                  sortOrder={sortOption.sortOrder}
                  voterType={selectedVoterType.type}
                />
              ) : (
                <ProposalNonVoterList
                  proposal={proposal}
                  offchainProposalId={proposal.offchainProposalId}
                  sort={sortOption.sortKey}
                  sortOrder={sortOption.sortOrder}
                  selectedVoterType={selectedVoterType}
                />
              )}
            </>
          )}
        </div>
        <VoteOnAtlas
          offchainProposalId={proposal.offchainProposalId || proposal.id}
        />
      </div>
    </>
  );
};

export default OffChainOptimisticProposalVotesCard;
