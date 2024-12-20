import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  enabled: boolean;
}

export const GOVERNOR_NAME_QK = "governorName";

export const useGovernorName = ({ enabled }: Props) => {
  const { contracts } = Tenant.current();

  const { data, isFetching, isFetched } = useQuery({
    queryKey: [GOVERNOR_NAME_QK, contracts.governor.address],
    queryFn: async () => {
      return await contracts.governor.contract.name();
    },
    enabled: enabled,
  });

  return { data, isFetching, isFetched };
};
