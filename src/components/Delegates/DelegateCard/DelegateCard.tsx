import { DelegateProfileImage } from "./DelegateProfileImage";
import DelegateCardClient from "./DelegateCardClient";
import { formatNumber } from "@/lib/tokenUtils";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { SCWProfileImage } from "@/components/Delegates/DelegateCard/SCWProfileImage";

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

export default function DelegateCard({
  delegate,
  totalProposals,
}: {
  delegate: Delegate;
  totalProposals: number;
}) {
  const percentParticipation =
    (parseInt(delegate.lastTenProps) / Math.min(10, totalProposals)) * 100 || 0;

  // Display SCW if exists
  const hasSCWAddress = Boolean(delegate.statement?.scw_address);

  return (
    <div className="flex flex-col sticky top-16 flex-shrink-0 width-[20rem]">
      {totalProposals >= 3 ? (
        percentParticipation > 50 ? (
          <ActiveHeader
            outOfTen={delegate.lastTenProps}
            totalProposals={totalProposals}
            percentParticipation={percentParticipation}
          />
        ) : (
          <InactiveHeader
            outOfTen={delegate.lastTenProps}
            totalProposals={totalProposals}
            percentParticipation={percentParticipation}
          />
        )
      ) : null}
      <div className="flex flex-col bg-wash border border-line shadow-newDefault rounded-xl">
        <div className="flex flex-col items-stretch p-4 border-b border-line">
          <DelegateProfileImage
            endorsed={delegate.statement?.endorsed}
            address={delegate.address}
            citizen={delegate.citizen}
            votingPower={delegate.votingPower.total}
            copyable={true}
          />
        </div>
        {hasSCWAddress && (
          <div className="flex flex-col items-stretch p-6 border-b border-line bg-neutral">
            <SCWProfileImage
              address={delegate.statement?.scw_address}
              copyable={true}
            />
          </div>
        )}

        <div className="flex flex-col p-4">
          <div className="flex flex-col gap-4">
            <PanelRow
              title="Voting power"
              detail={formatNumber(delegate.votingPower.total)}
            />
            {/* <PanelRow
              title="Proposals Voted"
              detail={
                !delegate.proposalsVotedOn
                  ? "N/A"
                  : `${delegate.proposalsVotedOn} (${bpsToString(
                      delegate.votingParticipation * 100
                    )})`
              }
            /> */}
            {/* <PanelRow
              title="Recent activity"
              detail={
                delegate.lastTenProps
                  ? `${delegate.lastTenProps} of 10 last props`
                  : "N/A"
              }
            /> */}
            <PanelRow
              title="Delegated addresses"
              detail={delegate.numOfDelegators.toString()}
            />
            <PanelRow
              title="Proposals created"
              detail={`${delegate.proposalsCreated}`}
            />
            <PanelRow
              title="For/Against/Abstain"
              //   detail={`${delegate.votedFor} / ${delegate.votedAgainst} / ${delegate.votedAbstain}`}
              detail={
                <div className="flex flex-row gap-2">
                  <span className="text-positive font-bold border border-line rounded-md px-2 py-1">
                    {delegate.votedFor}
                  </span>
                  <span className="text-negative font-bold border border-line rounded-md px-2 py-1">
                    {delegate.votedAgainst}
                  </span>
                  <span className="text-tertiary font-bold border border-line rounded-md px-2 py-1">
                    {delegate.votedAbstain}
                  </span>
                </div>
              }
            />
            <DelegateCardClient delegate={delegate} />
          </div>
        </div>
      </div>
    </div>
  );
}

export const PanelRow = ({
  title,
  detail,
}: {
  title: string;
  detail: string | JSX.Element;
}) => {
  return (
    <div className="flex flex-row gap-2 justify-between items-center">
      <span className="whitespace-nowrap text-sm text-secondary">{title}</span>
      <span className="text-right text-sm text-secondary font-bold">
        {detail}
      </span>
    </div>
  );
};

export const DelegateCardSkeleton = () => {
  return (
    <div className="flex flex-col sticky top-16 flex-shrink-0 width-[20rem] h-[300px] bg-tertiary/10 animate-pulse rounded-lg"></div>
  );
};
