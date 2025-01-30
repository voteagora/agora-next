"use client";

import { HStack, VStack } from "@/components/Layout/Stack";
import { ReactNode } from "react";
import { useAgoraContext } from "@/contexts/AgoraContext";
import { Button } from "@/components/ui/button";
import { useModal } from "connectkit";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import { Vote } from "@/app/api/common/votes/vote";
import { type VotingPowerData } from "@/app/api/common/voting-power/votingPower";
import {
  checkMissingVoteForDelegate,
  getVpToDisplay,
  MissingVote,
} from "@/lib/voteUtils";
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
import { UIGasRelayConfig } from "@/lib/tenant/tenantUI";
import { useEthBalance } from "@/hooks/useEthBalance";
import { formatEther } from "viem";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { TENANT_NAMESPACES } from "@/lib/constants";
import useFetchAllForVoting from "@/hooks/useFetchAllForVoting";

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
  const isOptimismTenant =
    Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM;
  const { data, isSuccess } = useFetchAllForVoting({
    proposal,
    blockNumber: isOptimismTenant ? proposal.snapshotBlockNumber : undefined,
  });

  const chains = data?.chains;
  const delegate = data?.delegate;
  const votes = data?.votes;
  const votingPower = data?.votingPower;

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

  // Gas relay settings
  const isGasRelayEnabled = ui.toggle("sponsoredVote")?.enabled === true;
  const gasRelayConfig = ui.toggle("sponsoredVote")?.config as UIGasRelayConfig;

  const { data: sponsorBalance } = useEthBalance({
    enabled: isGasRelayEnabled,
    address: gasRelayConfig?.sponsorAddress,
  });

  // Gas relay is only LIVE when it is enabled in the settings and the sponsor meets minimum eth requirements
  const isGasRelayLive =
    isGasRelayEnabled &&
    Number(formatEther(sponsorBalance || 0n)) >=
      Number(gasRelayConfig.minBalance) &&
    !reason;

  return (
    <VStack className="flex-shrink bg-wash">
      <VStack
        className={`bg-neutral border-b border-line rounded-b-lg flex-shrink ${isGasRelayLive && !showSuccessMessage && "shadow-[0_2px_6px_-1px_rgba(0,0,0,0.05)]"}`}
      >
        <VStack
          justifyContent="justify-between"
          alignItems="items-stretch"
          className="pb-3 pt-1"
        >
          {!isError && !showSuccessMessage && (
            <VStack className="bg-neutral border-t border-line px-3 ">
              {!isLoading && (
                <VStack gap={2}>
                  <textarea
                    placeholder="I believe..."
                    value={reason || undefined}
                    onChange={(e) => setReason(e.target.value)}
                    rows={reason ? undefined : 1}
                    className="text-sm text-primary bg-neutral resize-none rounded-lg border border-line rounded-b-lg focus:outline-none focus:inset-0 focus:shadow-none focus:outline-offset-0 mt-3"
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
                  proposal={proposal}
                />
              )}
            </VStack>
          )}
          {isError && (!isGasRelayLive || fallbackToStandardVote) && (
            <ErrorState
              message="Error submitting vote"
              button1={{ message: "Cancel", action: reset }}
              button2={{
                message: "Try again",
                action: write,
              }}
            />
          )}
          {isError && isGasRelayLive && !fallbackToStandardVote && (
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
      {isGasRelayLive && !showSuccessMessage && !fallbackToStandardVote && (
        <VotingBanner />
      )}
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
  proposal,
}: {
  supportType: SupportTextProps["supportType"] | null;
  votingPower: VotingPowerData;
  missingVote: MissingVote;
  proposal: Proposal;
}) {
  const { write } = useCastVoteContext();
  const vpToDisplay = getVpToDisplay(votingPower, missingVote);
  const isOptimismTenant =
    Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM;

  if (!supportType) {
    return (
      <div className="pt-3">
        {isOptimismTenant ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="w-full flex items-center justify-center gap-1 text-primary font-medium cursor-help">
                <span className="flex items-center text-xs font-semibold text-primary">
                  Proposal voting power{"\u00A0"}
                  <TokenAmountDisplay amount={vpToDisplay} />
                  <InformationCircleIcon className="w-4 h-4 ml-1" />
                </span>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                align="center"
                className="bg-neutral p-4 rounded-lg border border-line shadow-newDefault w-[calc(100vw-32px)] sm:w-[400px]"
              >
                <div className="flex flex-col gap-4">
                  <div>
                    <div className="text-sm font-semibold text-primary">
                      Proposal launched
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {new Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        timeZoneName: "short",
                      }).format(new Date(proposal.startTime ?? ""))}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Your voting power is captured when proposals launch based on
                    your token holdings and delegations at that time.
                  </div>
                  <div className="text-sm font-medium text-primary">
                    Any changes to your holdings after launch will not affect
                    voting on this proposal.
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <SubmitButton onClick={write} disabled={false}>
            Cast your vote
          </SubmitButton>
        )}
      </div>
    );
  }

  return (
    <div className="pt-3">
      <SubmitButton onClick={write} disabled={false}>
        Submit vote with{"\u00A0"}
        <TokenAmountDisplay amount={vpToDisplay} />
      </SubmitButton>
    </div>
  );
}

const SubmitButton = ({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled: boolean;
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
