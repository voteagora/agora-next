"use client";

import { useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { VStack, HStack } from "@/components/Layout/Stack";
import OptionResultsPanel from "../OptionResultsPanel/OptionResultsPanel";
import ArchiveApprovalProposalVotesList from "@/components/Votes/ApprovalProposalVotesList/ArchiveApprovalProposalVotesList";
import ApprovalProposalCriteria from "../ApprovalProposalCriteria/ApprovalProposalCriteria";
import EasApprovalCastVoteButton from "@/components/Votes/EasApprovalCastVoteButton/EasApprovalCastVoteButton";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesFilter from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/ProposalVotesFilter";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import { ParsedProposalData } from "@/lib/proposalUtils";
import ProposalVoterListFilter from "@/components/Votes/ProposalVotesList/ProsalVoterListFilter";
import ProposalVotesSort, {
  SortParams,
} from "@/components/Votes/ProposalVotesList/ProposalVotesSort";
import type { VoterTypes } from "@/app/api/common/votes/vote";

type Props = {
  proposal: Proposal;
};

export default function OODaoApprovalVotesPanel({ proposal }: Props) {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [sortOption, setSortOption] = useState<SortParams>({
    sortKey: "block_number",
    sortOrder: "desc",
    label: "Most Recent",
  });
  const [selectedVoterType, setSelectedVoterType] = useState<VoterTypes>({
    type: "ALL",
    value: "All",
  });

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

  function handleTabsChange(index: number) {
    startTransition(() => {
      setActiveTab(index);
    });
  }

  const proposalData = proposal.proposalData as
    | ParsedProposalData["APPROVAL"]["kind"]
    | undefined;
  const isThresholdCriteria =
    proposalData?.proposalSettings?.criteria === "THRESHOLD";

  return (
    <motion.div
      className="flex flex-col flex-1 min-h-0"
      initial={{ opacity: 1 }}
      animate={{ opacity: isPending ? 0.3 : 1 }}
      transition={{ duration: 0.3, delay: isPending ? 0.3 : 0 }}
    >
      <VStack gap={1} className="relative min-h-0 flex-1">
        {/* Tabs */}
        <HStack className="h-12 pt-4 px-4 mb-1">
          {["Results", "Votes"].map((tab, index) => (
            <div
              key={index}
              onClick={() => handleTabsChange(index + 1)}
              className="text-base font-semibold pr-4 cursor-pointer"
            >
              <span
                data-testid={
                  tab === "Results"
                    ? "proposal-results-tab"
                    : "proposal-votes-tab"
                }
                className={
                  activeTab === index + 1 ? "text-secondary" : "text-tertiary"
                }
              >
                {tab}
              </span>
            </div>
          ))}
        </HStack>
        {activeTab === 1 ? (
          <OptionResultsPanel proposal={proposal} />
        ) : (
          <>
            <div className="px-4 py-3 pb-2 flex flex-col gap-4">
              <ProposalVotesFilter
                initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                onSelectionChange={(value) => {
                  setShowVoters(value === "Voters");
                }}
              />
              <div className="flex justify-between items-center border-t border-line pt-2">
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
            {showVoters ? (
              <ArchiveApprovalProposalVotesList
                proposal={proposal}
                isThresholdCriteria={isThresholdCriteria}
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
          </>
        )}
        <ApprovalProposalCriteria proposal={proposal} />
        <div className="px-4 pb-6">
          <EasApprovalCastVoteButton proposal={proposal} />
        </div>
      </VStack>
    </motion.div>
  );
}
