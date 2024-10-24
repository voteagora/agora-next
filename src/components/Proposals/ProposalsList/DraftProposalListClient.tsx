"use client";

import { useAccount } from "wagmi";
import useDraftProposals from "@/hooks/useDraftProposals";
import { useSearchParams } from "next/navigation";
import HumanAddress from "@/components/shared/HumanAddress";
import { ProposalDraft } from "@prisma/client";
import Link from "next/link";
import { draftProposalsFilterOptions } from "@/lib/constants";
import {
  getStageIndexForTenant,
  isPostSubmission,
} from "@/app/proposals/draft/utils/stages";
import { animate, AnimatePresence, motion } from "framer-motion";
const DraftProposalCard = ({ proposal }: { proposal: ProposalDraft }) => {
  const isDrafting = !isPostSubmission(proposal.stage);
  return (
    <Link
      href={
        isDrafting
          ? `/proposals/draft/${proposal.id}?stage=${getStageIndexForTenant(proposal.stage)}`
          : `/proposals/sponsor/${proposal.id}`
      }
      className="block cursor-pointer border-b border-line last:border-b-0 hover:bg-tertiary/5 transition-colors"
    >
      <div className="py-4 px-6 flex flex-row gap-4 items-center">
        <div className="flex flex-col justify-between gap-1">
          <div className="flex flex-row gap-1 text-xs text-secondary">
            <div>
              Draft Proposal{" "}
              <span className="hidden sm:inline">
                by <HumanAddress address={proposal.author_address} />
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-1">
            {isDrafting && (
              <span className="bg-blue-100 text-blue-500 self-start text-xs font-bold rounded-lg px-1.5 py-1 uppercase tracking-wider">
                Draft
              </span>
            )}
            <span className="text-primary">{proposal.title || "Untitled"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const DraftProposalListClient = () => {
  const { address } = useAccount();
  const filter =
    useSearchParams()?.get("filter") ||
    draftProposalsFilterOptions.allDrafts.value;

  const {
    data: draftProposals,
    isLoading,
    error,
  } = useDraftProposals({ address, filter });

  return (
    <>
      {isLoading ? (
        <motion.div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
          <div className="flex flex-row justify-center py-8 text-tertiary">
            Loading...
          </div>
        </motion.div>
      ) : (
        <motion.div
          key={filter}
          className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden"
        >
          <div>
            {!draftProposals || draftProposals?.length === 0 ? (
              <div className="flex flex-row justify-center py-8 text-tertiary">
                No draft proposals found
              </div>
            ) : (
              <div>
                {draftProposals?.map((proposal) => (
                  <DraftProposalCard key={proposal.id} proposal={proposal} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </>
  );
};

export default DraftProposalListClient;
