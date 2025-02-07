"use client";

import { Delegate } from "@/app/api/common/delegates/delegate";
import { useVoterStats } from "@/hooks/useVoterStats";

interface Props {
  delegate: Delegate;
}

export const DelegateCardHeader = ({ delegate }: Props) => {
  const { data: voterStats } = useVoterStats({ address: delegate.address });
  if (!voterStats) {
    return null;
  }

  const percentParticipation = Number(
    Math.round(
      ((voterStats.last_10_props / Math.min(10, voterStats.total_proposals)) *
        100 || 0) * 100
    ) / 100
  );

  return percentParticipation > 50 ? (
    <ActiveHeader
      outOfTen={voterStats.last_10_props.toString()}
      totalProposals={voterStats.total_proposals}
      percentParticipation={percentParticipation}
    />
  ) : (
    <InactiveHeader
      outOfTen={voterStats.last_10_props.toString()}
      totalProposals={voterStats.total_proposals}
      percentParticipation={percentParticipation}
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
      title="Active delegate"
      cornerTitle={`🎉 ${percentParticipation}%`}
      subtitle={`Voted in ${outOfTen}/${Math.min(10, totalProposals)} of the most recent proposals`}
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
      subtitle={`Voted in ${outOfTen}/${Math.min(10, totalProposals)} of the most recent proposals`}
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
