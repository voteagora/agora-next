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
import freeGasMegaphon from "@/icons/freeGasMegaphon.gif";
import Tenant from "@/lib/tenant/tenant";
import { icons } from "@/icons/icons";
import Image from "next/image";

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
      <div className="flex flex-col justify-between py-3 px-3 border-t border-line">
        <Button className="w-full" onClick={() => setOpen(true)}>
          Connect wallet to vote
        </Button>
      </div>
    );
  }

  if (!isSuccess || !chains || !delegate || !votes || !votingPower) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-t border-line">
        <DisabledVoteButton reason="Loading..." />
      </div>
    );
  }

  if (!delegate.statement) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-t border-line">
        <NoStatementView />
      </div>
    );
  }

  return (
    <CastVoteContextProvider
      proposal={proposal}
      votes={votes}
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
  const {
    reason,
    setReason,
    support,
    isLoading,
    isSuccess,
    isError,
    fallbackToStandardVote,
    setFallbackToStandardVote,
    reset,
    resetError,
    write,
  } = useCastVoteContext();

  const { ui } = Tenant.current();

  const missingVote = checkMissingVoteForDelegate(votes, votingPower);

  const showSuccessMessage = isSuccess || missingVote === "NONE";

  const canUseRelay = ui.toggle("sponsoredVote") && !reason;

  return (
    <VStack className="flex-shrink bg-wash">
      <VStack
        className={`bg-neutral border-b border-line rounded-b-lg flex-shrink ${ui.toggle("sponsoredVote") && !showSuccessMessage && "shadow-[0_2px_6px_-1px_rgba(0,0,0,0.05)]"}`}
      >
        <VStack
          justifyContent="justify-between"
          alignItems="items-stretch"
          className="pb-3 pt-1"
        >
          {!isError && !showSuccessMessage && (
            <VStack className="border-t border-line px-3 ">
              {!isLoading && (
                <VStack gap={2}>
                  <textarea
                    placeholder="I believe..."
                    value={reason || undefined}
                    onChange={(e) => setReason(e.target.value)}
                    rows={reason ? undefined : 1}
                    className="text-sm resize-none rounded-lg border border-line rounded-b-lg focus:outline-none focus:inset-0 focus:shadow-none focus:outline-offset-0 mt-3"
                  />
                  <VoteButtons
                    proposalStatus={proposal.status}
                    isOptimistic={isOptimistic}
                  />
                </VStack>
              )}
              {isLoading && <LoadingVote />}
              {!isLoading && (
                <VoteSubmitButton
                  supportType={support}
                  votingPower={votingPower}
                  missingVote={checkMissingVoteForDelegate(votes, votingPower)}
                />
              )}
            </VStack>
          )}
          {isError && (!canUseRelay || fallbackToStandardVote) && (
            <ErrorState
              message="Error submitting vote"
              button1={{ message: "Cancel", action: reset }}
              button2={{
                message: "Try again",
                action: write,
              }}
            />
          )}
          {isError && canUseRelay && !fallbackToStandardVote && (
            <ErrorState
              message="Error submitting vote"
              button1={{
                message: "Try regular vote",
                action: () => {
                  resetError();
                  setFallbackToStandardVote(true);
                },
              }}
              button2={{ message: "Try again", action: write }}
            />
          )}
        </VStack>
      </VStack>
      {ui.toggle("sponsoredVote") &&
        !showSuccessMessage &&
        !fallbackToStandardVote && <VotingBanner />}
      {showSuccessMessage && <SuccessMessage />}
    </VStack>
  );
}

