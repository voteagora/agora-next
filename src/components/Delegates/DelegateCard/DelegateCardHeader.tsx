"use client";

import { Delegate } from "@/app/api/common/delegates/delegate";
import { useVoterStats, useDelegateStats } from "@/hooks/useVoterStats";
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

  if (
    !voterStats ||
    !delegateResponse ||
    delegateStatsError ||
    !showParticipation
  ) {
    return null;
  }

  const delegateStats = delegateResponse.delegate;

  const numRecentVotes = delegateStats.participation[0];
  const numRecentProposals = delegateStats.participation[1];

  const eligible = numRecentProposals >= 10;

  if (!eligible) {
    return <PendingActivityHeader />;
  }

  const participationRate =
    numRecentVotes / // Numerator
    numRecentProposals; // Denominator

  const participationString = Math.floor(participationRate * 100);

  if (participationRate > 0.5) {
    return (
      <ActiveHeader
        outOfTen={numRecentVotes.toString()}
        totalProposals={numRecentProposals}
        percentParticipation={participationString}
      />
    );
  } else if (participationRate <= 0.5) {
    return (
      <InactiveHeader
        outOfTen={numRecentVotes.toString()}
        totalProposals={numRecentProposals}
        percentParticipation={participationString}
      />
    );
  } else {
    //   Fallback to pending if something goes wrong
    return <PendingActivityHeader />;
  }
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
      title="Active delegate"
      cornerTitle={`🎉 ${percentParticipation}%`}
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
      title="Inactive delegate"
      cornerTitle={`💤 ${percentParticipation}%`}
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
    <div className="px-4 pt-4 pb-8 border border-line bg-tertiary/5 rounded-lg mb-[-16px]">
      <div className="flex flex-col gap-0.5">
        <div className="flex flex-row justify-between">
          <h3 className="text-primary font-bold">{title}</h3>
          <span className="text-primary font-bold">{cornerTitle}</span>
        </div>
        <p className="text-xs text-tertiary">{subtitle}</p>
      </div>
    </div>
  );
};
