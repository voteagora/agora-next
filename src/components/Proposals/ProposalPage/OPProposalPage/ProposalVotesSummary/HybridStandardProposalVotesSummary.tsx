"use client";
import { Proposal } from "@/app/api/common/proposals/proposal.d";
import { useMemo } from "react";
import { ParsedProposalResults } from "@/lib/proposalUtils";
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
    proposal.proposalType === "HYBRID_STANDARD" ? "16.67%" : "33.33%";
  console.log("proposalResults", formatNumber("1", token.decimals));
  let voteGroups = [
    {
      name: "Chains",
      forVotes: proposalResults.CHAIN.for || "0",
      againstVotes: proposalResults.CHAIN.against || "0",
      abstainVotes: proposalResults.CHAIN.abstain || "0",
      weight: categoryWeight,
    },
    {
      name: "Apps", // Corresponds to PROJECT in offchainResults
      forVotes: proposalResults.PROJECT.for || "0",
      againstVotes: proposalResults.PROJECT.against || "0",
      abstainVotes: proposalResults.PROJECT.abstain || "0",
      weight: categoryWeight,
    },
    {
      name: "Users",
      forVotes: proposalResults.USER.for || "0",
      againstVotes: proposalResults.USER.against || "0",
      abstainVotes: proposalResults.USER.abstain || "0",
      weight: categoryWeight,
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
        weight: "50.00%",
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
  quorumPercentage = 55,
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
  // Use memoization for vote calculations to prevent unnecessary re-renders
  const { quorumPercentage, quorumMet, totalForVotes, totalAgainstVotes } =
    useMemo(() => {
      // Get on-chain delegate results
      const delegateResults =
        proposal.proposalResults as ParsedProposalResults["HYBRID_STANDARD"]["kind"];
      const delegateFor = delegateResults?.DELEGATES?.for
        ? Number(delegateResults.DELEGATES.for)
        : 0;
      const delegateAgainst = delegateResults?.DELEGATES?.against
        ? Number(delegateResults.DELEGATES.against)
        : 0;

      // Get off-chain results
      const chainFor = delegateResults?.CHAIN?.for
        ? Number(delegateResults.CHAIN.for)
        : 0;
      const chainAgainst = delegateResults?.CHAIN?.against
        ? Number(delegateResults.CHAIN.against)
        : 0;

      const projectFor = delegateResults?.PROJECT?.for
        ? Number(delegateResults.PROJECT.for)
        : 0;
      const projectAgainst = delegateResults?.PROJECT?.against
        ? Number(delegateResults.PROJECT.against)
        : 0;

      const userFor = delegateResults?.USER?.for
        ? Number(delegateResults.USER.for)
        : 0;
      const userAgainst = delegateResults?.USER?.against
        ? Number(delegateResults.USER.against)
        : 0;

      const calculatedTotalForVotes =
        delegateFor + chainFor + projectFor + userFor;
      const calculatedTotalAgainstVotes =
        delegateAgainst + chainAgainst + projectAgainst + userAgainst;

      const totalVotes = calculatedTotalForVotes + calculatedTotalAgainstVotes;

      const quorumValue = proposal.quorum ? Number(proposal.quorum) : 0;
      const calculatedQuorumPercentage = (totalVotes / quorumValue) * 100;

      const calculatedQuorumMet = calculatedTotalForVotes >= quorumValue;

      return {
        quorumPercentage: calculatedQuorumPercentage,
        quorumMet: calculatedQuorumMet,
        totalForVotes: calculatedTotalForVotes,
        totalAgainstVotes: calculatedTotalAgainstVotes,
      };
    }, [proposal]);

  return (
    <div className="p-4">
      <div className="border border-line rounded-lg">
        <VotesBar
          forVotes={totalForVotes}
          againstVotes={totalAgainstVotes}
          quorumPercentage={quorumPercentage} // Pass the overall quorum percentage
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
