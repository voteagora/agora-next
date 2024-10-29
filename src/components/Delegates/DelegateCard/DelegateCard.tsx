import { bpsToString, pluralizeAddresses } from "@/lib/utils";
import { DelegateProfileImage } from "./DelegateProfileImage";
import DelegateCardClient from "./DelegateCardClient";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { formatNumber } from "@/lib/tokenUtils";

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
    <div className="px-6 pt-4 pb-6 border border-line bg-tertiary/5 rounded-md mb-[-16px]">
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

const ActiveHeader = ({ outOfTen }: { outOfTen: string }) => {
  return (
    <CardHeader
      title="Active delegate"
      cornerTitle={`🎉 ${parseInt(outOfTen) * 10}%`}
      subtitle={`Voted in ${outOfTen}/10 of the most recent proposals`}
    />
  );
};

const InactiveHeader = ({ outOfTen }: { outOfTen: string }) => {
  return (
    <CardHeader
      title="Inactive delegate"
      cornerTitle={`💤 ${parseInt(outOfTen) * 10}%`}
      subtitle={`Voted in ${outOfTen}/10 of the most recent proposals`}
    />
  );
};

export default function DelegateCard({ delegate }: { delegate: Delegate }) {
  return (
    <div className="flex flex-col sticky top-16 flex-shrink-0 width-[20rem]">
      {delegate.votingParticipation > 0.5 ? (
        <ActiveHeader outOfTen={delegate.lastTenProps} />
      ) : (
        <InactiveHeader outOfTen={delegate.lastTenProps} />
      )}
      <div className="flex flex-col bg-white border border-line shadow-newDefault rounded-xl">
        <div className="flex flex-col items-stretch p-6 border-b border-line">
          <DelegateProfileImage
            endorsed={delegate.statement?.endorsed}
            address={delegate.address}
            citizen={delegate.citizen}
            votingPower={delegate.votingPower.total}
            copyable={true}
          />
        </div>

        <div className="flex flex-col p-6">
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
            {/* <PanelRow
              title="Recent activity"
              detail={
                delegate.lastTenProps
                  ? `${delegate.lastTenProps} of 10 last props`
                  : "N/A"
              }
            /> */}
            <PanelRow
              title="Proposals created"
              detail={`${delegate.proposalsCreated}`}
            />
            <PanelRow
              title="Delegated addresses"
              detail={delegate.numOfDelegators.toString()}
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
