import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { Block } from "ethers";

interface Props {
  enabled: boolean;
}

const QK = "block";

export const useLatestBlock = ({ enabled }: Props) => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK],
    queryFn: async (): Promise<Block> => {
      return (await contracts.token.provider.getBlock("latest")) as Block;
    },
    staleTime: 60000, // 1 minute cache
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
