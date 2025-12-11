import { DelegateProfileImageWithMetadata } from "./DelegateProfileImage";
import DelegateCardClient from "./DelegateCardClient";
import { formatNumber } from "@/lib/tokenUtils";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { SCWProfileImage } from "@/components/Delegates/DelegateCard/SCWProfileImage";
import { DelegateCardHeader } from "@/components/Delegates/DelegateCard/DelegateCardHeader";
import { DelegateCardEditProfile } from "./DelegateCardEditProfile";
import Tenant from "@/lib/tenant/tenant";
import { VotingPowerInfoTooltip } from "@/components/shared/VotingPowerInfoTooltip";

export default function DelegateCard({
  delegate,
  description,
  location,
  followersCount,
  followingCount,
  isEditMode,
}: {
  delegate: Delegate;
  description?: string;
  location?: string;
  followersCount?: string;
  followingCount?: string;
  isEditMode?: boolean;
}) {
  // Display SCW if exists
  const hasSCWAddress = Boolean(delegate.statement?.scw_address);
  const { ui } = Tenant.current();
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  return (
    <div className="flex flex-col static sm:sticky top-16 flex-shrink-0 width-[20rem]">
      <DelegateCardHeader delegate={delegate} />
      <div
        className={`flex flex-col ${useNeutral ? "bg-neutral" : "bg-wash"} border border-line shadow-newDefault rounded-xl`}
      >
        <div className="flex flex-col items-stretch p-7">
          <DelegateProfileImageWithMetadata
            endorsed={delegate.statement?.endorsed}
            address={delegate.address}
            votingPower={delegate.votingPower.total}
            copyable={true}
            description={description}
            location={location}
            followersCount={followersCount}
            followingCount={followingCount}
            scwAddress={delegate.statement?.scw_address}
          />
        </div>
        {!isEditMode && (
          <div className="flex flex-col p-7 border-t border-line">
            <div className="flex flex-col gap-4">
              <PanelRow
                title={
                  <span className="inline-flex items-center">
                    Voting power
                    <VotingPowerInfoTooltip />
                  </span>
                }
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
        )}
        <DelegateCardEditProfile delegateAddress={delegate.address} />
      </div>
    </div>
  );
}

export const PanelRow = ({
  title,
  detail,
  className,
}: {
  title: React.ReactNode;
  detail: string | JSX.Element;
  className?: string;
}) => {
  return (
    <div
      className={`flex flex-row gap-2 justify-between items-center ${className}`}
    >
      <span className="whitespace-nowrap text-secondary">{title}</span>
      <span className="text-right text-secondary font-semibold">{detail}</span>
    </div>
  );
};

export const DelegateCardSkeleton = () => {
  return (
    <div className="flex flex-col static sm:sticky top-16 flex-shrink-0 width-[20rem] h-[300px] bg-tertiary/10 animate-pulse rounded-lg"></div>
  );
};
