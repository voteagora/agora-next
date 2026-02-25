"use client";

import { useState, useMemo } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import ProposalStatusDetail from "@/components/Proposals/ProposalStatus/ProposalStatusDetail";
import ProposalVotesFilter from "./ProposalVotesFilter";
import { calculateHybridOptimisticProposalMetrics } from "@/lib/proposalUtils";
import { ProposalVotesTab } from "@/components/common/ProposalVotesTab";
import { VoteOnAtlas } from "@/components/common/VoteOnAtlas";
import CastVoteInput from "@/components/Votes/CastVoteInput/CastVoteInput";
import Tenant from "@/lib/tenant/tenant";
import { HStack } from "@/components/Layout/Stack";
import { icons } from "@/assets/icons/icons";
import { cn } from "@/lib/utils";
import ArchiveProposalVotesList from "@/components/Votes/ProposalVotesList/ArchiveProposalVotesList";
import ArchiveProposalNonVoterList from "@/components/Votes/ProposalVotesList/ArchiveProposalNonVoterList";
import ProposalVotesList from "@/components/Votes/ProposalVotesList/ProposalVotesList";
import ProposalNonVoterList from "@/components/Votes/ProposalVotesList/ProposalNonVoterList";

interface Props {
  proposal: Proposal;
}

const BAR_FILL_COLOR = "#7B8FAF";

const TIER_STYLES = {
  fourGroups: {
    badge: "bg-green-100 text-green-700 border border-green-200",
    badgeActive: "bg-green-600 text-white border border-green-600",
    dot: "bg-green-500",
    label: "text-green-700",
  },
  threeGroups: {
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    badgeActive: "bg-amber-600 text-white border border-amber-600",
    dot: "bg-amber-500",
    label: "text-amber-700",
  },
  twoGroups: {
    badge: "bg-red-100 text-red-700 border border-red-200",
    badgeActive: "bg-red-600 text-white border border-red-600",
    dot: "bg-red-500",
    label: "text-red-700",
  },
} as const;

type TierKey = keyof typeof TIER_STYLES;

interface TierInfo {
  key: TierKey;
  threshold: number;
  groupsRequired: number;
}

interface GroupData {
  name: string;
  vetoPercentage: number;
}

function formatVetoPercentage(value: number): string {
  if (value === 0) return "0%";
  if (value > 0 && value < 1) return `${value.toFixed(1)}%`;
  return `${Math.round(value)}%`;
}

