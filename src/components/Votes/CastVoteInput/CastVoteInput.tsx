"use client";

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
  calculateVoteMetadata,
} from "@/lib/voteUtils";
import { cn, TokenAmountDisplay } from "@/lib/utils";
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
import { useOpenDialog } from "@/components/Dialogs/DialogProvider/DialogProvider";
import shareIcon from "@/icons/share.svg";
import { format, formatDistanceToNow } from "date-fns";
import { useVotableSupply } from "@/hooks/useVotableSupply";

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
  const { data, isSuccess, isPending } = useFetchAllForVoting({
    proposal,
    blockNumber: isOptimismTenant ? proposal.snapshotBlockNumber : undefined,
  });
  const { data: votableSupply } = useVotableSupply({ enabled: true });

  const chains = data?.chains;
  const delegate = data?.delegate;
  const votes = data?.votes;
  const votingPower = data?.votingPower;

  if (!isConnected) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <Button className="w-full" onClick={() => setOpen(true)}>
          Connect wallet to vote
        </Button>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <DisabledVoteButton reason="Loading..." />
      </div>
    );
  }

  if (isSuccess && !delegate?.statement) {
    return (
      <div className="flex flex-col justify-between py-3 px-3 border-line">
        <NoStatementView />
      </div>
    );
  }

  return (
    <CastVoteContextProvider
      proposal={proposal}
      votes={votes ?? null}
      chains={chains ?? null}
      votingPower={votingPower ?? null}
      votableSupply={votableSupply}
    >
      <CastVoteInputContent
        proposal={proposal}
        votes={votes ?? null}
        votingPower={votingPower ?? null}
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
  votes: Vote[] | null;
  votingPower: VotingPowerData | null;
  isOptimistic: boolean;
}) {
  const {
    reason,
    setReason,
    support,
    isLoading,
    isSuccess,
    isError,
    error,
    fallbackToStandardVote,
    setFallbackToStandardVote,
    reset,
    resetError,
    write,
  } = useCastVoteContext();

  const { ui } = Tenant.current();

  const missingVote = checkMissingVoteForDelegate(
    votes ?? [],
    votingPower ?? {
      advancedVP: "0",
      directVP: "0",
      totalVP: "0",
    }
  );
  const vpToDisplay = votingPower
    ? getVpToDisplay(votingPower, missingVote)
    : null;

  const showSuccessMessage = isSuccess || missingVote === "NONE";

  // Gas relay settings
  const isGasRelayEnabled = ui.toggle("sponsoredVote")?.enabled === true;
  const gasRelayConfig = ui.toggle("sponsoredVote")?.config as UIGasRelayConfig;

  const { data: sponsorBalance } = useEthBalance({
    enabled: isGasRelayEnabled,
    address: gasRelayConfig?.sponsorAddress,
  });

  // Gas relay is only LIVE when it is enabled in the settings and the sponsor meets minimum eth requirements and the user has enough VP
  const isGasRelayLive =
    isGasRelayEnabled &&
    Number(formatEther(sponsorBalance || 0n)) >=
      Number(gasRelayConfig.minBalance) &&
    Number(votingPower?.totalVP ?? "0") >
      Number(gasRelayConfig?.minVPToUseGasRelay) &&
    !reason;

  return (
    <div className="flex flex-col flex-shrink rounded-b-lg">
      <div
        className={`flex flex-col flex-shrink ${isGasRelayLive && !showSuccessMessage && "shadow-[0_2px_6px_-1px_rgba(0,0,0,0.05)]"}`}
      >
        <div className="flex flex-col items-stretch justify-between">
          {!isError && !showSuccessMessage && (
            <div className="px-4 pb-3 pt-1">
              {!isLoading && (
                <div className="flex flex-col gap-2">
                  {proposal.status === "ACTIVE" && (
                    <textarea
                      placeholder="I believe..."
                      value={reason || undefined}
                      onChange={(e) => setReason(e.target.value)}
                      rows={reason ? undefined : 1}
                      className="text-sm text-primary resize-none rounded-lg border border-line rounded-b-lg focus:outline-none focus:inset-0 focus:shadow-none focus:outline-offset-0 mt-3"
                    />
                  )}
                  <div className={cn(proposal.status !== "ACTIVE" && "mt-3")}>
                    <VoteButtons
                      proposalStatus={proposal.status}
                      isOptimistic={isOptimistic}
                    />
                  </div>
                </div>
              )}
              {isLoading && <LoadingVote />}
              {!isLoading && proposal.status === "ACTIVE" && (
                <VoteSubmitButton
                  supportType={support}
                  votingPower={votingPower}
                  missingVote={missingVote}
                  proposal={proposal}
                />
              )}
            </div>
          )}
          {isError && (
            <ErrorState
              message="Error submitting vote"
              error={error}
              button1={
                isGasRelayLive && !fallbackToStandardVote
                  ? {
                      message: "Try regular vote",
                      action: () => {
                        resetError();
                        setFallbackToStandardVote(true);
                      },
                    }
                  : {
                      message: "Cancel",
                      action: reset,
                    }
              }
              button2={{
                message: "Try again",
                action: () => {
                  resetError();
                  setTimeout(() => write(), 50);
                },
              }}
            />
          )}
        </div>
      </div>
      {isGasRelayLive && !showSuccessMessage && !fallbackToStandardVote && (
        <VotingBanner />
      )}
      {showSuccessMessage && (
        <div className="p-4">
          <SuccessMessage
            proposal={proposal}
            votes={votes}
            votingPower={vpToDisplay}
          />
        </div>
      )}
    </div>
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
  votingPower: VotingPowerData | null;
  missingVote: MissingVote;
  proposal: Proposal;
}) {
  const { write } = useCastVoteContext();
  const vpToDisplay = votingPower
    ? getVpToDisplay(votingPower, missingVote)
    : null;
  const isOptimismTenant =
    Tenant.current().namespace === TENANT_NAMESPACES.OPTIMISM;

  if (!supportType && isOptimismTenant && vpToDisplay) {
    return (
      <div className="pt-3">
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
      </div>
    );
  }

  return (
    <div className="pt-3">
      <SubmitButton onClick={write} disabled={!supportType}>
        Submit vote
        {vpToDisplay ? (
          <>
            {" "}
            with{"\u00A0"} <TokenAmountDisplay amount={vpToDisplay} />
          </>
        ) : null}
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
    <div className="flex flex-col w-full pt-3">
      <div className="mb-2 text-sm text-secondary font-medium">
        Casting your vote
      </div>
      <div className="mb-5 text-sm text-secondary">
        It might take up to a minute for the changes to be reflected.
      </div>
      <div>
        <Button className="w-full" disabled={true}>
          Approve transaction in your wallet to vote
        </Button>
      </div>
    </div>
  );
}

