import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const useStakedDeposit = (id: number) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!id,
    queryKey: ["stakedDeposit", id],
    queryFn: async () => {
      return await contracts.staker!.contract.deposits(BigInt(id));
    },
  });

  return { data, isFetching, isFetched };
};
