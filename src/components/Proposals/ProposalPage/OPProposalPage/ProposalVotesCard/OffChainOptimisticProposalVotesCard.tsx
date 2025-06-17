"use client";

import { useState, useMemo } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import ProposalVotesFilter from "./ProposalVotesFilter";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import {
  ParsedProposalResults,
  calculateHybridOptimisticProposalMetrics,
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
      againstVotes: proposalResults?.PROJECT?.against || "0",
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
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const { totalAgainstVotes } = useMemo(
    () => calculateHybridOptimisticProposalMetrics(proposal),
    [proposal]
  );

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
              <p className="line-height-[32px]">4 groups 66%</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  };

  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral transition-all bottom-[20px] h-[calc(100%-160px)] md:h-auto overflow-hidden`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <div className="border border-line rounded-xl mb-2 ">
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
                      quorumPercentage={66}
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
              <div className="px-3 py-[10px]">
                <ProposalVotesFilter
                  initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                  onSelectionChange={(value) => {
                    setShowVoters(value === "Voters");
                  }}
                />
              </div>
              {showVoters ? (
                <ProposalVotesList proposalId={proposal.id} />
              ) : (
                <ProposalNonVoterList proposal={proposal} />
              )}
            </>
          )}
        </div>
        <VoteOnAtlas />
      </div>
    </>
  );
};

export default OffChainOptimisticProposalVotesCard;
