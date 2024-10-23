"use client";

import { useAccount } from "wagmi";
import useDraftProposals from "@/hooks/useDraftProposals";
import HumanAddress from "@/components/shared/HumanAddress";
import { ProposalDraft } from "@prisma/client";
import Link from "next/link";

const DraftProposalCard = ({ proposal }: { proposal: ProposalDraft }) => {
  return (
    <Link
      href={`/proposals/draft/${proposal.id}`}
      className="block cursor-pointer border-b border-line last:border-b-0 hover:bg-tertiary/5 transition-colors"
    >
      <div className="py-4 px-6 ">
        <div className="flex flex-row gap-1 text-xs text-secondary">
          {/* Warning: this assumes OP FND is the only proposer. Will need to maintain an array of OP Foundation proposals eventually */}
          <div>
            Draft Proposal
            <span className="hidden sm:inline">
              by <HumanAddress address={proposal.author_address} />
            </span>
          </div>
        </div>
        <div className="text-primary">{proposal.title}</div>
      </div>
    </Link>
  );
};

const DraftProposalListClient = () => {
  const { address } = useAccount();
  const {
    data: draftProposals,
    isLoading,
    error,
  } = useDraftProposals({ address });

  return (
    <div className="flex flex-col bg-neutral border border-line rounded-lg shadow-newDefault overflow-hidden">
      <div>
        {draftProposals?.length === 0 ? (
          <div className="flex flex-row justify-center py-8 text-secondary">
            No draft proposals currently
          </div>
        ) : (
          <div>
            {draftProposals?.map((proposal) => (
              <DraftProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DraftProposalListClient;
