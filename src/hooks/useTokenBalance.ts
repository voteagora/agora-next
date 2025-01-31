import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const TOKEN_BALANCE_QK = "tokenBalance";

export const useTokenBalance = (address?: string) => {
  return {
    data: BigInt(0),
    isFetching: false,
    isFetched: true,
  };
};
