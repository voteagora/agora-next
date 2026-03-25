import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { getPublicClient } from "@/lib/viem";
import { TENANT_NAMESPACES } from "@/lib/constants";
import {
  getGovernorByAddress,
  getDefaultGovernor,
} from "@/lib/tenant/governorUtils";

export const VOTES_QK = "proposalThreshold";

export const useGetVotes = ({
  address,
  blockNumber,
  enabled,
  governorContract,
}: {
  address: `0x${string}`;
  blockNumber: bigint;
  enabled: boolean;
  governorContract?: string;
}) => {
  const client = getPublicClient();

  const { contracts, namespace } = Tenant.current();
  const governorInstance = governorContract
    ? (getGovernorByAddress(governorContract, contracts) ??
      getDefaultGovernor(contracts))
    : getDefaultGovernor(contracts);

  const res = useQuery({
    enabled: enabled,
    queryKey: [
      VOTES_QK,
      address,
      blockNumber.toString(),
      governorInstance.governor.address,
    ],
    queryFn: async () => {
      let votes: bigint;
      if (namespace === TENANT_NAMESPACES.UNISWAP) {
        votes = (await client.readContract({
          abi: governorInstance.token.abi,
          address: governorInstance.token.address as `0x${string}`,
          functionName: "getPriorVotes",
          args: [address, blockNumber ? blockNumber - BigInt(1) : BigInt(0)],
        })) as unknown as bigint;
      } else {
        votes = (await client.readContract({
          abi: governorInstance.governor.abi,
          address: governorInstance.governor.address as `0x${string}`,
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
