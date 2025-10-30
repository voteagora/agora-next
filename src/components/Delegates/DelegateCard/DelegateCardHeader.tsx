"use client";

import { Delegate } from "@/app/api/common/delegates/delegate";
import {
  useVoterStats,
  useDelegateStats,
  useArchiveParticipation,
} from "@/hooks/useVoterStats";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  delegate: Delegate;
}

export const DelegateCardHeader = ({ delegate }: Props) => {
  const { data: voterStats } = useVoterStats({ address: delegate.address });
  const { data: delegateResponse, error: delegateStatsError } =
    useDelegateStats({
      address: delegate.address,
    });

  const { ui } = Tenant.current();
  const showParticipation = ui.toggle("show-participation")?.enabled || false;
  const useArchiveForProposals =
    ui.toggle("use-archive-for-proposals")?.enabled || false;

  // Always call archive hook to keep hook order stable across renders
  const { data: archiveParticipation } = useArchiveParticipation({
    address: delegate.address,
    enabled: useArchiveForProposals,
  });

  const showHeader = showParticipation || useArchiveForProposals;

  if (!delegateResponse || delegateStatsError || !showHeader) {
    return null;
  }

  const delegateStats = delegateResponse.delegate;
  const numRecentVotes = delegateStats.participation[0];
  const numRecentProposals = delegateStats.participation[1];

  // Minimal change: optionally override counts for archive tenants
  let votesCount = numRecentVotes;
  let totalProposals = numRecentProposals;
  if (useArchiveForProposals) {
    if (!archiveParticipation) return <PendingActivityHeader />;
    votesCount = archiveParticipation.participated;
    totalProposals = archiveParticipation.totalProposals;
  }

  const eligible = totalProposals >= 10;
  if (!eligible) return <PendingActivityHeader />;

  const participationRate = votesCount / totalProposals;
  const participationString = Math.floor(participationRate * 100);

  if (participationRate > 0.5) {
    return (
      <ActiveHeader
        outOfTen={votesCount.toString()}
        totalProposals={totalProposals}
        percentParticipation={participationString}
      />
    );
  }
  return (
    <InactiveHeader
      outOfTen={votesCount.toString()}
      totalProposals={totalProposals}
      percentParticipation={participationString}
    />
  );
};

const ActiveHeader = ({
  outOfTen,
  totalProposals,
  percentParticipation,
}: {
  outOfTen: string;
  totalProposals: number;
  percentParticipation: number;
}) => {
  return (
    <CardHeader
      title="Active delegate 🎉"
      cornerTitle={`${percentParticipation}%`}
      subtitle={`Voted in ${outOfTen}/${totalProposals} of the most recent proposals`}
    />
  );
};

const InactiveHeader = ({
  outOfTen,
  totalProposals,
  percentParticipation,
}: {
  outOfTen: string;
  totalProposals: number;
  percentParticipation: number;
}) => {
  return (
    <CardHeader
      title="Inactive delegate 💤"
      cornerTitle={`${percentParticipation}%`}
      subtitle={`Voted in ${outOfTen}/${totalProposals} of the most recent proposals`}
    />
  );
};

const PendingActivityHeader = () => {
  return (
    <CardHeader
      title={"Gathering Data"}
      cornerTitle={"⏰"}
      subtitle={
        "This delegate has not had voting power for a sufficient number of recent proposals. Check back later!"
      }
    />
  );
};

const CardHeader = ({
  title,
  cornerTitle,
  subtitle,
}: {
  title: string;
  cornerTitle: string;
  subtitle: string;
}) => {
  return (
    <div className="p-7 border border-line bg-tertiary/5 rounded-xl mb-[-16px]">
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-row justify-between">
          <h3 className="text-primary font-medium">{title}</h3>
          <span className="text-primary font-medium">{cornerTitle}</span>
        </div>
        <p className="text-xs font-medium text-tertiary">{subtitle}</p>
      </div>
    </div>
  );
};
