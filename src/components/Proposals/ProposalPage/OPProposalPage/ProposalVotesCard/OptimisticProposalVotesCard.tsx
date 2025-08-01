"use client";

import { useState } from "react";
import { HStack, VStack } from "@/components/Layout/Stack";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import CastVoteInput, {
  OffchainCastVoteInput,
} from "@/components/Votes/CastVoteInput/CastVoteInput";
import { icons } from "@/assets/icons/icons";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";
import ProposalVotesFilter from "./ProposalVotesFilter";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  proposal: Proposal;
  disapprovalThreshold: number;
  againstRelativeAmount: string;
  againstLengthString: string;
  status: string;
}

const OptimisticProposalVotesCard = ({
  proposal,
  disapprovalThreshold,
  againstRelativeAmount,
  againstLengthString,
  status,
}: Props) => {
  const { token } = Tenant.current();
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const [showVoters, setShowVoters] = useState(true);
  const isOffchain = proposal.proposalType?.startsWith("OFFCHAIN");

  const handleClick = () => {
    setIsClicked(!isClicked);
  };
  return (
    <div
      className={`fixed flex justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] bg-neutral border border-line rounded-xl shadow-newDefault mb-8 transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-160px)] md:h-auto"} sm:overflow-y-auto`}
      style={{
        transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
      }}
    >
      <VStack gap={4} className="min-h-0 shrink py-4">
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block md:hidden"
        >
          <HStack justifyContent="justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </HStack>
        </button>
        <div>
          <div className="py-0 px-4 font-semibold mb-2">Voting activity</div>
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
                      ? "text-positive font-bold"
                      : "text-negative font-bold"
                  }
                >
                  This proposal is optimistically {status}
                </p>

                <p className="mt-1 font-normal text-secondary">
                  This proposal will automatically pass unless{" "}
                  {disapprovalThreshold}% of the votable supply of{" "}
                  {token.symbol} is against. Currently {againstRelativeAmount}%
                  ({againstLengthString} {token.symbol}) is against.
                </p>
              </div>
            )}
            <ProposalStatusDetail
              proposalStatus={proposal.status}
              proposalEndTime={proposal.endTime}
              proposalStartTime={proposal.startTime}
              proposalCancelledTime={proposal.cancelledTime}
              proposalExecutedTime={proposal.executedTime}
              cancelledTransactionHash={proposal.cancelledTransactionHash}
            />
          </div>
        </div>
        <div className="px-4">
          <ProposalVotesFilter
            initialSelection={showVoters ? "Voters" : "Hasn't voted"}
            onSelectionChange={(value) => {
              setShowVoters(value === "Voters");
            }}
          />
        </div>
        {/* Show the scrolling list of votes for the proposal */}
        {showVoters ? (
          <ProposalVotesList proposalId={proposal.id} />
        ) : (
          <ProposalNonVoterList proposal={proposal} />
        )}
        {/* Show the input for the user to vote on a proposal if allowed */}
        {isOffchain ? (
          <OffchainCastVoteInput />
        ) : (
          <CastVoteInput proposal={proposal} isOptimistic />
        )}
        <p className="mx-4 text-xs text-secondary">
          If you agree with this proposal, you don&apos;t need to vote. Only
          vote against if you oppose this proposal.
        </p>
      </VStack>
    </div>
  );
};

export default OptimisticProposalVotesCard;
