import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const useStaked = (id:number) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!id,
    queryKey: ["depositStaked", id],
    queryFn: async () => {
      return await contracts.staker!.contract.deposits(id);
    },
  });

  return { data, isFetching, isFetched };
};