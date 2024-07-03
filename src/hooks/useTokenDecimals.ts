import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const TOKEN_DECIMALS_QK = "tokenDecimals";

export const useTokenDecimals = () => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    queryKey: [TOKEN_DECIMALS_QK],
    queryFn: async () => {
      return await contracts.token.contract.decimals();
    },
  });
  return { data, isFetching, isFetched };
};
