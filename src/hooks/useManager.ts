import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const MANAGER_QK = "manager";

export const useManager = () => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    queryKey: [MANAGER_QK],
    queryFn: async () => {
      return await contracts.governor.contract.manager!();
    },
  });
  return { data, isFetching, isFetched };
};
