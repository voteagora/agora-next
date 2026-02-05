import { PaginationParams } from "@/app/lib/pagination";
import DelegationsContainer from "./DelegationsContainer";
import {
  fetchCurrentDelegatees,
  fetchCurrentDelegators,
} from "@/app/delegates/actions";
import { Delegate } from "@/app/api/common/delegates/delegate";

interface Props {
  delegate: Delegate;
}

const DelegationsContainerWrapper = async ({ delegate }: Props) => {
  // Use scw address for the 'delegated to' if exists
  const hasSCWAddress = Boolean(delegate.statement?.scw_address);

  const [delegatees, delegators] = await Promise.all([
    fetchCurrentDelegatees(
      hasSCWAddress ? delegate.statement?.scw_address : delegate.address
    ),
    fetchCurrentDelegators(delegate.address),
  ]);
  return (
    <DelegationsContainer
      delegatees={delegatees}
      initialDelegators={delegators}
      numOfDelegators={delegate.numOfDelegators}
      fetchDelegators={async (pagination: PaginationParams) => {
        "use server";
        return fetchCurrentDelegators(delegate.address, pagination);
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
