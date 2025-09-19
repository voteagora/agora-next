import { ArrowDownToLine, Copy } from "lucide-react";
import warpcastIcon from "@/icons/warpcast.svg";
import xIcon from "@/icons/x.svg";
import { cn } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import OptionsResultsPanel from "../OPProposalApprovalPage/OptionResultsPanel/OptionResultsPanel";
import { Proposal } from "@/app/api/common/proposals/proposal";
import agoraLogo from "@/icons/agoraIconWithText.svg";
import blockIcon from "@/icons/block.svg";
import { ogLogoForShareVote } from "./TenantLogo";
import { Vote } from "@/app/api/common/votes/vote";
import { format } from "date-fns";
import { useLatestBlock } from "@/hooks/useLatestBlock";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { trackEvent } from "@/lib/analytics";
import { ANALYTICS_EVENT_NAMES, ProposalType } from "@/lib/types.d";

function generateVoteBars(
  forPercentage: number,
  againstPercentage: number,
  proposalType: ProposalType,
  supportType: "FOR" | "AGAINST" | "ABSTAIN"
) {
  const totalBars = 56;
  const bars = [];
  const totalVotes = forPercentage + againstPercentage;

  const className = "h-2.5 sm:h-3 w-[2px] sm:w-[3px] rounded-full shrink-0";

  if (totalVotes === 0) {
    // If no votes, show all bars as the user's vote
    for (let i = 0; i < totalBars; i++) {
      bars.push(
        <div
          key={`${supportType}-${i}`}
          className={cn(
            className,
            supportType === "FOR"
              ? "bg-positive"
              : supportType === "AGAINST"
                ? "bg-negative"
                : "bg-tertiary"
          )}
        />
      );
    }
  } else {
    const forBars = proposalType.includes("OPTIMISTIC")
      ? 0
      : Math.round((totalBars * forPercentage) / 100);
    const againstBars = Math.round((totalBars * againstPercentage) / 100);
    const abstainBars = totalBars - forBars - againstBars;

    // Generate FOR bars
    for (let i = 0; i < forBars; i++) {
      bars.push(
        <div key={`for-${i}`} className={cn(className, "bg-positive")} />
      );
    }

    for (let i = 0; i < abstainBars; i++) {
      bars.push(
        <div key={`neutral-${i}`} className={cn(className, "bg-tertiary")} />
      );
    }

    for (let i = 0; i < againstBars; i++) {
      bars.push(
        <div key={`against-${i}`} className={cn(className, "bg-negative")} />
      );
    }
  }

  return (
    <div className="flex items-center justify-center w-full gap-[2.5px] sm:gap-[4px]">
      {bars}
    </div>
  );
}

