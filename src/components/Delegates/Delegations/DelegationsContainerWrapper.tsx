import { PaginationParams } from "@/app/lib/pagination";
import DelegationsContainer from "./DelegationsContainer";
import { resolveENSName } from "@/app/lib/ENSUtils";
import {
  fetchCurrentDelegatees,
  fetchCurrentDelegators,
} from "@/app/delegates/actions";

const DelegationsContainerWrapper = async ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => {
  const address = (await resolveENSName(addressOrENSName)) || addressOrENSName;
  const [delegatees, delegators] = await Promise.all([
    fetchCurrentDelegatees(address),
    fetchCurrentDelegators(address),
  ]);
  return (
    <DelegationsContainer
      delegatees={delegatees}
      initialDelegators={delegators}
      fetchDelegators={async (pagination: PaginationParams) => {
        "use server";
        return fetchCurrentDelegators(addressOrENSName, pagination);
      }}
    />
  );
};

export const DelegationsContainerSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse p-12 rounded-lg bg-tertiary/10">
      <div className="h-4 w-1/2 bg-tertiary/20 rounded-md"></div>
      <div className="h-4 w-1/3 bg-tertiary/20 rounded-md"></div>
    </div>
  );
};

export default DelegationsContainerWrapper;
