"use client";
import { useMemo, useState } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal.d";
import { HYBRID_VOTE_WEIGHTS } from "@/lib/constants";
import {
  ParsedProposalResults,
  calculateHybridStandardProposalMetrics,
} from "@/lib/proposalUtils";
import { ExclamationCircleIcon } from "@/icons/ExclamationCircleIcon";
import Image from "next/image";
import checkIcon from "@/icons/check.svg";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import { VotesBar } from "@/components/common/VotesBar";
import { formatNumber } from "@/lib/tokenUtils";
import Tenant from "@/lib/tenant/tenant";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { HybridStandardVotesSummaryTooltip } from "./HybridStandardVotesSummaryTooltip";

const { token } = Tenant.current();

const HybridStandardVotesGroup = ({ proposal }: { proposal: Proposal }) => {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_STANDARD"]["kind"];
  // Calculate weight based on proposal type
  const categoryWeight =
    proposal.proposalType === "HYBRID_STANDARD"
      ? Number(HYBRID_VOTE_WEIGHTS.chains)
      : 1 / 3;

  let voteGroups = [
    {
      name: "Chains",
      forVotes: proposalResults.CHAIN.for || "0",
      againstVotes: proposalResults.CHAIN.against || "0",
      abstainVotes: proposalResults.CHAIN.abstain || "0",
      weight: (categoryWeight * 100).toFixed(2),
    },
    {
      name: "Apps", // Corresponds to APP in offchainResults
      forVotes: proposalResults.APP.for || "0",
      againstVotes: proposalResults.APP.against || "0",
      abstainVotes: proposalResults.APP.abstain || "0",
      weight: (categoryWeight * 100).toFixed(2),
    },
    {
      name: "Users",
      forVotes: proposalResults.USER.for || "0",
      againstVotes: proposalResults.USER.against || "0",
      abstainVotes: proposalResults.USER.abstain || "0",
      weight: (categoryWeight * 100).toFixed(2),
    },
  ];

  if (proposal.proposalType === "HYBRID_STANDARD") {
    voteGroups = [
      {
        name: "Delegates",
        forVotes: formatNumber(
          (proposalResults?.DELEGATES?.for || "0").toString()
        ),
        againstVotes: formatNumber(
          (proposalResults?.DELEGATES?.against || "0").toString()
        ),
        abstainVotes: formatNumber(
          (proposalResults?.DELEGATES?.abstain || "0").toString()
        ),
        weight: (HYBRID_VOTE_WEIGHTS.delegates * 100).toFixed(2),
      },
      ...voteGroups,
    ];
  }

  return (
    <VotesGroupTable
      groups={voteGroups}
      columns={[
        {
          key: "forVotes",
          header: "For",
          width: "w-[60px]",
          textColorClass: "text-positive",
        },
        {
          key: "abstainVotes",
          header: "Abstain",
          width: "w-[60px]",
          textColorClass: "text-secondary",
        },
        {
          key: "againstVotes",
          header: "Against",
          width: "w-[60px]",
          textColorClass: "text-negative",
        },
        {
          key: "weight",
          header: "% Weight",
          width: "w-[60px]",
        },
      ]}
    />
  );
};

const QuorumStatus = ({
  quorumPercentage = 30,
  quorumMet = true,
}: {
  quorumPercentage?: number;
  quorumMet?: boolean;
}) => {
  return (
    <div className="px-3 py-2 border-t gap-4">
      <div className="flex">
        <div className="h-8 inline-flex w-full justify-between">
          <div className="flex justify-start items-center gap-0.5">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <div className="inline-flex items-center gap-0.5">
                    <div className="text-black text-xs font-bold">Quorum</div>
                    <ExclamationCircleIcon className="w-3 h-3 stroke-tertiary" />
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[300px] p-4 text-xs text-tertiary">
                  <p className="text-primary font-bold mb-2">Quorum</p>
                  <p className="line-height-[32px]">
                    Quorum for this proposal is at 30%
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex justify-start items-center gap-1">
            <div
              className={cn(
                "text-right justify-center text-xs font-semibold",
                quorumMet ? "text-positive" : "text-negative"
              )}
            >
              {quorumMet ? "Met" : "Not Met"}
            </div>
            <div className="w-3 h-3 relative overflow-hidden">
              {quorumMet && (
                <Image
                  width="12"
                  height="12"
                  src={checkIcon}
                  alt="check icon"
                />
              )}
            </div>
            <div className="text-right justify-center text-black text-xs font-semibold leading-none">
              {quorumPercentage.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HybridStandardProposalVotesSummary = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const {
    quorumPercentage,
    finalQuorumMet,
    totalForVotesPercentage,
    totalAgainstVotesPercentage,
    totalAbstainVotesPercentage,
    quorumMet,
    finalApproval,
  } = useMemo(
    () => calculateHybridStandardProposalMetrics(proposal),
    [proposal]
  );

  const formatTime = (date: Date | null) => {
    return date ? format(new Date(date), "h:mma MMMM dd yyyy") : "";
  };

  return (
    <>
      <div className="p-4">
        <div className="border border-line rounded-lg">
          <HoverCard
            open={showDetails}
            onOpenChange={setShowDetails}
            openDelay={0}
            closeDelay={0}
          >
            <HoverCardTrigger asChild>
              <div className="cursor-pointer relative">
                <VotesBar
                  forVotes={totalForVotesPercentage}
                  againstVotes={totalAgainstVotesPercentage}
                  abstainVotes={totalAbstainVotesPercentage}
                  quorumPercentage={30}
                />
              </div>
            </HoverCardTrigger>

            <HoverCardContent
              className="w-full w-[125%] p-0"
              side="bottom"
              align="start"
              sideOffset={-90}
              alignOffset={0}
            >
              <HybridStandardVotesSummaryTooltip
                proposal={proposal}
                totalForVotesPercentage={totalForVotesPercentage}
                totalAgainstVotesPercentage={totalAgainstVotesPercentage}
                totalAbstainVotesPercentage={totalAbstainVotesPercentage}
                quorumPercentage={quorumPercentage}
                quorumMet={finalQuorumMet}
                formatTime={formatTime}
                finalApproval={finalApproval}
              />
            </HoverCardContent>
          </HoverCard>
          <HybridStandardVotesGroup proposal={proposal} />
          <QuorumStatus
            quorumPercentage={quorumPercentage}
            quorumMet={quorumMet}
          />
        </div>
      </div>
      {proposal.proposalType === "HYBRID_STANDARD" && (
        <div className="border-t border-line">
          <CastVoteInput proposal={proposal} />
        </div>
      )}
    </>
  );
};

export default HybridStandardProposalVotesSummary;
