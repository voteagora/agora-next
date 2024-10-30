import Link from "next/link";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { bpsToString, cn } from "@/lib/utils";
import { formatNumber } from "@/lib/tokenUtils";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import Tenant from "@/lib/tenant/tenant";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { useVotingStats } from "@/hooks/useVotingStats";

const DelegateCard = ({
  delegate,
  isDelegatesCitizensFetching,
  isDelegatesFiltering,
  isAdvancedUser,
  truncatedStatement,
}: {
  delegate: DelegateChunk;
  isDelegatesCitizensFetching: boolean;
  isDelegatesFiltering: boolean;
  isAdvancedUser: boolean;
  truncatedStatement: string;
}) => {
  const { token } = Tenant.current();
  const { advancedDelegators } = useConnectedDelegate();
  const { data: votingStats, isLoading: isVotingStatsLoading } = useVotingStats(
    {
      address: delegate.address as `0x${string}`,
    }
  );

  console.log(votingStats);
  return (
    <div
      key={delegate.address}
      className={cn(
        "flex flex-col",
        isDelegatesCitizensFetching || isDelegatesFiltering
          ? "animate-pulse"
          : ""
      )}
    >
      <Link href={`/delegates/${delegate.address}`}>
        <div className="flex flex-col gap-4 h-full rounded-xl bg-white border border-line shadow-newDefault">
          <div className="flex flex-col gap-4 justify-center pt-4">
            <div className="border-b border-line px-4 pb-4">
              <DelegateProfileImage
                endorsed={delegate.statement?.endorsed}
                address={delegate.address}
                votingPower={delegate.votingPower.total}
                citizen={delegate.citizen}
              />
            </div>
            <div className="px-4 flex flex-row gap-4">
              <span className="text-primary font-bold">
                {formatNumber(delegate.votingPower.total)} {token.symbol}
              </span>
              {isVotingStatsLoading ? (
                <span className="h-[24px] w-[100px] bg-tertiary/10 rounded-md animate-pulse" />
              ) : (
                <span className="text-primary font-bold">
                  {bpsToString(votingStats?.participation_rate || 0 * 100)}{" "}
                  Participation
                </span>
              )}
            </div>
            <p className="text-base leading-normal min-h-[48px] break-words text-secondary overflow-hidden line-clamp-2 px-4">
              {truncatedStatement}
            </p>
          </div>
          <div className="min-h-[24px] px-4 pb-4">
            <DelegateActions
              delegate={delegate}
              isAdvancedUser={isAdvancedUser}
              delegators={advancedDelegators}
            />
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DelegateCard;
