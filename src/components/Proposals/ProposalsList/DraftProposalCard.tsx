import { ProposalDraft, ProposalDraftVote } from "@prisma/client";
import Link from "next/link";
import HumanAddress from "@/components/shared/HumanAddress";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useAccount } from "wagmi";
import voteForProposalDraft from "./actions/voteForProposalDraft";

const DraftProposalCard = ({
  proposal,
  updateProposalVote,
}: {
  proposal: ProposalDraft & {
    votes: ProposalDraftVote[];
    vote_weight: number;
  };
  updateProposalVote: (proposalId: number, vote: any) => void;
}) => {
  const { address } = useAccount();
  const voterInVotes = proposal.votes.find((v) => v.voter === address);

  const handleVote = async (direction: 1 | -1) => {
    if (!address) return;

    updateProposalVote(proposal.id, {
      voter: address,
      weight: 1,
      direction,
    });

    await voteForProposalDraft({
      address,
      proposalId: proposal.id.toString(),
      direction,
    });

    // Don't refetch -- it messes up the sort order. We can refetch with a dx to sort/filter
    // or hard refresh -- the changes are already in bc of the updates to query cache.
    // If we try catch, maybe we can revalidate on error.
  };

  return (
    <Link
      href={`/proposals/sponsor/${proposal.id}`}
      className="block cursor-pointer border-b border-line last:border-b-0 hover:bg-tertiary/5 transition-colors"
    >
      <div className="py-4 px-6 flex flex-row gap-4 items-center">
        <div className="flex flex-col gap-2 items-center">
          <div
            className={`w-5 h-5 bg-neutral border border-line rounded flex items-center justify-center hover:bg-tertiary/5 transition-colors ${
              voterInVotes && voterInVotes.direction === 1
                ? "bg-tertiary/5"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!address) return;
              handleVote(1);
            }}
          >
            <ChevronUpIcon className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-xs text-secondary font-bold">
            {proposal.vote_weight}
          </div>
          <div
            className={`w-5 h-5 bg-neutral border border-line rounded flex items-center justify-center hover:bg-tertiary/5 transition-colors ${
              voterInVotes && voterInVotes.direction === -1
                ? "bg-tertiary/5"
                : ""
            }`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!address) return;
              handleVote(-1);
            }}
          >
            <ChevronDownIcon className="w-4 h-4 text-secondary" />
          </div>
        </div>
        <div className="flex flex-col justify-between">
          <div className="flex flex-row gap-1 text-xs text-secondary">
            <div>
              Draft Proposal{" "}
              <span className="hidden sm:inline">
                by <HumanAddress address={proposal.author_address} />
              </span>
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <span className="text-primary">{proposal.title || "Untitled"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DraftProposalCard;
