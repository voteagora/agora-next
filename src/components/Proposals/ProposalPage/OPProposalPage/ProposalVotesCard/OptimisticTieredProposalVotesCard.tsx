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

const TIER_COLORS = {
  fourGroups: {
    badge: "bg-green-200 text-green-600",
    badgeActive: "bg-green-600 text-white",
    dot: "bg-green-600",
    line: "border-green-600",
  },
  threeGroups: {
    badge: "bg-amber-200 text-amber-600",
    badgeActive: "bg-amber-600 text-white",
    dot: "bg-amber-600",
    line: "border-amber-600",
  },
  twoGroups: {
    badge: "bg-red-200 text-red-600",
    badgeActive: "bg-red-600 text-white",
    dot: "bg-red-600",
    line: "border-red-600",
  },
} as const;

type TierKey = keyof typeof TIER_COLORS;

interface TierInfo {
  key: TierKey;
  threshold: number;
  groupsRequired: number;
  label: string;
}

interface GroupData {
  name: string;
  vetoPercentage: number;
  exceedsThreshold: boolean;
}

function VetoThresholdBadge({
  tier,
  isTripped,
}: {
  tier: TierInfo;
  isTripped: boolean;
}) {
  const colors = TIER_COLORS[tier.key];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-1.5 py-0.5 text-xs font-semibold tabular-nums",
        isTripped ? colors.badgeActive : colors.badge
      )}
      aria-label={`${tier.label} threshold: ${tier.threshold}%${isTripped ? " (exceeded)" : ""}`}
    >
      {tier.threshold}%
    </span>
  );
}

function VetoProgressBar({
  group,
  tiers,
  trippedTiers,
  scaleMax,
}: {
  group: GroupData;
  tiers: TierInfo[];
  trippedTiers: Set<TierKey>;
  scaleMax: number;
}) {
  const percentage = Math.min(group.vetoPercentage, 100);

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <div className="text-xs font-semibold text-primary">{group.name}</div>
        <div className="text-xs font-semibold tabular-nums text-primary">
          {percentage.toFixed(0)}%
        </div>
      </div>
      <div
        className="relative h-[6px] rounded-[10px] bg-line overflow-visible"
        role="progressbar"
        aria-valuenow={Number(percentage.toFixed(1))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${group.name} veto percentage: ${percentage.toFixed(1)}%`}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-[10px] bg-tertiary transition-all duration-500"
          style={{
            width: `${Math.min((percentage / scaleMax) * 100, 100)}%`,
          }}
        />
        {tiers.map((tier) => {
          const position = (tier.threshold / scaleMax) * 100;
          if (position > 100) return null;
          const isTripped = trippedTiers.has(tier.key);
          const colors = TIER_COLORS[tier.key];
          return (
            <div
              key={tier.key}
              className={cn(
                "absolute top-[-4px] bottom-[-4px] w-px border-l border-dashed",
                isTripped ? colors.line : "border-secondary/30"
              )}
              style={{ left: `${position}%` }}
              aria-hidden="true"
            />
          );
        })}
      </div>
    </div>
  );
}

function VetoTierLabels({
  tiers,
  trippedTiers,
  scaleMax,
}: {
  tiers: TierInfo[];
  trippedTiers: Set<TierKey>;
  scaleMax: number;
}) {
  return (
    <div className="relative h-7">
      {tiers.map((tier) => {
        const position = (tier.threshold / scaleMax) * 100;
        if (position > 100) return null;
        const isTripped = trippedTiers.has(tier.key);
        return (
          <div
            key={tier.key}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${position}%`, transform: "translateX(-50%)" }}
          >
            <span
              className={cn(
                "text-xs font-semibold whitespace-nowrap leading-tight",
                isTripped ? "text-primary" : "text-tertiary"
              )}
            >
              {tier.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function VetoLegend({
  tiers,
  groupsExceedingByTier,
}: {
  tiers: TierInfo[];
  groupsExceedingByTier: Record<TierKey, number>;
}) {
  const sortedTiers = [...tiers].sort(
    (a, b) => a.groupsRequired - b.groupsRequired
  );

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-secondary">
      <div className="flex items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-line" />
        <span>Below threshold</span>
      </div>
      {sortedTiers.map((tier) => {
        const colors = TIER_COLORS[tier.key];
        const exceedingCount = groupsExceedingByTier[tier.key];
        const remaining = tier.groupsRequired - exceedingCount;
        const label =
          remaining <= 0
            ? `${tier.label} exceeded`
            : `${remaining} group${remaining !== 1 ? "s" : ""} needed`;
        return (
          <div key={tier.key} className="flex items-center gap-1.5">
            <span
              className={cn("inline-block w-2 h-2 rounded-full", colors.dot)}
            />
            <span>{label}</span>
          </div>
        );
      })}
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
        label: "4/4 Groups",
      },
      {
        key: "threeGroups" as const,
        threshold: thresholds.threeGroups,
        groupsRequired: 3,
        label: "3/4 Groups",
      },
      {
        key: "twoGroups" as const,
        threshold: thresholds.twoGroups,
        groupsRequired: 2,
        label: "2/4 Groups",
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
        exceedsThreshold: tally?.exceedsThreshold || false,
      };
    });
  }, [proposal.proposalType, groupTallies]);

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
  const scaleMax = Math.max(maxThreshold * 1.3, maxPercentage * 1.1, 25);

  const outcomeLabel = vetoThresholdMet
    ? proposal.status === "ACTIVE"
      ? "Veto threshold reached"
      : "Proposal Vetoed"
    : proposal.status === "ACTIVE"
      ? "Veto threshold not reached"
      : "Proposal Approved";

  return (
    <div className="p-4 space-y-4">
      <div>
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

      <div className="flex items-center gap-2">
        {tiers.map((tier) => (
          <VetoThresholdBadge
            key={tier.key}
            tier={tier}
            isTripped={trippedTiers.has(tier.key)}
          />
        ))}
      </div>

      <div className="space-y-4">
        {groups.map((group) => (
          <VetoProgressBar
            key={group.name}
            group={group}
            tiers={tiers}
            trippedTiers={trippedTiers}
            scaleMax={scaleMax}
          />
        ))}
      </div>

      <VetoTierLabels
        tiers={tiers}
        trippedTiers={trippedTiers}
        scaleMax={scaleMax}
      />

      <VetoLegend tiers={tiers} groupsExceedingByTier={groupsExceedingByTier} />
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

              <div className="flex-1 bg-neutral border-line mb-[196px]">
                <OptimisticTieredResultsView proposal={proposal} />
              </div>

              <div className="absolute bottom-0 w-full right-0 bg-neutral border rounded-bl-xl rounded-br-xl">
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
