import {
  ProposalDraft,
  ProposalDraftVote,
  ProposalDraftApprovedSponsors,
} from "@prisma/client";
import Link from "next/link";
import HumanAddress from "@/components/shared/HumanAddress";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useAccount } from "wagmi";
import voteForProposalDraft from "./actions/voteForProposalDraft";
import { formatFullDate } from "@/lib/utils";

const getDraftProposalStatus = (
  proposal: ProposalDraft & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
  },
  loggedInAddress: string | undefined
) => {
  if (!loggedInAddress) {
    return "Needs Sponsor";
  }

  const userInSponsors = proposal.approved_sponsors.find(
    (sponsor) => sponsor.sponsor_address === loggedInAddress
  );

  if (!userInSponsors) {
    return "Needs Sponsor";
  }

  const userDeclinedSponsor = userInSponsors.status === "REJECTED";

  if (userDeclinedSponsor) {
    return "You declined";
  }

  return "Requests you";
};

const DraftProposalCard = ({
  proposal,
  updateProposalVote,
}: {
  proposal: ProposalDraft & {
    approved_sponsors: ProposalDraftApprovedSponsors[];
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
      prefetch={true}
      href={`/proposals/sponsor/${proposal.id}`}
      className="block cursor-pointer border-b border-line last:border-b-0 hover:bg-tertiary/5 transition-colors"
    >
      <div className="py-2 px-2.5 flex flex-row gap-8 items-center">
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
          <div className="text-secondary font-medium">
            {proposal.vote_weight}
          </div>
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
        <div className="w-full sm:w-[55%] flex flex-col justify-between gap-y-1">
          <div className="flex flex-row gap-1 text-xs text-tertiary">
            <div>
              Submitted by <HumanAddress address={proposal.author_address} />
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <span className="text-primary">{proposal.title || "Untitled"}</span>
          </div>
        </div>
        <div className="flex-row gap-24 hidden sm:flex">
          <div className="w-[180px] flex flex-col justify-between gap-y-1">
            <div className="flex flex-row gap-1 text-xs text-tertiary">
              <div>Submitted on</div>
            </div>
            <div>{formatFullDate(proposal.created_at)}</div>
          </div>
          <div className="flex flex-col justify-between gap-y-1">
            <div className="flex flex-row gap-1 text-xs text-tertiary">
              <div>Status</div>
            </div>
            <div className="bg-wash text-secondary border border-line text-xs font-medium px-1 py-0.5 rounded">
              {getDraftProposalStatus(proposal, address)}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DraftProposalCard;
