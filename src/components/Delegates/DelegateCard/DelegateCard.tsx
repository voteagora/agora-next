import { bpsToString, pluralizeAddresses } from "@/lib/utils";
import { DelegateProfileImage } from "./DelegateProfileImage";
import DelegateCardClient from "./DelegateCardClient";
import { Delegate } from "@/app/api/common/delegates/delegate";

export default function DelegateCard({ delegate }: { delegate: Delegate }) {
  return (
    <div className="flex flex-col sticky top-16 flex-shrink-0 width-[20rem]">
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
              title="Proposals Voted"
              detail={
                !delegate.proposalsVotedOn
                  ? "N/A"
                  : `${delegate.proposalsVotedOn} (${bpsToString(
                      delegate.votingParticipation * 100
                    )})`
              }
            />
            <PanelRow
              title="For / Against / Abstain"
              detail={`${delegate.votedFor} / ${delegate.votedAgainst} / ${delegate.votedAbstain}`}
            />
            <PanelRow
              title="Recent activity"
              detail={
                delegate.lastTenProps
                  ? `${delegate.lastTenProps} of 10 last props`
                  : "N/A"
              }
            />
            <PanelRow
              title="Proposals created"
              detail={`${delegate.proposalsCreated}`}
            />
            <PanelRow
              title="Delegated from"
              detail={pluralizeAddresses(Number(delegate.numOfDelegators))}
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
      <span className="whitespace-nowrap">{title}</span>
      <span className="text-right text-sm text-theme-700">{detail}</span>
    </div>
  );
};
