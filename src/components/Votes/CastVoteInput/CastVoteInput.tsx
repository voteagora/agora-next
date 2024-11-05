"use client";

import { VStack, HStack } from "@/components/Layout/Stack";
import { ReactNode } from "react";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { type VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import {
  MissingVote,
  checkMissingVoteForDelegate,
  getVpToDisplay,
} from "@/lib/voteUtils";
import useFetchAllForVoting from "@/hooks/useFetchAllForVoting";
import { TokenAmountDisplay } from "@/lib/utils";
import BlockScanUrls from "@/components/shared/BlockScanUrl";
import CastVoteContextProvider, {
  SupportTextProps,
  useCastVoteContext,
} from "./CastVoteContext";

type Props = {
  proposal: Proposal;
  isOptimistic?: boolean;
};

export default function CastVoteInput({
  proposal,
  isOptimistic = false,
}: Props) {
  const { isConnected } = useAgoraContext();
  const { setOpen } = useModal();
  const { chains, delegate, isSuccess, votes, votingPower } =
    useFetchAllForVoting({
      proposal,
    });

  if (!isConnected) {
    return (
      <div className="flex flex-col justify-between pt-1 pb-3 px-3 mx-4">
        <Button variant={"outline"} onClick={() => setOpen(true)}>
          Connect wallet to vote
        </Button>
      </div>
    );
  }

  if (!isSuccess || !chains || !delegate || !votes || !votingPower) {
    return (
      <div className="flex flex-col justify-between pt-1 pb-3 px-3 mx-4">
        <DisabledVoteButton reason="Loading..." />
      </div>
    );
  }

  return (
    <CastVoteContextProvider
      proposal={proposal}
      missingVote={checkMissingVoteForDelegate(votes, votingPower)}
      chains={chains}
      votingPower={votingPower}
    >
      <CastVoteInputContent
        proposal={proposal}
        votes={votes}
        votingPower={votingPower}
        isOptimistic={isOptimistic}
      />
    </CastVoteContextProvider>
  );
}

function CastVoteInputContent({
  proposal,
  votes,
  votingPower,
  isOptimistic,
}: {
  proposal: Proposal;
  votes: Vote[];
  votingPower: VotingPowerData;
  isOptimistic: boolean;
}) {
  const { reason, setReason, support, isLoading, isSuccess } =
    useCastVoteContext();

  return (
    <>
      <VStack className="bg-neutral border-t border-b border-line rounded-b-lg flex-shrink shadow-md">
        <VStack
          justifyContent="justify-between"
          alignItems="items-stretch"
          className="px-3 pb-3 pt-1"
        >
          {!isLoading && !isSuccess && (
            <VStack gap={2}>
              <textarea
                placeholder="I believe..."
                value={reason || undefined}
                onChange={(e) => setReason(e.target.value)}
                className="text-sm resize-none rounded-lg border border-line rounded-b-lg focus:outline-none focus:inset-0 focus:shadow-none focus:outline-offset-0 mt-3"
              />
              <VoteButtons
                proposalStatus={proposal.status}
                delegateVotes={votes}
                isOptimistic={isOptimistic}
                votingPower={votingPower}
              />
            </VStack>
          )}
          {isLoading && <LoadingVote />}
          {isSuccess && <SuccessMessage />}
          {support && !isSuccess && !isLoading && (
            <VoteSubmitButton
              supportType={support}
              votingPower={votingPower}
              missingVote={checkMissingVoteForDelegate(votes, votingPower)}
            />
          )}
        </VStack>
      </VStack>
      <div className="text-sm text-secondary mt-2 px-4">
        Voting on Agora is free!
      </div>
    </>
  );
}

function VoteSubmitButton({
  supportType,
  votingPower,
  missingVote,
}: {
  supportType: SupportTextProps["supportType"];
  votingPower: VotingPowerData;
  missingVote: MissingVote;
}) {
  const { write } = useCastVoteContext();

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  return (
    <div className="pt-3">
      <SubmitButton onClick={write}>
        <>
          Vote {supportType.toLowerCase()} with{"\u00A0"}
          <TokenAmountDisplay amount={vpToDisplay} />
        </>
      </SubmitButton>
    </div>
  );
}

const SubmitButton = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => {
  return (
    <Button onClick={onClick} className="w-full">
      {children}
    </Button>
  );
};

function LoadingVote() {
  return (
    <VStack className="w-full">
      <div className="mb-2 text-2xl font-black">Casting your vote</div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <div
          className={`flex flex-row justify-center w-full py-3 bg-line rounded-lg`}
        >
          <div className="font-medium text-secondary">
            Writing your vote to the chain...
          </div>
        </div>
      </div>
    </VStack>
  );
}

function SuccessMessage() {
  const { data } = useCastVoteContext();

  return (
    <VStack className="w-full">
      <div className="mb-2 text-2xl font-black">
        Your vote has been submitted!
      </div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected. Thank you
        for your active participation in governance.
      </div>
      <div>
        <div className="text-center bg-neutral rounded-md border border-line font-medium shadow-newDefault cursor-pointer py-3 px-4 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary">
          Got it
        </div>
      </div>
      <BlockScanUrls
        hash1={data?.sponsoredVoteTxHash || data?.standardTxHash}
        hash2={data?.advancedTxHash}
      />
    </VStack>
  );
}

function VoteButtons({
  proposalStatus,
  delegateVotes,
  isOptimistic,
  votingPower,
}: {
  proposalStatus: Proposal["status"];
  delegateVotes: Vote[];
  isOptimistic: boolean;
  votingPower: VotingPowerData;
}) {
  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
  }

  const missingVote = checkMissingVoteForDelegate(delegateVotes, votingPower);

  if (missingVote === "NONE") {
    return <DisabledVoteButton reason="Already voted" />;
  }

  return (
    <HStack gap={2} className="pt-1">
      {(isOptimistic ? ["AGAINST"] : ["FOR", "AGAINST", "ABSTAIN"]).map(
        (supportType) => (
          <VoteButton
            key={supportType}
            action={supportType as SupportTextProps["supportType"]}
          />
        )
      )}
    </HStack>
  );
}

function VoteButton({ action }: { action: SupportTextProps["supportType"] }) {
  const actionString = action.toLowerCase();

  const { support, setSupport } = useCastVoteContext();

  const selectedStyle =
    support === action
      ? actionString === "for"
        ? "border-positive bg-positive/10"
        : actionString === "against"
          ? "border-negative bg-negative/10"
          : "border-secondary bg-secondary/10"
      : "bg-neutral";

  return (
    <button
      className={`${actionString === "for" ? "text-positive" : actionString === "against" ? "text-negative" : "text-secondary"} ${selectedStyle} rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1`}
      onClick={() => setSupport(support === action ? null : action)}
    >
      {action.toLowerCase()}
    </button>
  );
}

function DisabledVoteButton({ reason }: { reason: string }) {
  return (
    <button
      disabled
      className="bg-neutral rounded-md border border-line text-sm font-medium cursor-pointer py-2 px-3 transition-all hover:bg-wash active:shadow-none disabled:bg-line disabled:text-secondary h-8 capitalize flex items-center justify-center flex-1"
    >
      {reason}
    </button>
  );
}
