"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalVotesFilter from "@/components/Proposals/ProposalPage/OPProposalPage/ProposalVotesCard/ProposalVotesFilter";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import { ParsedProposalData } from "@/lib/proposalUtils";
import CopelandProposalCriteria from "../CopelandProposalCriteria/CopelandProposalCriteria";
import ArchiveCopelandProposalVotesList from "@/components/Votes/CopelandProposalVotesList/ArchiveCopelandProposalVotesList";
import OptionsResultsPanel from "../OptionsResultsPanel/OptionsResultsPanel";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import { Button } from "@/components/ui/button";
import { Download, Check } from "lucide-react";

type Props = {
  proposal: Proposal;
};

export default function CopelandVotesPanel({ proposal }: Props) {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [isPending, startTransition] = useTransition();
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
      className="flex flex-col flex-1 min-h-0 w-full"
      initial={{ opacity: 1 }}
      animate={{ opacity: isPending ? 0.3 : 1 }}
      transition={{ duration: 0.3, delay: isPending ? 0.3 : 0 }}
    >
      <div className="flex flex-col gap-1 relative min-h-0 flex-1">
        {/* Tabs */}
        <div className="flex h-12 pt-4 px-4 mb-1">
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
            {showVoters ? (
              <ArchiveCopelandProposalVotesList proposal={proposal} />
            ) : (
              <ArchiveProposalNonVoterList
                proposal={proposal}
                selectedVoterType={{ type: "ALL", value: "All" }}
              />
            )}
          </>
        )}
        <CopelandProposalCriteria />
      </div>
    </motion.div>
  );
}
