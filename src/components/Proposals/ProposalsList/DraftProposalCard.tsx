import {
  ProposalDraft,
  ProposalDraftVote,
  ProposalDraftApprovedSponsors,
} from "@prisma/client";
import Link from "next/link";
import HumanAddress from "@/components/shared/HumanAddress";
import { useAccount } from "wagmi";
import { cn, formatFullDate } from "@/lib/utils";
import DraftProposalVoteContainer from "./DraftProposalVoteContainer";

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
  const status = getDraftProposalStatus(proposal, address);

  return (
    <Link
      prefetch={true}
      href={`/proposals/sponsor/${proposal.id}`}
      className="block cursor-pointer border-b border-line last:border-b-0 hover:bg-tertiary/5 transition-colors"
    >
      <div
        className={cn(
          "py-4 px-6 flex flex-row gap-8 items-center",
          status === "You declined" ? "bg-tertiary/5" : ""
        )}
      >
        {/* Voting component -- we are holding this until phase 2 */}
        {/* <DraftProposalVoteContainer proposal={proposal} /> */}
        <div className="w-full sm:w-[55%] flex flex-col justify-between gap-y-1">
          <div className="flex flex-row gap-1 text-xs text-tertiary">
            <div>
              Submitted by <HumanAddress address={proposal.author_address} />
            </div>
          </div>
          <div className="flex flex-row gap-1">
            <span
              className={cn(
                "text-primary",
                status === "Requests you" ? "font-bold" : "",
                status === "You declined" ? "text-tertiary" : ""
              )}
            >
              {proposal.title || "Untitled"}
            </span>
          </div>
        </div>
        <div className="flex-row gap-24 hidden sm:flex">
          <div className="w-[180px] flex flex-col justify-between gap-y-1">
            <div className="flex flex-row gap-1 text-xs text-tertiary">
              <div>Submitted on</div>
            </div>
            <div
              className={cn(
                "text-primary",
                status === "Requests you" ? "font-bold" : "",
                status === "You declined" ? "text-tertiary" : ""
              )}
            >
              {formatFullDate(proposal.created_at)}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-y-1">
            <div className="flex flex-row gap-1 text-xs text-tertiary">
              <div>Status</div>
            </div>
            <div
              className={cn(
                "text-primary",
                status === "Requests you" ? "font-bold" : "",
                status === "You declined" ? "text-tertiary" : ""
              )}
            >
              {status}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DraftProposalCard;
