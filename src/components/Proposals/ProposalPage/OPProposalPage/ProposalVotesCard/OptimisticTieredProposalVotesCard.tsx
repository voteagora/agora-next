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

const BAR_FILL_CLASS = "bg-tertiary";

const TIER_STYLES = {
  fourGroups: {
    badge: "bg-teal-100 text-teal-700 border border-teal-200",
    badgeActive: "bg-teal-600 text-white border border-teal-600",
    dot: "bg-teal-500",
    line: "border-teal-400",
    lineMuted: "border-teal-300/40",
  },
  threeGroups: {
    badge: "bg-violet-100 text-violet-700 border border-violet-200",
    badgeActive: "bg-violet-600 text-white border border-violet-600",
    dot: "bg-violet-500",
    line: "border-violet-400",
    lineMuted: "border-violet-300/40",
  },
  twoGroups: {
    badge: "bg-pink-100 text-pink-700 border border-pink-200",
    badgeActive: "bg-pink-600 text-white border border-pink-600",
    dot: "bg-pink-500",
    line: "border-pink-400",
    lineMuted: "border-pink-300/40",
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

function TierDots({
  total,
  filled,
  tierKey,
}: {
  total: number;
  filled: number;
  tierKey: TierKey;
}) {
  const styles = TIER_STYLES[tierKey];
  const filledCount = Math.min(Math.max(0, filled), total);
  return (
    <div className="flex items-center gap-0.5 shrink-0 whitespace-nowrap">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "inline-block w-1.5 h-1.5 rounded-full shrink-0",
            i < filledCount ? styles.dot : "bg-line"
          )}
        />
      ))}
    </div>
  );
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

  // Scale: maxThreshold * 1.5 gives visual separation for near-miss cases.
  // E.g., with thresholds 11/14/17 → scaleMax ≈ 25.5
  // 10% → 39.2%, 11% → 43.1%, 14% → 54.9%, 17% → 66.7%
  // Gap between 10% and 11% line ≈ 4% of bar width (visible gap)
  const maxThreshold = Math.max(...tiers.map((t) => t.threshold));
  const scaleMax = maxThreshold * 1.5;

  const toPosition = (value: number) => {
    return Math.min((value / scaleMax) * 100, 100);
  };

  // Calculate threshold positions for badge alignment
  const thresholdPositions = tiers.map((t) => toPosition(t.threshold));
  const firstThresholdPos = Math.min(...thresholdPositions);
  const lastThresholdPos = Math.max(...thresholdPositions);

  const outcomeLabel = vetoThresholdMet
    ? proposal.status === "ACTIVE"
      ? "Veto threshold reached"
      : "Proposal Vetoed"
    : proposal.status === "ACTIVE"
      ? "Veto threshold not reached"
      : "Proposal Passing";

  return (
    <div className="p-4">
      <div className="border border-line rounded-lg p-3">
        {/* Header */}
        <div className="mb-3">
          <p
            className={cn("text-xs font-bold", {
              "text-negative": vetoThresholdMet,
              "text-positive": !vetoThresholdMet,
            })}
          >
            {outcomeLabel}
          </p>
          <p className="text-xs text-secondary mt-1 font-normal">
            One of three thresholds are applied, based on the number of groups
            signaling to veto.
          </p>
        </div>

        {/* Single container for consistent coordinate system */}
        <div className="relative w-full min-w-0">
          {/* Threshold badges — flex row with dynamic padding to align with lines */}
          <div
            className="flex items-center justify-between mb-2"
            style={{
              paddingLeft: `${Math.max(0, firstThresholdPos - 6)}%`,
              paddingRight: `${Math.max(0, 100 - lastThresholdPos - 6)}%`,
            }}
          >
            {tiers.map((tier) => {
              const styles = TIER_STYLES[tier.key];
              const isTripped = trippedTiers.has(tier.key);
              return (
                <span
                  key={tier.key}
                  className={cn(
                    "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-semibold tabular-nums",
                    isTripped ? styles.badgeActive : styles.badge,
                    !isTripped && "opacity-50"
                  )}
                  aria-label={`${tier.groupsRequired}/${totalGroups} groups threshold: ${tier.threshold}%${isTripped ? " (exceeded)" : ""}`}
                >
                  {tier.threshold}%
                </span>
              );
            })}
          </div>

          {/* Group bars with color-coded dotted threshold lines */}
          <div className="relative w-full">
            {/* Threshold lines — color matches tier badges */}
            {tiers.map((tier) => {
              const pos = toPosition(tier.threshold);
              const styles = TIER_STYLES[tier.key];
              const isTripped = trippedTiers.has(tier.key);
              return (
                <div
                  key={tier.key}
                  className={cn(
                    "absolute top-0 bottom-0 w-px border-l border-dashed",
                    isTripped ? styles.line : styles.lineMuted
                  )}
                  style={{ left: `${pos}%` }}
                  aria-hidden="true"
                />
              );
            })}

            <div className="relative flex flex-col gap-2.5">
              {groups.map((group) => {
                const pct = Math.min(group.vetoPercentage, 100);
                return (
                  <div key={group.name}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs leading-none text-primary">
                        {group.name}
                      </span>
                      <span className="text-xs tabular-nums text-tertiary">
                        {formatVetoPercentage(pct)}
                      </span>
                    </div>
                    <div
                      className="relative h-[6px] rounded-[10px] bg-line"
                      role="progressbar"
                      aria-valuenow={Number(pct.toFixed(1))}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${group.name} veto percentage: ${pct.toFixed(1)}%`}
                    >
                      <div
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-[10px]",
                          BAR_FILL_CLASS
                        )}
                        style={{ width: `${toPosition(pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tier dots — positioned at same threshold positions */}
          <div className="relative w-full h-5 mt-2">
            {tiers.map((tier) => {
              const pos = toPosition(tier.threshold);
              return (
                <div
                  key={tier.key}
                  className="absolute top-0"
                  style={{
                    left: `${pos}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <TierDots
                    total={tier.groupsRequired}
                    filled={groupsExceedingByTier[tier.key]}
                    tierKey={tier.key}
                  />
                </div>
              );
            })}
          </div>

          <p className="text-[9px] font-semibold uppercase leading-none text-tertiary text-center mt-0.5">
            # of signaling groups
          </p>
        </div>
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
