"use client";

import { useState } from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import styles from "../StandardProposalPage.module.scss";
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
    <VStack
      gap={4}
      justifyContent="justify-between"
      className={`${styles.proposal_votes_container} transition-all ${isClicked ? "bottom-[60px]" : "bottom-[calc(-100%+350px)]"}`}
    >
      <VStack gap={4} className={styles.proposal_actions_panel}>
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-white absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block sm:hidden"
        >
          <HStack justifyContent="justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </HStack>
        </button>
        <div>
          <div className={styles.proposal_header}>Proposal votes</div>
          <div className={styles.proposal_votes_summary_container}>
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

                <p className="mt-1 font-normal text-gray-4f">
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
        <p className="mx-4 text-xs text-gray-4f">
          If you agree with this proposal, you don’t need to vote. Only vote
          against if you oppose this proposal.
        </p>
      </VStack>
    </VStack>
  );
};

export default OptimisticProposalVotesCard;