const SuccessMessageCard = ({
  forPercentage,
  againstPercentage,
  blockNumber,
  endsIn,
  voteDate,
  supportType,
  proposalType,
  proposal,
  options,
  totalOptions,
}: {
  forPercentage: number;
  againstPercentage: number;
  blockNumber: string | null;
  endsIn: string | null;
  voteDate: string | null;
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
  proposalType: ProposalType;
  proposal: Proposal;
  options: {
    description: string;
    votes: string;
    votesAmountBN: string;
    totalVotingPower: string;
    proposalSettings: any;
    thresholdPosition: number;
    isApproved: boolean;
  }[];
  totalOptions: number;
}) => {
  const { namespace, brandName } = Tenant.current();
  return (
    <div
      className="h-full w-full flex flex-col p-4 bg-[#F3F3EF] relative rounded-lg"
      style={{
        backgroundImage: "url(/images/grid-share.png)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Main Content Container */}
      <div className="flex flex-col w-full h-full">
        {/* Header Section */}
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-0 sm:gap-2">
            <div className="flex items-center gap-[6px]">
              <span className="text-lg sm:text-2xl font-bold">I voted</span>
              <span
                className={cn(
                  "text-lg sm:text-2xl font-bold",
                  supportType === "FOR"
                    ? "text-positive"
                    : supportType === "AGAINST"
                      ? "text-negative"
                      : "text-tertiary"
                )}
              >
                {supportType}
              </span>
            </div>
            <span className="text-sm sm:text-lg text-primary font-normal">
              on a proposal on {brandName} Agora
            </span>
          </div>

          {/* Tenant Logo */}
          {ogLogoForShareVote(namespace)}
        </div>

        {/* Vote Stats Section */}
        <div className="flex flex-col bg-white gap-3 sm:gap-0 rounded-lg border border-line mt-4 sm:mt-6">
          {proposalType === "APPROVAL" ? (
            <div className="py-2">
              <OptionsResultsPanel
                proposal={proposal}
                showAllOptions={false}
                overrideOptions={options}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-2 p-3 sm:p-4 pb-0">
              <div className="flex justify-between w-full">
                <span className="text-xs font-semibold text-positive">
                  {proposalType === "STANDARD" ? "FOR" : ""}
                </span>
                <span className="text-xs font-semibold text-negative">
                  AGAINST
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full relative flex">
                {generateVoteBars(
                  forPercentage,
                  againstPercentage,
                  proposalType,
                  supportType
                )}
              </div>
            </div>
          )}

          {/* Transaction Info */}
          <div className="flex justify-between items-center bg-[#fafafa] px-3 sm:px-4 py-2 border-t border-line rounded-b-lg text-[8px] sm:text-[10px] text-primary font-semibold">
            <div className="flex items-center">
              <span className="flex items-center gap-1 sm:gap-2">
                <div className="w-4 h-4 sm:w-[18px] sm:h-[18px]">
                  <Image
                    src={blockIcon.src}
                    alt="Block"
                    width={18}
                    height={18}
                  />
                </div>
                {blockNumber} · {voteDate}
              </span>
            </div>
            <span>{endsIn}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center mt-4 sm:mt-6">
          <div className="w-[48px] h-[12px] sm:w-[62px] sm:h-[16px]">
            <Image
              src={agoraLogo.src}
              alt="Agora Logo"
              width={62}
              height={16}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export function ShareDialog({
  forPercentage,
  againstPercentage,
  blockNumber,
  endsIn,
  voteDate,
  supportType,
  voteReason,
  proposalId,
  proposalTitle,
  proposalType,
  proposal,
  totalOptions,
  options,
  votes,
  newVote,
}: {
  forPercentage: number;
  againstPercentage: number;
  blockNumber: string | null;
  endsIn: string | null;
  voteDate: string | null;
  supportType: "FOR" | "AGAINST" | "ABSTAIN";
  voteReason: string;
  proposalId: string;
  proposalTitle: string;
  proposalType: ProposalType;
  proposal: Proposal;
  totalOptions: number;
  newVote: {
    support: string;
    reason: string;
    params: string[];
    weight: string;
  };
  options: {
    description: string;
    votes: string;
    votesAmountBN: string;
    totalVotingPower: string;
    proposalSettings: any;
    thresholdPosition: number;
    isApproved: boolean;
  }[];
  votes: Vote[] | null;
}) {
  const { address: accountAddress } = useAccount();
  const latestBlock = useLatestBlock({ enabled: true });
  const voteDateToUse = voteDate ?? format(new Date(), "MMM d, yyyy h:mm a");
  const timestampToUse = new Date(voteDateToUse).getTime();
  const blockNumberToUse =
    blockNumber ?? latestBlock?.data?.number.toString() ?? null;
  const { namespace } = Tenant.current();

  const proposalLink = `${window.location.origin}/proposals/${proposalId}?support=${newVote.support || supportType}&weight=${newVote.weight}&blockNumber=${blockNumberToUse}&timestamp=${timestampToUse}&params=${encodeURIComponent(
    JSON.stringify(newVote.params)
  )}`;

  const [isInCopiedState, setIsInCopiedState] = useState<boolean>(false);
  useEffect(() => {
    let id: NodeJS.Timeout | number | null = null;
    if (isInCopiedState) {
      id = setTimeout(() => {
        setIsInCopiedState(false);
      }, 750);
    }
    return () => {
      if (id) clearTimeout(id);
    };
  }, [isInCopiedState]);

  let text = `I voted ${supportType.charAt(0).toUpperCase() + supportType.toLowerCase().slice(1)}${supportType === "ABSTAIN" ? " on" : ""} ${proposalTitle} ${proposalLink} \n\n${voteReason}`;
  let textWithoutLinkForWarpcast = `I voted ${supportType.charAt(0).toUpperCase() + supportType.toLowerCase().slice(1)}${supportType === "ABSTAIN" ? " on" : ""} ${proposalTitle} \n\n${voteReason}`;

  if (proposalType === "OPTIMISTIC") {
    text = `I voted ${supportType.charAt(0).toUpperCase() + supportType.toLowerCase().slice(1)}${supportType === "ABSTAIN" ? " on" : ""} the optimistic proposal ${proposalTitle} ${proposalLink} \n\n${voteReason}`;
    textWithoutLinkForWarpcast = `I voted ${supportType.charAt(0).toUpperCase() + supportType.toLowerCase().slice(1)}${supportType === "ABSTAIN" ? " on" : ""} the optimistic proposal ${proposalTitle} \n\n${voteReason}`;
  }

  if (proposalType === "APPROVAL") {
    const params = votes?.[0]?.params;
    const paramsString = params
      ?.map((option: string, index: number) => `${++index}. ${option}`)
      .join("\n");
    text = `${supportType === "ABSTAIN" ? "I abstained from voting on " : ""}${proposalTitle} ${proposalLink} \n\n${paramsString ? `I voted for:\n${paramsString}` : ""}\n\n${voteReason}`;
    textWithoutLinkForWarpcast = `${supportType === "ABSTAIN" ? "I abstained from voting on " : ""}${proposalTitle} \n\n${paramsString ? `I voted for:\n${paramsString}` : ""}\n\n${voteReason}`;
  }

  const trackShareVote = (
    type: "X" | "COPY_LINK" | "DOWNLOAD_IMAGE" | "WARPCAST"
  ) => {
    trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.SHARE_VOTE,
      event_data: {
        proposal_id: proposal.id,
        address: accountAddress,
        type,
      },
    });
  };

  return (
    <div className="mt-3 sm:mt-4">
      <SuccessMessageCard
        forPercentage={forPercentage}
        againstPercentage={againstPercentage}
        blockNumber={blockNumberToUse}
        endsIn={endsIn}
        voteDate={voteDateToUse}
        supportType={supportType}
        proposalType={proposalType}
        proposal={proposal}
        options={options}
        totalOptions={totalOptions}
      />

      <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-4">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-bold text-primary">
            Your vote is in!
          </h3>
          <p className="text-sm sm:text-base text-secondary font-medium">
            Let others know how you voted.
          </p>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-center gap-2 font-semibold text-sm sm:text-base"
            onClick={() => {
              window.open(
                `https://warpcast.com/~/compose?text=${encodeURIComponent(
                  textWithoutLinkForWarpcast
                )}&embeds[]=${encodeURIComponent(proposalLink)}`,
                "_blank"
              );
              trackShareVote("WARPCAST");
            }}
          >
            <Image
              height={20}
              width={20}
              className="w-5 h-5"
              src={warpcastIcon.src}
              alt="Warpcast icon"
            />
            Share on Warpcast
          </Button>

          <Button
            variant="outline"
            className="w-full justify-center gap-2 font-semibold text-sm sm:text-base"
            onClick={() => {
              window.open(
                `https://x.com/intent/post?text=${encodeURIComponent(text)}`,
                "_blank"
              );
              trackShareVote("X");
            }}
          >
            <Image
              height={20}
              width={20}
              className="w-5 h-5"
              src={xIcon.src}
              alt="X icon"
            />
            Share on X
          </Button>
          <Button
            variant="link"
            className="w-full justify-center gap-2 text-secondary font-semibold text-sm sm:text-base"
            onClick={async () => {
              try {
                const stringifiedOptions = JSON.stringify(options);
                const response = await fetch(
                  `/api/images/og/share-my-vote?namespace=${namespace.toUpperCase()}&supportType=${supportType}&blockNumber=${blockNumberToUse}&voteDate=${voteDateToUse}&endsIn=${endsIn}&forPercentage=${forPercentage}&againstPercentage=${againstPercentage}&proposalType=${proposal.proposalType}&options=${stringifiedOptions}&totalOptions=${totalOptions}`
                );
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `${namespace}-${proposalTitle}-vote.png`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
              } catch (error) {
                console.error("Error downloading image:", error);
              }
              trackShareVote("DOWNLOAD_IMAGE");
            }}
          >
            <ArrowDownToLine className="h-5 w-5" />
            Download and share
          </Button>
          <Button
            variant="link"
            className="w-full justify-center gap-2 text-secondary font-semibold text-sm sm:text-base"
            onClick={() => {
              navigator.clipboard.writeText(proposalLink);
              setIsInCopiedState(true);
              trackShareVote("COPY_LINK");
            }}
          >
            <Copy className="h-5 w-5" />
            {isInCopiedState ? "Copied!" : "Copy link"}
          </Button>
        </div>
      </div>
    </div>
  );
}
