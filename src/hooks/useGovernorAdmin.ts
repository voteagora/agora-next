import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  enabled: boolean;
}

export const MANAGER_QK = "admin";

export const useGovernorAdmin = ({ enabled }: Props) => {
  const { contracts, namespace } = Tenant.current();

  const { data, isFetching, isFetched } = useQuery({
    queryKey: [MANAGER_QK],
    queryFn: async () => {
      return await contracts.governor.contract.admin!();
    },
    enabled: enabled,
  });

  return { data, isFetching, isFetched };
};
