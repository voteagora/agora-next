import DelegateContent from "@/components/Delegates/DelegateCardList/DelegateContent";
import { PaginationParams } from "@/app/lib/pagination";
import { SearchParams } from "nuqs/server";
import Tenant from "@/lib/tenant/tenant";
import { BadgeDefinition } from "@/app/api/common/badges/getBadges";
import { fetchDelegatesWithBadge } from "@/app/api/common/badges/getDelegatesWithBadge";

async function fetchDelegatesWithBadgeParams(
  badgeId: string,
  pagination: PaginationParams
) {
  "use server";
  return fetchDelegatesWithBadge({
    badgeDefinitionId: badgeId,
    pagination,
  });
}

const BadgeDelegateWrapper = async ({
  badgeId,
}: {
  badgeId: string;
  badgeDefinition: BadgeDefinition;
  searchParams: SearchParams;
}) => {
  const delegates = await fetchDelegatesWithBadgeParams(badgeId, {
    offset: 0,
    limit: 500,
  });

  return (
    <DelegateContent
      initialDelegates={delegates}
      fetchDelegates={async ({ pagination = { offset: 0, limit: 500 } }) => {
        "use server";
        return fetchDelegatesWithBadgeParams(badgeId, pagination);
      }}
    />
  );
};

export const BadgeDelegateLoadingState = () => {
  return (
    <div>
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-primary font-bold">Badge Holders</h1>
        <div className="flex flex-row gap-2 mt-3 md:mt-0">
          <span className="hidden md:block w-[42px] md:w-[228px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[42px] md:w-[115px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[42px] md:w-[98px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
          <span className="block w-[42px] md:w-[66px] h-[42px] rounded-md bg-tertiary/10 animate-pulse"></span>
        </div>
      </div>
      <div className="grid grid-flow-row grid-cols-1 md:grid-cols-2 lg:grid-cols-3 justify-around sm:justify-between py-4 gap-4 sm:gap-8">
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
        <span className="block w-full h-[250px] rounded-lg bg-tertiary/10 animate-pulse"></span>
      </div>
    </div>
  );
};

export default BadgeDelegateWrapper;
