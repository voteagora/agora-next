"use client";

import { useMemo } from "react";
import { Proposal } from "@/app/api/common/proposals/proposal";
import {
  ParsedProposalData,
  calculateHybridOptimisticProposalMetrics,
  getProposalTiers,
} from "@/lib/proposalUtils";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "@/icons/InfoIcon";

interface Props {
  proposal: Proposal;
}

interface TierStatus {
  threshold: number;
  requiredGroups: number;
  groupsAtThreshold: number;
  isTriggered: boolean;
}

interface GroupData {
  name: string;
  displayName: string;
  vetoPercentage: number;
  exceedsThreshold: boolean;
}

const TieredVetoThresholdIndicator = ({ proposal }: Props) => {
  const proposalData =
    proposal.proposalData as ParsedProposalData["HYBRID_OPTIMISTIC_TIERED"]["kind"];

  const tiers = useMemo(() => getProposalTiers(proposal), [proposal]);

  const { vetoThresholdMet, groupTallies } = useMemo(
    () => calculateHybridOptimisticProposalMetrics(proposal),
    [proposal]
  );

  const thresholds = useMemo(
    () => ({
      twoGroups: tiers[0],
      threeGroups: tiers[1],
      fourGroups: tiers[2],
    }),
    [tiers]
  );

  const groups: GroupData[] = useMemo(() => {
    const displayNameMap: Record<string, string> = {
      delegates: "Delegates",
      chains: "Chains",
      apps: "Apps",
      users: "Users",
    };

    return groupTallies.map((g) => ({
      name: g.name,
      displayName: displayNameMap[g.name] || g.name,
      vetoPercentage: g.vetoPercentage,
      exceedsThreshold: g.exceedsThreshold,
    }));
  }, [groupTallies]);

  const tierStatuses: TierStatus[] = useMemo(() => {
    const groupsAt2Threshold = groupTallies.filter(
      (g) => g.vetoPercentage >= thresholds.twoGroups
    ).length;
    const groupsAt3Threshold = groupTallies.filter(
      (g) => g.vetoPercentage >= thresholds.threeGroups
    ).length;
    const groupsAt4Threshold = groupTallies.filter(
      (g) => g.vetoPercentage >= thresholds.fourGroups
    ).length;

    return [
      {
        threshold: thresholds.fourGroups,
        requiredGroups: 4,
        groupsAtThreshold: groupsAt4Threshold,
        isTriggered: groupsAt4Threshold >= 4,
      },
      {
        threshold: thresholds.threeGroups,
        requiredGroups: 3,
        groupsAtThreshold: groupsAt3Threshold,
        isTriggered: groupsAt3Threshold >= 3,
      },
      {
        threshold: thresholds.twoGroups,
        requiredGroups: 2,
        groupsAtThreshold: groupsAt2Threshold,
        isTriggered: groupsAt2Threshold >= 2,
      },
    ];
  }, [groupTallies, thresholds]);

  const maxThreshold = Math.max(
    thresholds.twoGroups,
    thresholds.threeGroups,
    thresholds.fourGroups
  );
  const barMaxPercentage = Math.max(maxThreshold + 10, 30);

  const getBarWidthPercentage = (vetoPercentage: number) => {
    return Math.min((vetoPercentage / barMaxPercentage) * 100, 100);
  };

  const getThresholdPosition = (threshold: number) => {
    return (threshold / barMaxPercentage) * 100;
  };

  const getStatusText = () => {
    if (vetoThresholdMet) {
      return proposal.status === "ACTIVE"
        ? "Override threshold reached"
        : "Proposal vetoed";
    }
    return proposal.status === "ACTIVE"
      ? "Below threshold"
      : "Proposal approved";
  };

  const getTierStateStyle = (tier: TierStatus) => {
    if (tier.isTriggered) {
      return "bg-negative/20 border-negative text-negative font-semibold";
    }
    if (tier.groupsAtThreshold >= tier.requiredGroups - 1) {
      return "bg-orange-100 border-orange-400 text-orange-700";
    }
    return "bg-wash border-line text-tertiary";
  };

  return (
    <div className="w-full">
      <div className="px-3 pt-4 pb-3 bg-neutral">
        <div className="flex flex-col gap-1">
          <div
            className={cn("text-sm font-bold leading-7", {
              "text-negative": vetoThresholdMet,
              "text-positive": !vetoThresholdMet,
            })}
          >
            {getStatusText()}
          </div>
          <div className="text-xs text-secondary leading-relaxed">
            The veto threshold changes depending on the % of each group that
            votes to veto.
          </div>
        </div>
      </div>

      <div className="px-3 py-4 bg-white">
        <div className="relative">
          <div className="absolute top-0 bottom-0 flex items-start pt-1">
            {[
              thresholds.fourGroups,
              thresholds.threeGroups,
              thresholds.twoGroups,
            ].map((threshold, idx) => {
              const position = getThresholdPosition(threshold);
              return (
                <div
                  key={`marker-label-${idx}`}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${position}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  <span className="text-[10px] font-semibold text-orange-500">
                    {threshold}%
                  </span>
                </div>
              );
            })}
          </div>

          <div className="pt-5 flex flex-col gap-4">
            {groups.map((group) => (
              <div key={group.name} className="relative">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-primary">
                    {group.displayName}
                  </span>
                  <span className="text-xs font-semibold text-primary">
                    {group.vetoPercentage.toFixed(0)}%
                  </span>
                </div>

                <div className="relative h-2 bg-line rounded-sm overflow-visible">
                  <div
                    className={cn(
                      "absolute top-0 left-0 h-full rounded-sm transition-all",
                      group.exceedsThreshold ? "bg-negative" : "bg-tertiary"
                    )}
                    style={{
                      width: `${getBarWidthPercentage(group.vetoPercentage)}%`,
                    }}
                  />

                  {[
                    thresholds.fourGroups,
                    thresholds.threeGroups,
                    thresholds.twoGroups,
                  ].map((threshold, idx) => {
                    const position = getThresholdPosition(threshold);
                    return (
                      <div
                        key={`marker-${idx}`}
                        className="absolute top-0 bottom-0 w-px bg-tertiary"
                        style={{
                          left: `${position}%`,
                          height: "100%",
                          borderLeft: "1px dashed",
                          borderColor: "rgb(var(--tertiary))",
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-[10px]">
            {[
              { threshold: thresholds.fourGroups, label: "4 of 4" },
              { threshold: thresholds.threeGroups, label: "3 of 4" },
              { threshold: thresholds.twoGroups, label: "2 of 4" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div
                  className="w-px h-3 border-l border-dashed"
                  style={{ borderColor: "rgb(var(--tertiary))" }}
                />
                <span className="text-tertiary font-medium">
                  {item.threshold}% ({item.label} Groups)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-3 py-3 bg-wash border-t border-line">
        <div className="flex items-center gap-1 mb-3">
          <span className="text-xs font-bold text-primary">Tier status</span>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="w-3 h-3 fill-neutral stroke-tertiary" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] p-4 text-xs text-tertiary">
                <p className="text-primary font-bold mb-2">Tiered veto logic</p>
                <p className="mb-1">
                  Veto is triggered if ANY condition is met:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>2 of 4 groups exceed {thresholds.twoGroups}%</li>
                  <li>3 of 4 groups exceed {thresholds.threeGroups}%</li>
                  <li>4 of 4 groups exceed {thresholds.fourGroups}%</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex flex-wrap gap-2">
          {tierStatuses.map((tier, idx) => (
            <div
              key={idx}
              className={cn(
                "px-2 py-1 rounded border text-[10px] transition-all",
                getTierStateStyle(tier)
              )}
            >
              <span>
                {tier.requiredGroups} of 4 @ {tier.threshold}%:{" "}
                {tier.isTriggered
                  ? "Triggered"
                  : `${tier.groupsAtThreshold} of ${tier.requiredGroups}`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TieredVetoThresholdIndicator;
