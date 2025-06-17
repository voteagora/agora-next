"use client";
import { useMemo } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal.d";
import { HYBRID_VOTE_WEIGHTS } from "@/lib/constants";
import {
  ParsedProposalResults,
  ParsedProposalData,
  calculateHybridStandardProposalMetrics,
} from "@/lib/proposalUtils";
import { ExclamationCircleIcon } from "@/icons/ExclamationCircleIcon";
import Image from "next/image";
import checkIcon from "@/icons/check.svg";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import VotesGroupTable from "@/components/common/VotesGroupTable";
import { VotesBar } from "@/components/common/VotesBar";
import { cn, formatNumber } from "@/lib/utils";
import Tenant from "@/lib/tenant/tenant";

const { token } = Tenant.current();

const HybridStandardVotesGroup = ({ proposal }: { proposal: Proposal }) => {
  const proposalResults =
    proposal.proposalResults as ParsedProposalResults["HYBRID_STANDARD"]["kind"];
  // Calculate weight based on proposal type
  const categoryWeight =
    proposal.proposalType === "HYBRID_STANDARD"
      ? Number(HYBRID_VOTE_WEIGHTS.chains)
      : 100 / 3;

  let voteGroups = [
    {
      name: "Chains",
      forVotes: proposalResults.CHAIN.for || "0",
      againstVotes: proposalResults.CHAIN.against || "0",
      abstainVotes: proposalResults.CHAIN.abstain || "0",
      weight: (categoryWeight * 100).toFixed(2),
    },
    {
      name: "Apps", // Corresponds to PROJECT in offchainResults
      forVotes: proposalResults.PROJECT.for || "0",
      againstVotes: proposalResults.PROJECT.against || "0",
      abstainVotes: proposalResults.PROJECT.abstain || "0",
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
          (proposalResults?.DELEGATES?.for || "0").toString(),
          token.decimals
        ),
        againstVotes: formatNumber(
          (proposalResults?.DELEGATES?.against || "0").toString(),
          token.decimals
        ),
        abstainVotes: formatNumber(
          (proposalResults?.DELEGATES?.abstain || "0").toString(),
          token.decimals
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
            <div className="text-black text-xs font-bold">Quorum</div>
            <ExclamationCircleIcon className="w-3 h-3 stroke-tertiary" />
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
  const {
    quorumPercentage,
    quorumMet,
    totalForVotesPercentage,
    totalAgainstVotesPercentage,
    totalAbstainVotesPercentage,
  } = useMemo(
    () => calculateHybridStandardProposalMetrics(proposal),
    [proposal]
  );
  return (
    <div className="p-4">
      <div className="border border-line rounded-lg">
        <VotesBar
          forVotes={totalForVotesPercentage}
          againstVotes={totalAgainstVotesPercentage}
          abstainVotes={totalAbstainVotesPercentage}
          quorumPercentage={30}
        />
        <HybridStandardVotesGroup proposal={proposal} />
        <QuorumStatus
          quorumPercentage={quorumPercentage}
          quorumMet={quorumMet}
        />
        <CastVoteInput proposal={proposal} />
      </div>
    </div>
  );
};

export default HybridStandardProposalVotesSummary;
