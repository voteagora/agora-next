import VotesContainer from "./VotesContainer";
import { fetchVotesForDelegate } from "@/app/delegates/actions";
import { fetchSnapshotVotesForDelegate } from "@/app/api/common/votes/getVotes";
import type { PaginatedResult, PaginationParams } from "@/app/lib/pagination";
import DelegateVotes from "./DelegateVotes";
import SnapshotVotes from "./SnapshotVotes";
import { Delegate } from "@/app/api/common/delegates/delegate";
import type { Vote } from "@/app/api/common/votes/vote";

interface Props {
  delegate: Delegate;
  /** First page of on-chain votes (same as Past Votes); avoids duplicate fetch from profile page. */
  initialOnchainVotes?: PaginatedResult<Vote[]>;
}

const VotesContainerWrapper = async ({
  delegate,
  initialOnchainVotes,
}: Props) => {
  const [delegateVotes, snapshotVotes] = await Promise.all([
    initialOnchainVotes ?? fetchVotesForDelegate(delegate.address),
    fetchSnapshotVotesForDelegate({ addressOrENSName: delegate.address }),
  ]);

  return (
    <VotesContainer
      onchainVotes={
        <>
          {delegateVotes && delegateVotes.data.length > 0 ? (
            <div className="flex flex-col gap-4">
              <DelegateVotes
                initialVotes={delegateVotes}
                fetchDelegateVotes={async (pagination: PaginationParams) => {
                  "use server";
                  return fetchVotesForDelegate(delegate.address, pagination);
                }}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-secondary align-middle bg-wash border border-line rounded-xl shadow-newDefault">
              No past votes available.
            </div>
          )}
        </>
      }
      snapshotVotes={
        <>
          {snapshotVotes && snapshotVotes.data.length > 0 ? (
            <SnapshotVotes
              initialVotes={snapshotVotes}
              fetchSnapshotVotes={async (pagination: PaginationParams) => {
                "use server";
                return await fetchSnapshotVotesForDelegate({
                  addressOrENSName: delegate.address,
                  pagination,
                });
              }}
            />
          ) : (
            <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl border border-line shadow-newDefault">
              No past votes available.
            </div>
          )}
        </>
      }
    />
  );
};

export const VotesContainerSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 animate-pulse p-12 rounded-lg bg-tertiary/10">
      <div className="h-4 w-1/2 bg-tertiary/20 rounded-md"></div>
      <div className="h-4 w-1/3 bg-tertiary/20 rounded-md"></div>
    </div>
  );
};

export default VotesContainerWrapper;
