"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { SnapshotVote, VotesSort } from "@/app/api/common/votes/vote";
import { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import ProposalVotesFilter from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/ProposalVotesFilter";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import { ParsedProposalData } from "@/lib/proposalUtils";
import CopelandProposalCriteria from "../CopelandProposalCriteria/CopelandProposalCriteria";
import CopelandProposalVotesList from "@/components/Votes/CopelandProposalVotesList/CopelandProposalVotesList";
import ArchiveCopelandProposalVotesList from "@/components/Votes/CopelandProposalVotesList/ArchiveCopelandProposalVotesList";
import OptionsResultsPanel from "../OptionsResultsPanel/OptionsResultsPanel";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";
import Tenant from "@/lib/tenant/tenant";

type Props = {
  proposal: Proposal;
  fetchVotesForProposal: (
    proposalId: string,
    pagination?: PaginationParams,
    sort?: VotesSort
  ) => Promise<PaginatedResult<SnapshotVote[]>>;
  fetchUserVotesForProposal: (
    proposalId: string,
    address: string | `0x${string}`
  ) => Promise<SnapshotVote[]>;
};

export default function CopelandVotesPanel({
  proposal,
  fetchVotesForProposal,
  fetchUserVotesForProposal,
}: Props) {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [isPending, startTransition] = useTransition();
  const { ui } = Tenant.current();
  const useArchiveVoteHistory = ui.toggle("use-archive-vote-history")?.enabled;
  const hasVotes =
    Number(
      (proposal.proposalData as ParsedProposalData["SNAPSHOT"]["kind"]).votes
    ) > 0;
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  function handleTabsChange(index: number) {
    startTransition(() => {
      setActiveTab(index);
    });
  }

  const handleDownloadCSV = async () => {
    try {
      setIsDownloading(true);
      setDownloadSuccess(false);
      const response = await fetch(`/api/proposals/${proposal.id}/votes-csv`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `votes-${proposal.id}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setDownloadSuccess(true);
      // Reset success state after 2 seconds
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error downloading CSV:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <motion.div
      className="flex flex-col flex-1"
      initial={{ opacity: 1 }}
      animate={{ opacity: isPending ? 0.3 : 1 }}
      transition={{ duration: 0.3, delay: isPending ? 0.3 : 0 }}
    >
      <div className="flex flex-col gap-1 relative min-h-0 h-full">
        {/* Tabs */}
        <div className="flex h-12 pt-4 px-4 mb-1">
          {["Results", "Votes"].map((tab, index) => (
            <div
              key={index}
              onClick={() => handleTabsChange(index + 1)}
              className="text-base font-semibold pr-4 cursor-pointer"
            >
              <span
                className={
                  activeTab === index + 1 ? "text-secondary" : "text-tertiary"
                }
              >
                {tab}
              </span>
            </div>
          ))}
          {hasVotes && (
            <div className="flex justify-end ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadCSV}
                disabled={isDownloading}
                className="flex items-center gap-2 px-1"
              >
                {downloadSuccess ? (
                  <Check className="h-4 w-4 text-positive" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isDownloading
                  ? "Downloading..."
                  : downloadSuccess
                    ? "Downloaded!"
                    : "Download Votes"}
              </Button>
            </div>
          )}
        </div>
        <ProposalStatusDetail
          proposalStatus={proposal.status}
          proposalEndTime={proposal.endTime}
          proposalStartTime={proposal.startTime}
          proposalCancelledTime={proposal.cancelledTime}
          proposalExecutedTime={proposal.executedTime}
          cancelledTransactionHash={proposal.cancelledTransactionHash}
          className="bg-white rounded-none border-b mb-1 py-4 mx-0"
        />
        {activeTab === 1 ? (
          <OptionsResultsPanel proposal={proposal} />
        ) : (
          <>
            <div className="px-4">
              <ProposalVotesFilter
                initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                onSelectionChange={(value) => {
                  setShowVoters(value === "Voters");
                }}
              />
            </div>
            {useArchiveVoteHistory ? (
              showVoters ? (
                <ArchiveCopelandProposalVotesList proposal={proposal} />
              ) : (
                <ArchiveProposalNonVoterList proposal={proposal} />
              )
            ) : showVoters ? (
              <CopelandProposalVotesList
                fetchVotesForProposal={fetchVotesForProposal}
                fetchUserVotes={fetchUserVotesForProposal}
                proposalId={proposal.id}
              />
            ) : (
              <ProposalNonVoterList proposal={proposal} />
            )}
          </>
        )}
        <CopelandProposalCriteria />
      </div>
    </motion.div>
  );
}
