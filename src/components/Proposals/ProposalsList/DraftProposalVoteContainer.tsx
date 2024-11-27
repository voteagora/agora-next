import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { ProposalDraftVote, ProposalDraft } from "@prisma/client";
import { useAccount } from "wagmi";
import voteForProposalDraft from "./actions/voteForProposalDraft";

const DraftProposalVoteContainer = ({
  proposal,
  updateProposalVote,
}: {
  proposal: ProposalDraft & {
    votes: ProposalDraftVote[];
    vote_weight: number;
  };
  updateProposalVote: (
    proposalId: number,
    vote: {
      voter: string;
      weight: number;
      direction: 1 | -1;
    }
  ) => void;
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
    <div className="flex flex-col items-center bg-neutral rounded-full p-1">
      <div
        className={`w-6 h-6 bg-neutral rounded flex items-center justify-center ${
          voterInVotes && voterInVotes.direction === 1
            ? "text-green-500"
            : "text-tertiary/50 hover:text-green-500"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!address) return;
          handleVote(1);
        }}
      >
        <ChevronUpIcon className="w-6 h-6" />
      </div>
      <div className="text-secondary font-medium">{proposal.vote_weight}</div>
      <div
        className={`w-6 h-6 bg-neutral rounded flex items-center justify-center ${
          voterInVotes && voterInVotes.direction === -1
            ? "text-red-500"
            : "text-tertiary/50 hover:text-red-500"
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!address) return;
          handleVote(-1);
        }}
      >
        <ChevronDownIcon className="w-6 h-6" />
      </div>
    </div>
  );
};

export default DraftProposalVoteContainer;