export function SuccessMessage({
  proposal,
  votes,
  className,
  votingPower,
}: {
  proposal: Proposal;
  votes: Vote[] | null;
  className?: string;
  votingPower?: string | null;
}) {
  const {
    data,
    support: supportFromContext,
    reason: reasonFromContext,
  } = useCastVoteContext();
  const openDialog = useOpenDialog();
  const { data: votableSupply } = useVotableSupply({ enabled: true });

  const lastVote = votes?.[votes.length - 1];

  const newVote = {
    support: supportFromContext || lastVote?.support,
    reason: reasonFromContext || lastVote?.reason || "",
    params: lastVote?.params || [],
    weight: votingPower || lastVote?.weight || "",
  };

  const {
    support,
    blockNumber,
    timestamp,
    endsIn,
    forPercentage,
    againstPercentage,
    reason,
    transactionHash,
    options,
    totalOptions,
  } = calculateVoteMetadata({
    proposal,
    votes,
    votableSupply,
    newVote,
  });
  console.log(votes);
  const supportColor =
    support?.toLowerCase() === "for"
      ? "text-positive"
      : support?.toLowerCase() === "against"
        ? "text-negative"
        : "text-tertiary";

  return (
    <div
      className={cn(
        "flex flex-col w-full text-sm text-secondary font-medium p-4 pb-2 bg-transparent rounded-b-lg",
        className
      )}
    >
      <Button
        onClick={() => {
          openDialog({
            className: "sm:w-[32rem]",
            type: "SHARE_VOTE",
            params: {
              againstPercentage: againstPercentage,
              forPercentage: forPercentage,
              endsIn: endsIn,
              blockNumber: blockNumber?.toString() || null,
              voteDate: timestamp
                ? format(new Date(timestamp), "MMM d, yyyy h:mm a")
                : "",
              supportType: support || "ABSTAIN",
              voteReason: reason || "",
              proposalId: proposal.id,
              proposalTitle: proposal.markdowntitle,
              proposalType: proposal.proposalType ?? "STANDARD",
              proposal: proposal,
              options: options,
              totalOptions: totalOptions,
              votes,
              newVote,
            },
          });
        }}
        variant="outline"
        className="w-full text-secondary font-semibold text-xs gap-2 rounded-full border-primary h-8"
      >
        <Image src={shareIcon.src} alt="Share icon" height={18} width={18} />
        <span>Share your vote</span>
      </Button>
      <p className="text-[14px] font-bold text-secondary text-center mt-2">
        You voted for this proposal {formatDistanceToNow(new Date(timestamp))}{" "}
        ago
      </p>
      <BlockScanUrls
        className="text-xs font-medium text-tertiary mx-auto pt-1"
        hash1={
          data?.sponsoredVoteTxHash || data?.standardTxHash || transactionHash
        }
        hash2={data?.advancedTxHash}
      />
    </div>
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
    <div className="flex flex-row gap-2 pt-1">
      {(isOptimistic ? ["AGAINST"] : ["FOR", "AGAINST", "ABSTAIN"]).map(
        (supportType) => (
          <VoteButton
            key={supportType}
            action={supportType as SupportTextProps["supportType"]}
          />
        )
      )}
    </div>
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
    <div className="flex flex-col gap-3">
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
    </div>
  );
}

function ErrorState({
  message,
  button1,
  button2,
  error,
}: {
  message: string;
  button1: { message: string; action: () => void };
  button2: { message: string; action: () => void };
  error: any;
}) {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-3 p-3 border-t border-line">
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
            <div className="flex flex-row gap-2">
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
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            {JSON.stringify(
              error || {},
              (key, value) =>
                typeof value === "bigint" ? value.toString() + "n" : value,
              2
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export const OffchainCastVoteInput = () => {
  return (
    <div className="flex flex-col justify-between py-3 px-3 border-t border-line">
      <Button className="w-full" asChild>
        <a href="https://atlas.optimism.io" target="_blank">
          Vote in Atlas
        </a>
      </Button>
    </div>
  );
};
