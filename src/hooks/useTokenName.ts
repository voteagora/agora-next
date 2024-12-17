import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

interface Props {
  enabled: boolean;
}

export const TOKEN_NAME_QK = "tokenName";

export const useTokenName = ({ enabled }: Props) => {
  const { contracts } = Tenant.current();

  const { data, isFetching, isFetched } = useQuery({
    queryKey: [TOKEN_NAME_QK, contracts.token.address],
    queryFn: async () => {
      return await contracts.token.contract.name();
    },
    enabled: enabled,
  });

  return { data, isFetching, isFetched };
};