function OptimisticTieredResultsView({ proposal }: { proposal: Proposal }) {
  const { vetoThresholdMet, groupTallies, thresholds } = useMemo(
    () => calculateHybridOptimisticProposalMetrics(proposal),
    [proposal]
  );

  const tiers: TierInfo[] = useMemo(
    () => [
      {
        key: "fourGroups" as const,
        threshold: thresholds.fourGroups,
        groupsRequired: 4,
      },
      {
        key: "threeGroups" as const,
        threshold: thresholds.threeGroups,
        groupsRequired: 3,
      },
      {
        key: "twoGroups" as const,
        threshold: thresholds.twoGroups,
        groupsRequired: 2,
      },
    ],
    [thresholds]
  );

  const groups: GroupData[] = useMemo(() => {
    const order =
      proposal.proposalType === "HYBRID_OPTIMISTIC_TIERED"
        ? ["chains", "apps", "users", "delegates"]
        : ["chains", "apps", "users"];

    return order.map((name) => {
      const tally = groupTallies.find((g) => g.name === name);
      return {
        name: name.charAt(0).toUpperCase() + name.slice(1),
        vetoPercentage: tally?.vetoPercentage || 0,
      };
    });
  }, [proposal.proposalType, groupTallies]);

  const totalGroups = groups.length;

  const groupsExceedingByTier = useMemo(() => {
    const result: Record<TierKey, number> = {
      fourGroups: 0,
      threeGroups: 0,
      twoGroups: 0,
    };
    for (const tier of tiers) {
      result[tier.key] = groupTallies.filter(
        (g) => g.vetoPercentage >= tier.threshold
      ).length;
    }
    return result;
  }, [groupTallies, tiers]);

  const trippedTiers = useMemo(() => {
    const tripped = new Set<TierKey>();
    for (const tier of tiers) {
      if (groupsExceedingByTier[tier.key] >= tier.groupsRequired) {
        tripped.add(tier.key);
      }
    }
    return tripped;
  }, [tiers, groupsExceedingByTier]);

  const maxThreshold = Math.max(...tiers.map((t) => t.threshold));
  const maxPercentage = Math.max(...groups.map((g) => g.vetoPercentage));
  const scaleMax = Math.max(maxThreshold, maxPercentage) * 1.15;

  const toPosition = (value: number) => Math.min((value / scaleMax) * 100, 100);

  const outcomeLabel = vetoThresholdMet
    ? proposal.status === "ACTIVE"
      ? "Veto threshold reached"
      : "Proposal Vetoed"
    : proposal.status === "ACTIVE"
      ? "Veto threshold not reached"
      : "Proposal Approved";

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-3">
        <p
          className={cn("text-sm font-bold", {
            "text-negative": vetoThresholdMet,
            "text-positive": !vetoThresholdMet,
          })}
        >
          {outcomeLabel}
        </p>
        <p className="text-xs text-secondary mt-1 font-normal leading-relaxed">
          The veto threshold changes depending on the % of each group that votes
          to veto.
        </p>
      </div>

      {/* Threshold badges — absolutely positioned at column offsets */}
      <div className="relative h-7 mb-1">
        {tiers.map((tier) => {
          const pos = toPosition(tier.threshold);
          const styles = TIER_STYLES[tier.key];
          const isTripped = trippedTiers.has(tier.key);
          return (
            <div
              key={tier.key}
              className="absolute top-0"
              style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
            >
              <span
                className={cn(
                  "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                  isTripped ? styles.badgeActive : styles.badge
                )}
                aria-label={`${tier.groupsRequired}/${totalGroups} Groups threshold: ${tier.threshold}%${isTripped ? " (exceeded)" : ""}`}
              >
                {tier.threshold}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Group bars with shared dotted column lines */}
      <div className="relative">
        {/* Vertical dotted threshold lines spanning all bars */}
        {tiers.map((tier) => {
          const pos = toPosition(tier.threshold);
          return (
            <div
              key={tier.key}
              className="absolute top-0 bottom-0 w-px border-l border-dashed border-secondary/20"
              style={{ left: `${pos}%` }}
              aria-hidden="true"
            />
          );
        })}

        {/* Group rows */}
        <div className="relative flex flex-col gap-3">
          {groups.map((group) => {
            const pct = Math.min(group.vetoPercentage, 100);
            return (
              <div key={group.name}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-xs font-semibold text-primary">
                    {group.name}
                  </span>
                  <span className="text-xs font-semibold tabular-nums text-primary">
                    {formatVetoPercentage(pct)}
                  </span>
                </div>
                <div
                  className="relative h-2 rounded-[10px] bg-line"
                  role="progressbar"
                  aria-valuenow={Number(pct.toFixed(1))}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${group.name} veto percentage: ${pct.toFixed(1)}%`}
                >
                  <div
                    className="absolute inset-y-0 left-0 rounded-[10px]"
                    style={{
                      width: `${toPosition(pct)}%`,
                      backgroundColor: BAR_FILL_COLOR,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tier labels — absolutely positioned at column offsets, color-coded */}
      <div className="relative h-10 mt-1">
        {tiers.map((tier) => {
          const pos = toPosition(tier.threshold);
          const styles = TIER_STYLES[tier.key];
          const isTripped = trippedTiers.has(tier.key);
          return (
            <div
              key={tier.key}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
            >
              <span
                className={cn(
                  "text-xs font-semibold whitespace-nowrap leading-tight",
                  isTripped ? styles.label : "text-tertiary"
                )}
              >
                {tier.groupsRequired}/{totalGroups}
              </span>
              <span
                className={cn(
                  "text-xs font-semibold whitespace-nowrap leading-tight",
                  isTripped ? styles.label : "text-tertiary"
                )}
              >
                Groups
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-secondary">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-line shrink-0" />
          <span>Below threshold</span>
        </div>
        {tiers
          .sort((a, b) => a.groupsRequired - b.groupsRequired)
          .map((tier) => {
            const styles = TIER_STYLES[tier.key];
            const exceeding = groupsExceedingByTier[tier.key];
            const remaining = tier.groupsRequired - exceeding;
            const label =
              remaining <= 0
                ? `${tier.groupsRequired}/${totalGroups} exceeded`
                : `${remaining} group${remaining !== 1 ? "s" : ""} needed`;
            return (
              <div key={tier.key} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "inline-block w-2 h-2 rounded-full shrink-0",
                    styles.dot
                  )}
                />
                <span>{label}</span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

const OptimisticTieredProposalVotesCard = ({ proposal }: Props) => {
  const [showVoters, setShowVoters] = useState(true);
  const [activeTab, setActiveTab] = useState("results");
  const [isClicked, setIsClicked] = useState<boolean>(false);
  const { ui } = Tenant.current();
  const useArchiveVoteHistory = ui.toggle(
    "use-archive-for-vote-history"
  )?.enabled;

  const handleClick = () => {
    setIsClicked(!isClicked);
  };

  return (
    <>
      <div
        className={`fixed flex-col justify-between gap-4 md:sticky top-[auto] md:top-20 md:max-h-[calc(100vh-220px)] max-h-[calc(100%-160px)] items-stretch flex-shrink w-[calc(100vw-2rem)] sm:w-[calc(100vw-4rem)] md:w-[20rem] lg:w-[24rem] transition-all ${isClicked ? "bottom-[20px]" : "bottom-[calc(-100%+350px)] h-[calc(100%-320px)] md:h-auto"}`}
        style={{
          transition: "bottom 600ms cubic-bezier(0, 0.975, 0.015, 0.995)",
        }}
      >
        <button
          onClick={handleClick}
          className="border w-10 h-10 rounded-full bg-neutral absolute top-[-20px] left-[calc(50%-20px)] shadow-newDefault block md:hidden"
        >
          <HStack justifyContent="justify-center">
            <img className="opacity-60" src={icons.expand.src} alt="expand" />
          </HStack>
        </button>
        <div className="border border-line rounded-xl mb-2 bg-neutral">
          <ProposalVotesTab setTab={setActiveTab} activeTab={activeTab} />

          {activeTab === "results" ? (
            <>
              <div className="p-4 border-b border-line">
                <ProposalStatusDetail
                  proposalStatus={proposal.status}
                  proposalEndTime={proposal.endTime}
                  proposalStartTime={proposal.startTime}
                  proposalCancelledTime={proposal.cancelledTime}
                  proposalExecutedTime={proposal.executedTime}
                  cancelledTransactionHash={proposal.cancelledTransactionHash}
                  className="border-none m-0 p-0 bg-neutral"
                />
              </div>

              <OptimisticTieredResultsView proposal={proposal} />

              <div className="border-t border-line">
                <CastVoteInput proposal={proposal} isOptimistic />
              </div>
            </>
          ) : (
            <>
              <div className="px-3 py-[10px]">
                <ProposalVotesFilter
                  initialSelection={showVoters ? "Voters" : "Hasn't voted"}
                  onSelectionChange={(value) => {
                    setShowVoters(value === "Voters");
                  }}
                />
              </div>
              {useArchiveVoteHistory ? (
                showVoters ? (
                  <ArchiveProposalVotesList proposal={proposal} />
                ) : (
                  <ArchiveProposalNonVoterList proposal={proposal} />
                )
              ) : showVoters ? (
                <ProposalVotesList
                  proposalId={proposal.id}
                  offchainProposalId={proposal.offchainProposalId}
                />
              ) : (
                <ProposalNonVoterList
                  proposal={proposal}
                  offchainProposalId={proposal.offchainProposalId}
                />
              )}
            </>
          )}
          <VoteOnAtlas
            offchainProposalId={proposal.offchainProposalId || proposal.id}
          />
        </div>
      </div>
    </>
  );
};

export default OptimisticTieredProposalVotesCard;