function VotingBanner() {
  const { reason } = useCastVoteContext();

  if (reason) {
    return (
      <div className="flex items-center text-sm text-secondary font-medium py-2 px-4 bg-wash border-b border-line rounded-b-lg">
        Voter statements require gas fees.
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-secondary font-medium py-2 px-4 bg-wash border-b border-line rounded-b-lg">
      <img src={freeGasMegaphon.src} alt="Free gas" className="w-6 h-6 mr-2" />
      Voting on Agora is free!
    </div>
  );
}

function VoteSubmitButton({
  supportType,
  votingPower,
  missingVote,
}: {
  supportType: SupportTextProps["supportType"] | null;
  votingPower: VotingPowerData;
  missingVote: MissingVote;
}) {
  const { write } = useCastVoteContext();

  const vpToDisplay = getVpToDisplay(votingPower, missingVote);

  return (
    <div className="pt-3">
      <SubmitButton onClick={write} disabled={!supportType}>
        <>
          Submit vote with{"\u00A0"}
          <TokenAmountDisplay amount={vpToDisplay} />
        </>
      </SubmitButton>
    </div>
  );
}

const SubmitButton = ({
  children,
  onClick,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) => {
  return (
    <Button onClick={onClick} className="w-full" disabled={disabled}>
      {children}
    </Button>
  );
};

function LoadingVote() {
  return (
    <VStack className="w-full pt-3">
      <div className="mb-2 text-sm text-secondary font-medium">
        Casting your vote
      </div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <Button className="w-full" disabled={true}>
          Writing your vote to the chain...
        </Button>
      </div>
    </VStack>
  );
}

function SuccessMessage() {
  const { data, support } = useCastVoteContext();

  const supportColor =
    support?.toLowerCase() === "for"
      ? "text-positive"
      : support?.toLowerCase() === "against"
        ? "text-negative"
        : "text-secondary";

  return (
    <VStack className="w-full text-sm text-secondary font-medium py-2 px-4 bg-wash border-b border-line rounded-b-lg">
      <div className="text-sm text-secondary">
        You{" "}
        <span className={supportColor}>
          voted {support?.toLowerCase() + (support === "ABSTAIN" ? " in" : "")}
        </span>{" "}
        this proposal
      </div>
      <BlockScanUrls
        className="pt-2"
        hash1={data?.sponsoredVoteTxHash || data?.standardTxHash}
        hash2={data?.advancedTxHash}
      />
    </VStack>
  );
}

function VoteButtons({
  proposalStatus,
  isOptimistic,
}: {
  proposalStatus: Proposal["status"];
  isOptimistic: boolean;
}) {
  if (proposalStatus !== "ACTIVE") {
    return <DisabledVoteButton reason="Not open to voting" />;
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
    <Button className="w-full" disabled={true}>
      {reason}
    </Button>
  );
}

function NoStatementView() {
  return (
    <VStack gap={3}>
      <div className="py-2 px-4 bg-line text-xs text-secondary rounded-lg flex items-center gap-2">
        <Image src={icons.info} alt="Info" width={24} height={24} />
        Voting requires a delegate statement. Set yours one now to participate.
      </div>
      <Button
        className="w-full"
        onClick={() => (window.location.href = "/delegates/create")}
      >
        Set up statement
      </Button>
    </VStack>
  );
}

function ErrorState({
  message,
  button1,
  button2,
}: {
  message: string;
  button1: { message: string; action: () => void };
  button2: { message: string; action: () => void };
}) {
  const { reset, setFallbackToStandardVote, resetError } = useCastVoteContext();

  return (
    <VStack gap={3} className="p-3 border-t border-line">
      <div className="py-2 px-4 bg-red-300 text-xs text-red-700 font-medium rounded-lg flex items-center gap-2">
        <Image
          src={icons.infoRed}
          alt="Info"
          width={24}
          height={24}
          className="text-red-700"
        />
        {message}
      </div>
      <HStack gap={2}>
        <Button
          className="w-full"
          variant="elevatedOutline"
          onClick={button1.action}
        >
          {button1.message}
        </Button>
        <Button className="w-full" onClick={button2.action}>
          {button2.message}
        </Button>
      </HStack>
    </VStack>
  );
}
