"use client";

import { useState } from "react";
import { HStack } from "@/components/Layout/Stack";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import { icons } from "@/assets/icons/icons";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import ProposalVotesFilter from "./ProposalVotesFilter";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import { ProposalVotesTab } from "@/components/common/ProposalVotesTab";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { formatNumber } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  proposal: Proposal;
}

const { token } = Tenant.current();

const HybridOptimisticVotesGroup = ({ proposal }: { proposal: Proposal }) => {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_OPTIMISTIC_TIERED"]["kind"];

  const voteGroups = [
    {
      name: "Delegates",
      againstVotes: proposalResults?.DELEGATES?.against
        ? formatNumber(proposalResults.DELEGATES.against, token.decimals)
        : 0,
      weight: "5%",
      veto: "—",
    },
    {
      name: "Chains",
      againstVotes: proposalResults?.CHAIN?.against
        ? formatNumber(proposalResults.CHAIN.against, token.decimals)
        : 0,
      weight: "5%",
      veto: "—",
    },
    {
      name: "Apps",
      againstVotes: proposalResults?.PROJECT?.against
        ? formatNumber(proposalResults.PROJECT.against, token.decimals)
        : 0,
      weight: "5%",
      veto: "—",
    },
    {
      name: "Users",
      againstVotes: proposalResults?.USER?.against
        ? formatNumber(proposalResults.USER.against, token.decimals)
        : 0,
      weight: "5%",
      veto: "—",
    },
  ].map((group) => ({
    ...group,
    againstVotes: group.againstVotes.toLocaleString(),
  }));

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
          key: "weight",
          header: "% vote",
          width: "w-[45px]",
        },
        {
          key: "veto",
          header: "Veto",
          width: "w-[45px]",
        },
      ]}
    />
  );
};

const HybridOptimisticProposalVotesCard = ({ proposal }: Props) => {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState("results");

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl mb-2 transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"} overflow-hidden`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
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
                    <div className="flex justify-between items-center">
                      <div className="text-black text-xs font-bold leading-[18px]">
                        4 Group Threshold %
                      </div>
                      <div className="w-[185px] flex justify-between items-center">
                        <div className="w-[60px] opacity-0 flex justify-end items-center gap-1.5">
                          <div className="text-right text-negative text-xs font-semibold leading-tight">
                            51.5k
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="opacity-0 flex items-center gap-1">
                            <div className="text-right text-positive text-xs font-semibold leading-none">
                              Met
                            </div>
                          </div>
                          <div className="text-right text-black text-xs font-semibold leading-none">
                            35%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <HybridOptimisticVotesGroup proposal={proposal} />
                <div className="w-full h-12 px-3 py-2 bg-wash border-t border-line">
                  <div className="h-8 flex justify-between items-center">
                    <div className="flex items-center gap-0.5">
                      <div className="text-black text-xs font-bold leading-[18px]">
                        Vote criteria
                      </div>
                    </div>
                    <div className="opacity-0 flex items-center gap-1">
                      <div className="text-right text-positive text-xs font-semibold leading-none">
                        Met
                      </div>
                      <div className="text-right text-black text-xs font-semibold leading-none">
                        55%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 w-full right-0 bg-neutral border-t">
              <div className="p-4">
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
              <ProposalVotesList proposalId={proposal.id} />
            ) : (
              <ProposalNonVoterList proposal={proposal} />
            )}
          </>
        )}
      </div>
      <VoteOnAtlas />
    </>
  );
};

export default HybridOptimisticProposalVotesCard;
