"use client";

import { useState, useMemo } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesFilter from "./ProposalVotesFilter";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import {
  ParsedProposalData,
  ParsedProposalResults,
  calculateHybridOptimisticProposalMetrics,
} from "@/lib/proposalUtils";
import { ProposalVotesTab } from "@/components/common/ProposalVotesTab";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { formatNumber } from "@/lib/tokenUtils";
import { HYBRID_VOTE_WEIGHTS } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import { CloseIcon } from "@/icons/closeIcon";
import { InfoIcon } from "@/icons/InfoIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import checkIcon from "@/icons/check.svg";
import { HStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import { cn } from "@/lib/utils";
import ArchiveProposalVotesList from "@/components/Votes/ProposalVotesList/ArchiveProposalVotesList";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";

interface Props {
  proposal: Proposal;
}

const { token } = Tenant.current();

const OptimisticTieredProposalVotesGroup = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_OPTIMISTIC_TIERED"]["kind"];

  const { groupTallies } = useMemo(
    () => calculateHybridOptimisticProposalMetrics(proposal),
    [proposal]
  );

  let voteGroups = [
    {
      name: "Chains",
      againstVotes: proposalResults?.CHAIN?.against || "0",
      vetoPercentage:
        groupTallies.find((g) => g.name === "chains")?.vetoPercentage || 0,
      veto:
        groupTallies.find((g) => g.name === "chains")?.exceedsThreshold ||
        false,
    },
    {
      name: "Apps",
      againstVotes: proposalResults?.APP?.against || "0",
      vetoPercentage:
        groupTallies.find((g) => g.name === "apps")?.vetoPercentage || 0,
      veto:
        groupTallies.find((g) => g.name === "apps")?.exceedsThreshold || false,
    },
    {
      name: "Users",
      againstVotes: proposalResults?.USER?.against || "0",
      vetoPercentage:
        groupTallies.find((g) => g.name === "users")?.vetoPercentage || 0,
      veto:
        groupTallies.find((g) => g.name === "users")?.exceedsThreshold || false,
    },
  ];

  if (proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED") {
    voteGroups = [
      {
        name: "Delegates",
        againstVotes: formatNumber(
          (proposalResults?.DELEGATES?.against || "0").toString()
        ),
        vetoPercentage:
          groupTallies.find((g) => g.name === "delegates")?.vetoPercentage || 0,
        veto:
          groupTallies.find((g) => g.name === "delegates")?.exceedsThreshold ||
          false,
      },
      ...voteGroups,
    ];
  }

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
          key: "vetoPercentage",
          header: "% Veto",
          width: "w-[60px]",
          formatter: (value) => {
            return value.toFixed(2);
          },
        },
        {
          key: "veto",
          header: "Veto",
          width: "w-[45px]",
          formatter: (value) => {
            return value ? (
              <CloseIcon className="w-4 h-4 mx-1 my-[1px] text-negative stroke-negative" />
            ) : (
              "-"
            );
          },
        },
      ]}
    />
  );
};

const OptimisticTieredProposalVotesCard = ({ proposal }: Props) => {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const proposalData =
    proposal.proposalData as ParsedProposalData["HYBRID_OPTIMISTIC_TIERED"]["kind"];

  const { vetoThresholdMet, groupTallies } = useMemo(
    () => calculateHybridOptimisticProposalMetrics(proposal),
    [proposal]
  );

  const vetoingGroupsCount = useMemo(
    () => groupTallies.filter((g) => g.exceedsThreshold).length,
    [groupTallies]
  );

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  const renderVoteCriteriaTooltip = () => {
    return (
      <div className="flex items-center gap-0.5">
        <div className="text-black text-xs font-bold leading-[18px]">
          Veto criteria
        </div>
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <InfoIcon className="w-3 h-3 fill-neutral stroke-tertiary" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px] p-4 text-xs text-tertiary">
              <p className="text-primary font-bold mb-2">Veto criteria</p>
              <p className="line-height-[32px]">
                2 groups {proposalData?.tiers?.[0] || 55}%
              </p>
              <p className="line-height-[32px]">
                3 groups {proposalData?.tiers?.[1] || 45}%
              </p>
              <p className="line-height-[32px]">
                4 groups {proposalData?.tiers?.[2] || 35}%
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
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-320px)] md:h-auto"}`}
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

              <div className="flex-1 p-4 bg-white border-line mb-[196px]">
                <div className="w-full rounded border border-line overflow-hidden">
                  <div className="border-b border-line">
                    <div className="px-3 pt-4 pb-3 bg-neutral">
                      <div className="flex flex-col justify-start items-start">
                        <div
                          className={cn(
                            "self-stretch justify-start text-sm font-bold leading-7",
                            {
                              "text-negative": vetoThresholdMet,
                              "text-positive": !vetoThresholdMet,
                            }
                          )}
                        >
                          {vetoThresholdMet
                            ? proposal.status === "ACTIVE"
                              ? "Veto threshold reached"
                              : "Proposal vetoed"
                            : proposal.status === "ACTIVE"
                              ? "Veto threshold not reached"
                              : "Proposal approved"}
                        </div>
                        <div className="flex justify-between w-full">
                          {vetoThresholdMet ? (
                            <>
                              <div className="text-primary text-xs font-bold">
                                {vetoingGroupsCount} Group Threshold %
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1">
                                  <div className="text-right text-positive text-xs font-semibold leading-none">
                                    Met
                                  </div>
                                  <Image
                                    width="12"
                                    height="12"
                                    src={checkIcon}
                                    alt="check icon"
                                  />
                                  <div className="text-right text-black text-xs font-semibold leading-none">
                                    {vetoingGroupsCount === 2
                                      ? proposalData?.tiers?.[0] || 55
                                      : vetoingGroupsCount === 3
                                        ? proposalData?.tiers?.[1] || 45
                                        : proposalData?.tiers?.[2] || 35}
                                    %
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between items-center w-full">
                              <div className="text-black text-xs font-bold leading-[18px]">
                                4 Group Threshold %
                              </div>
                              <div className="flex justify-end items-center">
                                <div className="flex items-center gap-1">
                                  <div className="text-right text-black text-xs font-semibold leading-none">
                                    {proposalData?.tiers?.[2] || 35}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <OptimisticTieredProposalVotesGroup proposal={proposal} />
                  <div className="w-full h-12 px-3 py-2 bg-wash border-t border-line">
                    <div className="h-8 flex justify-between items-center">
                      {renderVoteCriteriaTooltip()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 w-full right-0 bg-neutral border rounded-bl-xl rounded-br-xl">
                <div className="">
                  <CastVoteInput proposal={proposal} isOptimistic />
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
                <ArchiveProposalVotesList proposal={proposal} />
              ) : (
                <ArchiveProposalNonVoterList proposal={proposal} />
              )}
            </>
          )}
          <VoteOnAtlas
            offchainProposalId={proposal.offchainProposalId || proposal.id}
          />
        </div>
      </div>
    </>
  );
};

export default OptimisticTieredProposalVotesCard;
