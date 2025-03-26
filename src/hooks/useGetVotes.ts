import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { getPublicClient } from "@/lib/viem";
import { TENANT_NAMESPACES } from "@/lib/constants";

export const VOTES_QK = "proposalThreshold";

export const useGetVotes = ({
  address,
  blockNumber,
  enabled,
}: {
  address: `0x${string}`;
  blockNumber: bigint;
  enabled: boolean;
}) => {
  const client = getPublicClient();

  const { contracts, namespace } = Tenant.current();

  const res = useQuery({
    enabled: enabled,
    queryKey: [VOTES_QK, address, blockNumber.toString()],
    queryFn: async () => {
      let votes: bigint;
      if (namespace === TENANT_NAMESPACES.UNISWAP) {
        votes = (await client.readContract({
          abi: contracts.token.abi,
          address: contracts.token.address as `0x${string}`,
          functionName: "getPriorVotes",
          args: [address, blockNumber ? blockNumber - BigInt(1) : BigInt(0)],
        })) as unknown as bigint;
      } else {
        votes = (await client.readContract({
          abi: contracts.governor.abi,
          address: contracts.governor.address as `0x${string}`,
          functionName: "getVotes",
          args: [address, blockNumber ? blockNumber - BigInt(1) : BigInt(0)],
        })) as unknown as bigint;
      }

      return votes;
    },
    refetchOnWindowFocus: false,
  });

  return { ...res };
};
