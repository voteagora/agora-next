import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const TOKEN_ALLOWANCE_QK = "depositorTotalStaked";

export const useTokenAllowance = (address?: string) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address && contracts.token.isERC20(),
    queryKey: [TOKEN_ALLOWANCE_QK],
    queryFn: async () => {
      if (!contracts.token.isERC20()) {
        throw new Error("Token is not ERC20");
      }
      return await contracts.token.contract.allowance(
        address as `0x${string}`,
        contracts.staker!.address
      );
    },
  });
  return { data, isFetching, isFetched };
};
