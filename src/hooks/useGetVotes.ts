import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { getPublicClient } from "@/lib/viem";

export const VOTES_QK = "proposalThreshold";

export const useGetVotes = ({
  address,
  blockNumber,
}: {
  address: `0x${string}`;
  blockNumber: bigint;
}) => {
  const client = getPublicClient(Tenant.current().contracts.governor.chain.id);

  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address && !!blockNumber,
    queryKey: [VOTES_QK],
    queryFn: async () => {
      const votes = (await client.readContract({
        abi: contracts.governor.abi,
        address: contracts.governor.address as `0x${string}`,
        functionName: "getVotes",
        args: [address, blockNumber ? blockNumber - BigInt(1) : BigInt(0)],
      })) as unknown as bigint;

      return votes;
    },
  });
  return { data, isFetching, isFetched };
};
