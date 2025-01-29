import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { IMembershipContract } from "@/lib/contracts/common/interfaces/IMembershipContract";
import { getPublicClient } from "@/lib/viem";

export const TOTAL_SUPPLY_QK = "totalSupply";

interface Props {
  enabled: boolean;
}

export const useTotalSupply = ({ enabled }: Props) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [TOTAL_SUPPLY_QK],
    queryFn: async () => {
      if (contracts.token.isERC20()) {
        // Standard ERC20
        return await contracts.token.contract.totalSupply();
      } else if (contracts.token.isERC721()) {
        //ERC 721
        const token = contracts.token.contract as IMembershipContract;
        const publicClient = getPublicClient(contracts.token.chain);
        const blockNumber = await publicClient.getBlockNumber();
        return await token.getPastTotalSupply(Number(blockNumber) - 1);
      }
      return 0n;
    },
    staleTime: 600000, // 10 minute cache
  });

  return { data, isFetching, isFetched };
};
