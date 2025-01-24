import { DelegateProfileImage } from "./DelegateProfileImage";
import DelegateCardClient from "./DelegateCardClient";
import { formatNumber } from "@/lib/tokenUtils";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { SCWProfileImage } from "@/components/Delegates/DelegateCard/SCWProfileImage";
import { DelegateCardHeader } from "@/components/Delegates/DelegateCard/DelegateCardHeader";

export default function DelegateCard({ delegate }: { delegate: Delegate }) {
  // Display SCW if exists
  const hasSCWAddress = Boolean(delegate.statement?.scw_address);

  return (
    <div className="flex flex-col sticky top-16 flex-shrink-0 width-[20rem]">
      <DelegateCardHeader delegate={delegate} />
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
          <div className="flex flex-col items-stretch p-4 border-b border-line">
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
