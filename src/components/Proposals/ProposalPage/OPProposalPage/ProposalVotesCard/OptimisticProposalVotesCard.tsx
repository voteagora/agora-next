"use client";

import { useState } from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import { icons } from "@/assets/icons/icons";

const OptimisticProposalVotesCard = ({
  proposal,
  proposalVotes,
  disapprovalThreshold,
  againstRelativeAmount,
  againstLengthString,
  fetchProposalVotes,
  fetchDelegate,
  fetchDelegateStatement,
  fetchUserVotesForProposal,
  fetchCurrentDelegators,
  status,
}: {
  proposal: Proposal;
  proposalVotes: any;
  disapprovalThreshold: number;
  againstRelativeAmount: string;
  againstLengthString: string;
  fetchProposalVotes: (proposal_id: string) => void;
  fetchDelegate: (address: string) => void;
  fetchDelegateStatement: (address: string) => void;
  fetchUserVotesForProposal: (proposal_id: string) => void;
  fetchCurrentDelegators: (proposal_id: string) => void;
  status: string;
}) => {
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const handleClick = () => {
    setIsClicked(!isClicked);
    // var div = document.getElementsByClassName("mobile-web-scroll-div")[0];
    // div.scrollTop = 0;
  };
  return (
    <div
      className={`fixed flex justify-between gap-4 sm:sticky top-[auto] sm:top-20 sm:max-h-[calc(100vh-162px)] w-[calc(100%-32px)] max-h-[calc(100%-190px)] items-stretch flex-shrink max-w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${isClicked ? "bottom-[60px]" : "bottom-[calc(-100%+350px)]"}`}
      style={{
        transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
      }}
    >
      <VStack gap={4} className="min-h-0 shrink py-4">
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block sm:hidden"
        >
          <HStack justifyContent="justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </HStack>
        </button>
        <div>
          <div className="py-0 px-4 font-semibold mb-2">Proposal votes</div>
          <div className="pt-4 px-4 rounded-md shrink-0 text-xs border border-line mx-4 shadow-newDefault flex flex-col gap-1">
            {proposal.status === "CANCELLED" ? (
              <p className="text-red-negative font-bold">
                This proposal has been cancelled
              </p>
            ) : (
              <div>
                <p
                  className={
                    status === "approved"
                      ? "text-green-positive font-bold"
                      : "text-red-negative font-bold"
                  }
                >
                  This proposal is optimistically {status}
                </p>

                <p className="mt-1 font-normal text-secondary">
                  This proposal will automatically pass unless{" "}
                  {disapprovalThreshold}% of the votable supply of OP is
                  against. Currently {againstRelativeAmount}% (
                  {againstLengthString} OP) is against.
                </p>
              </div>
            )}
            <ProposalStatusDetail
              proposalStatus={proposal.status}
              proposalEndTime={proposal.end_time}
              proposalStartTime={proposal.start_time}
              proposalCancelledTime={proposal.cancelled_time}
              cancelledTransactionHash={proposal.cancelled_transaction_hash}
            />
          </div>
        </div>
        {/* Show the scrolling list of votes for the proposal */}
        <ProposalVotesList
          initialProposalVotes={proposalVotes}
          // @ts-ignore
          fetchVotesForProposal={fetchProposalVotes}
          fetchDelegate={fetchDelegate}
          fetchDelegateStatement={fetchDelegateStatement}
          fetchUserVotes={fetchUserVotesForProposal}
          proposal_id={proposal.id}
          getDelegators={fetchCurrentDelegators}
        />
        {/* Show the input for the user to vote on a proposal if allowed */}
        <CastVoteInput proposal={proposal} isOptimistic />
        <p className="mx-4 text-xs text-secondary">
          If you agree with this proposal, you don’t need to vote. Only vote
          against if you oppose this proposal.
        </p>
      </VStack>
    </div>
  );
};

export default OptimisticProposalVotesCard;
