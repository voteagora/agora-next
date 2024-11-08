import { resolveENSName } from "@/app/lib/ENSUtils";
import VotesContainer from "./VotesContainer";
import { fetchVotesForDelegate } from "@/app/delegates/actions";
import { fetchSnapshotVotesForDelegate } from "@/app/api/common/votes/getVotes";
import { PaginationParams } from "@/app/lib/pagination";
import DelegateVotes from "./DelegateVotes";
import SnapshotVotes from "./SnapshotVotes";

const VotesContainerWrapper = async ({
  addressOrENSName,
}: {
  addressOrENSName: string;
}) => {
  const address = (await resolveENSName(addressOrENSName)) || addressOrENSName;
  const [delegateVotes, snapshotVotes] = await Promise.all([
    fetchVotesForDelegate(address),
    fetchSnapshotVotesForDelegate({ addressOrENSName: address }),
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
                  return fetchVotesForDelegate(addressOrENSName, pagination);
                }}
              />
            </div>
          ) : (
            <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
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
                  addressOrENSName: addressOrENSName,
                  pagination,
                });
              }}
            />
          ) : (
            <div className="p-8 text-center text-secondary align-middle bg-wash rounded-xl">
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
