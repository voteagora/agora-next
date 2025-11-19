"use client";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { useState } from "react";
import HybridStandardProposalVotesSummary from "../ProposalVotesSummary/HybridStandardProposalVotesSummary";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ArchiveProposalVotesList from "@/components/Votes/ProposalVotesList/ArchiveProposalVotesList";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import ProposalVotesFilter from "./ProposalVotesFilter";
import { ProposalVotesTab } from "@/components/common/ProposalVotesTab";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";
import { HStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import Tenant from "@/lib/tenant/tenant";

const HybridStandardProposalVotesCard = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const [activeTab, setTab] = useState("results");
  const [showVoters, setShowVoters] = useState(true);
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const { ui } = Tenant.current();
  const useArchiveVoteHistory = ui.toggle(
    "use-archive-for-vote-history"
  )?.enabled;

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"} sm:overflow-y-auto`}
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
          <ProposalVotesTab setTab={setTab} activeTab={activeTab} />

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
              <HybridStandardProposalVotesSummary proposal={proposal} />
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
              {useArchiveVoteHistory ? (
                showVoters ? (
                  <ArchiveProposalVotesList proposal={proposal} />
                ) : (
                  <ArchiveProposalNonVoterList proposal={proposal} />
                )
              ) : showVoters ? (
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

export default HybridStandardProposalVotesCard;
