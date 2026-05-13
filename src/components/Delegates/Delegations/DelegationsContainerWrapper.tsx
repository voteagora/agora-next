import type { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import DelegationsContainer from "./DelegationsContainer";
import {
  fetchCurrentDelegatees,
  fetchCurrentDelegators,
} from "@/app/delegates/actions";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { Delegation } from "@/app/api/common/delegations/delegation";

interface Props {
  delegate: Delegate;
  initialDelegatees?: Delegation[];
  initialInboundDelegators?: PaginatedResult<Delegation[]>;
}

const DelegationsContainerWrapper = async ({
  delegate,
  initialDelegatees,
  initialInboundDelegators,
}: Props) => {
  const delegateesAddress = delegate.statement?.scw_address || delegate.address;

  const hasPrefetch =
    initialDelegatees !== undefined && initialInboundDelegators !== undefined;

  const [delegatees, delegators] = hasPrefetch
    ? [initialDelegatees, initialInboundDelegators]
    : await Promise.all([
        fetchCurrentDelegatees(delegateesAddress),
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
