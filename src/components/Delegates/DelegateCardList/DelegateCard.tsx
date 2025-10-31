import Link from "next/link";
import { DelegateChunk } from "@/app/api/common/delegates/delegate";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/tokenUtils";
import { DelegateProfileImage } from "../DelegateCard/DelegateProfileImage";
import { DelegateActions } from "../DelegateCard/DelegateActions";
import Tenant from "@/lib/tenant/tenant";
import useConnectedDelegate from "@/hooks/useConnectedDelegate";
import { sanitizeContent } from "@/lib/sanitizationUtils";

const DelegateCard = ({
  delegate,
  isDelegatesFiltering,
  isAdvancedUser,
  truncatedStatement,
}: {
  delegate: DelegateChunk;
  isDelegatesFiltering: boolean;
  isAdvancedUser: boolean;
  truncatedStatement: string;
}) => {
  const { token, ui } = Tenant.current();
  const { advancedDelegators } = useConnectedDelegate();

  const sanitizedTruncatedStatement = sanitizeContent(truncatedStatement);

  const showParticipation =
    (ui.toggle("show-participation")?.enabled || false) &&
    !(ui.toggle("hide-participation-delegates-page")?.enabled || false);
  const hide7dChange = ui.toggle("hide-7d-change")?.enabled ?? false;
  const useNeutral =
    ui.toggle("syndicate-colours-fix-delegate-pages")?.enabled ?? false;

  return (
    <div
      key={delegate.address}
      className={cn(
        "flex flex-col",
        isDelegatesFiltering ? "animate-pulse" : ""
      )}
    >
      <Link href={`/delegates/${delegate.address}`}>
        <div
          className={`flex flex-col gap-4 h-full rounded-xl ${useNeutral ? "bg-neutral" : "bg-wash"} border border-line shadow-newDefault`}
        >
          <div className="flex flex-col gap-4 justify-center pt-4">
            <div className="px-4">
              <DelegateProfileImage
                endorsed={delegate.statement?.endorsed}
                address={delegate.address}
                votingPower={delegate.votingPower.total}
                participation={delegate.participation}
                showParticipation={showParticipation}
                showVotingPower={true}
              />
            </div>
            <p className="text-base leading-normal min-h-[48px] break-words text-secondary overflow-hidden line-clamp-2 px-4">
              {sanitizedTruncatedStatement}
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
