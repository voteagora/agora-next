"use client";

import { useAccount } from "wagmi";
import HumanAddress from "@/components/shared/HumanAddress";
import { ProposalDraft } from "@prisma/client";
import Link from "next/link";
import {
  getStageIndexForTenant,
  isPostSubmission,
} from "@/app/proposals/draft/utils/stages";
import { animate, AnimatePresence, motion } from "framer-motion";
import useMyDraftProposals from "@/hooks/useMyDraftProposals";
import { formatFullDate } from "@/lib/utils";

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
        <div className="w-full sm:w-[60%] flex flex-col justify-between gap-1">
          <div className="flex flex-row gap-1 text-xs text-tertiary">
            <div>
              Created by <HumanAddress address={proposal.author_address} />
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <span className="text-primary">{proposal.title || "Untitled"}</span>
          </div>
        </div>
        <div className="flex flex-row gap-24">
          <div className="w-[180px] flex flex-col justify-between gap-y-1">
            <span className="text-xs text-tertiary">Last updated</span>
            <span className="">{formatFullDate(proposal.updated_at)}</span>
          </div>
          <div className="flex flex-col justify-between gap-y-1">
            <div className="flex flex-row gap-1 text-xs text-tertiary">
              <div>Status</div>
            </div>
            <div className="bg-wash text-secondary border border-line text-xs font-medium px-1 py-0.5 rounded">
              Draft
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

const MyDraftProposalListClient = () => {
  const { address } = useAccount();

  const {
    data: draftProposals,
    isLoading,
    error,
  } = useMyDraftProposals({ address });

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
          key="my-drafts"
          className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden"
        >
          <div>
            {!draftProposals || draftProposals?.length === 0 ? (
              <div className="flex flex-row justify-center py-8 text-tertiary">
                No drafts found
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

export default MyDraftProposalListClient;
