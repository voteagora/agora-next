"use client";
import { Proposal } from "@/app/api/common/proposals/proposal.d";
import { ProposalType } from "@/lib/types";
import { useMemo } from "react";
import Tenant from "@/lib/tenant/tenant";
import { ParsedProposalResults } from "@/lib/proposalUtils";
import { rgbStringToHex } from "@/app/lib/utils/color";
import { ExclamationCircleIcon } from "@/icons/ExclamationCircleIcon";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";

// The Proposal type from proposal.d.ts now includes offchainResults, so ExtendedProposal is not strictly needed
// but we'll keep the prop name as 'proposal: Proposal' for clarity with its source type.

interface VoteBarProps {
  forVotes: number;
  againstVotes: number;
  abstainVotes: number;
  quorumPercentage?: number; // Overall quorum, will be drawn on the bar
}

type VoteSegment = {
  type: "for" | "against" | "abstain";
  percentage: number;
  color: string;
};

// Using the imported rgbStringToHex function from @/app/lib/utils/color

const VoteBar = ({
  forVotes,
  againstVotes,
  abstainVotes,
  quorumPercentage,
}: VoteBarProps) => {
  const { ui } = Tenant.current();
  const { positive, negative, line } = ui.customization || {};

  const forColor = useMemo(
    () => (positive ? rgbStringToHex(positive) : "#4DE897"),
    [positive]
  );
  const againstColor = useMemo(
    () => (negative ? rgbStringToHex(negative) : "#FF5C57"),
    [negative]
  );
  const abstainColor = useMemo(
    () => (line ? rgbStringToHex(line) : "#E5E5E5"),
    [line]
  );

  const { totalVotes, forPercentage, againstPercentage, abstainPercentage } =
    useMemo(() => {
      const total = forVotes + againstVotes + abstainVotes;
      return {
        totalVotes: total,
        forPercentage: total > 0 ? (forVotes / total) * 100 : 0,
        againstPercentage: total > 0 ? (againstVotes / total) * 100 : 0,
        abstainPercentage: total > 0 ? (abstainVotes / total) * 100 : 0,
      };
    }, [forVotes, againstVotes, abstainVotes]);

  const segments = useMemo<VoteSegment[]>( // Added explicit type for segments
    () =>
      [
        {
          type: "for" as const,
          percentage: forPercentage,
          color: forColor,
        },
        {
          type: "against" as const,
          percentage: againstPercentage,
          color: againstColor,
        },
        {
          type: "abstain" as const,
          percentage: abstainPercentage,
          color: abstainColor,
        },
      ].filter((segment) => segment.percentage > 0),
    [
      forPercentage,
      againstPercentage,
      abstainPercentage,
      forColor,
      againstColor,
      abstainColor,
    ]
  );

  return (
    <div className="p-4 border-b border-line">
      <div className="mb-4">
        {" "}
        {/* Adjusted margin for single bar context */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Total Votes</div>
        </div>
        {/* Single Vote bar */}
        <div className="relative h-3 rounded-full overflow-hidden bg-gray-100">
          {/* Vote segments */}
          <div className="absolute inset-0 flex">
            {segments.map((segment) => (
              <div
                key={segment.type}
                className="h-full"
                style={{
                  width: `${segment.percentage}%`,
                  backgroundColor: segment.color,
                }}
                aria-label={`${segment.type} votes: ${segment.percentage.toFixed(2)}%`}
              />
            ))}
          </div>

          {/* Quorum marker for this group's bar */}
          {quorumPercentage != null && quorumPercentage >= 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-black"
              style={{ left: `${Math.min(quorumPercentage, 100)}%` }} // Cap at 100%
              aria-label={`Quorum threshold: ${quorumPercentage.toFixed(2)}%`}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const HybridStandardVotesGroup = ({ proposal }: { proposal: Proposal }) => {
  const delegateResults =
    proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
  const offchainKind = proposal.offchainResults?.kind;

  const voteGroups = [
    {
      name: "Delegates",
      forVotes: delegateResults?.for ? Number(delegateResults.for) : 0,
      againstVotes: delegateResults?.against
        ? Number(delegateResults.against)
        : 0,
      abstainVotes: delegateResults?.abstain
        ? Number(delegateResults.abstain)
        : 0,
      weight: "50.00%",
    },
    {
      name: "Chains",
      forVotes: offchainKind?.CHAIN?.for ? Number(offchainKind.CHAIN.for) : 0,
      againstVotes: offchainKind?.CHAIN?.against
        ? Number(offchainKind.CHAIN.against)
        : 0,
      abstainVotes: offchainKind?.CHAIN?.abstain
        ? Number(offchainKind.CHAIN.abstain)
        : 0,
      weight: "16.67%",
    },
    {
      name: "Apps", // Corresponds to PROJECT in offchainResults
      forVotes: offchainKind?.PROJECT?.for
        ? Number(offchainKind.PROJECT.for)
        : 0,
      againstVotes: offchainKind?.PROJECT?.against
        ? Number(offchainKind.PROJECT.against)
        : 0,
      abstainVotes: offchainKind?.PROJECT?.abstain
        ? Number(offchainKind.PROJECT.abstain)
        : 0,
      weight: "16.67%",
    },
    {
      name: "Users",
      forVotes: offchainKind?.USER?.for ? Number(offchainKind.USER.for) : 0,
      againstVotes: offchainKind?.USER?.against
        ? Number(offchainKind.USER.against)
        : 0,
      abstainVotes: offchainKind?.USER?.abstain
        ? Number(offchainKind.USER.abstain)
        : 0,
      weight: "16.67%",
    },
  ].map((group) => ({
    ...group,
    forVotes: group.forVotes.toLocaleString(),
    againstVotes: group.againstVotes.toLocaleString(),
    abstainVotes: group.abstainVotes.toLocaleString(),
  }));

  const WrappedTableHead = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <TableHead
        className={cn("w-[60px] p-0 pb-2 text-[9px] text-right", className)}
      >
        {children}
      </TableHead>
    );
  };

  const WrappedTableCell = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => {
    return (
      <TableCell className={cn("p-0 py-1 text-right text-[12px]", className)}>
        {children}
      </TableCell>
    );
  };

  return (
    <div className="self-stretch px-3 pt-4 pb-3 bg-white">
      <Table>
        <TableHeader className="border-none">
          <TableRow className="border-none hover:bg-transparent text-tertiary font-semibold uppercase">
            <TableHead className="w-[100px] p-0 pb-2 text-[9px]">
              Group
            </TableHead>
            <WrappedTableHead>For</WrappedTableHead>
            <WrappedTableHead>Abstain</WrappedTableHead>
            <WrappedTableHead>Against</WrappedTableHead>
            <WrappedTableHead>
              <div className="flex items-center justify-end gap-1">
                Weight
                <ExclamationCircleIcon className="w-3 h-3 stroke-tertiary" />
              </div>
            </WrappedTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {voteGroups.map((group, index) => (
            <TableRow key={index} className="border-0 hover:bg-transparent">
              <WrappedTableCell className="text-primary font-semibold text-left">
                {group.name}
              </WrappedTableCell>
              <WrappedTableCell className="text-positive">
                {group.forVotes}
              </WrappedTableCell>
              <WrappedTableCell className="text-secondary">
                {group.abstainVotes}
              </WrappedTableCell>
              <WrappedTableCell className="text-negative">
                {group.againstVotes}
              </WrappedTableCell>
              <WrappedTableCell className="text-primary">
                {group.weight}
              </WrappedTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const QuorumStatus = ({
  quorumPercentage = 55,
  quorumMet = true,
}: {
  quorumPercentage?: number;
  quorumMet?: boolean;
}) => {
  // Get tenant configuration and convert to hex colors for consistent styling
  const { ui } = Tenant.current();
  const { positive, negative } = ui.customization || {};

  const successColor = useMemo(
    () => (positive ? rgbStringToHex(positive) : "#4DE897"),
    [positive]
  );
  const errorColor = useMemo(
    () => (negative ? rgbStringToHex(negative) : "#FF5C57"),
    [negative]
  );

  return (
    <div className="p-4 border-b border-line">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {quorumMet ? (
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill={successColor}
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 stroke-negative" />
          )}
          <div className="text-sm font-medium">
            {quorumMet ? "Quorum is met" : "Quorum is not met"}
          </div>
        </div>
        <div className="text-right text-black text-xs font-semibold">
          {quorumPercentage.toFixed(2)}%
        </div>
      </div>

      <div className="mt-2 text-tertiary text-xs">
        {quorumMet
          ? `The proposal has reached the required quorum of ${quorumPercentage.toFixed(2)}%.`
          : `The proposal needs to reach a quorum of ${quorumPercentage.toFixed(2)}% to pass.`}
      </div>
    </div>
  );
};

const HybridStandardProposalVotesSummary = ({
  proposal,
}: {
  proposal: Proposal;
}) => {
  console.log("proposal", proposal);
  // Use memoization for vote calculations to prevent unnecessary re-renders
  const {
    quorumPercentage,
    quorumMet,
    totalForVotes,
    totalAgainstVotes,
    totalAbstainVotes,
  } = useMemo(() => {
    // Get on-chain delegate results
    const delegateResults =
      proposal.proposalResults as ParsedProposalResults["STANDARD"]["kind"];
    const delegateFor = delegateResults?.for ? Number(delegateResults.for) : 0;
    const delegateAgainst = delegateResults?.against
      ? Number(delegateResults.against)
      : 0;
    const delegateAbstain = delegateResults?.abstain
      ? Number(delegateResults.abstain)
      : 0;

    // Get off-chain results
    const offchainKind = proposal.offchainResults?.kind;
    const chainFor = offchainKind?.CHAIN?.for
      ? Number(offchainKind.CHAIN.for)
      : 0;
    const chainAgainst = offchainKind?.CHAIN?.against
      ? Number(offchainKind.CHAIN.against)
      : 0;
    const chainAbstain = offchainKind?.CHAIN?.abstain
      ? Number(offchainKind.CHAIN.abstain)
      : 0;

    const projectFor = offchainKind?.PROJECT?.for
      ? Number(offchainKind.PROJECT.for)
      : 0;
    const projectAgainst = offchainKind?.PROJECT?.against
      ? Number(offchainKind.PROJECT.against)
      : 0;
    const projectAbstain = offchainKind?.PROJECT?.abstain
      ? Number(offchainKind.PROJECT.abstain)
      : 0;

    const userFor = offchainKind?.USER?.for ? Number(offchainKind.USER.for) : 0;
    const userAgainst = offchainKind?.USER?.against
      ? Number(offchainKind.USER.against)
      : 0;

    const userAbstain = offchainKind?.USER?.abstain
      ? Number(offchainKind.USER.abstain)
      : 0;

    const calculatedTotalForVotes =
      delegateFor + chainFor + projectFor + userFor;
    const calculatedTotalAgainstVotes =
      delegateAgainst + chainAgainst + projectAgainst + userAgainst;
    const calculatedTotalAbstainVotes =
      delegateAbstain + chainAbstain + projectAbstain + userAbstain;

    // Calculate total votes for quorum calculation
    const totalVotes =
      calculatedTotalForVotes +
      calculatedTotalAgainstVotes +
      calculatedTotalAbstainVotes;

    const quorumValue = proposal.quorum ? Number(proposal.quorum) : 0;
    // Calculate quorum percentage
    const calculatedQuorumPercentage = 40;

    // Check if quorum is met
    const calculatedQuorumMet = calculatedTotalForVotes >= quorumValue;

    return {
      // voteGroupsData: currentVoteGroupsData, // Not used by the refactored VoteBar
      quorumPercentage: calculatedQuorumPercentage,
      quorumMet: calculatedQuorumMet,
      totalForVotes: calculatedTotalForVotes,
      totalAgainstVotes: calculatedTotalAgainstVotes,
      totalAbstainVotes: calculatedTotalAbstainVotes,
    };
  }, [proposal]);

  return (
    <div className="p-4">
      <div className="border border-line rounded-lg">
        <VoteBar
          forVotes={totalForVotes}
          againstVotes={totalAgainstVotes}
          abstainVotes={totalAbstainVotes}
          quorumPercentage={quorumPercentage} // Pass the overall quorum percentage
        />
        <HybridStandardVotesGroup proposal={proposal} />
        <QuorumStatus
          quorumPercentage={quorumPercentage}
          quorumMet={quorumMet}
        />
        {<CastVoteInput proposal={proposal} />}
      </div>
    </div>
  );
};

export default HybridStandardProposalVotesSummary;
