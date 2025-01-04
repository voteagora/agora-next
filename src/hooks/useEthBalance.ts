import { useQuery } from "@tanstack/react-query";
import { getPublicClient } from "@/lib/viem";

interface Props {
  address: `0x${string}`;
  enabled: boolean;
}

export const ETH_BALANCE = "balance";

export const useEthBalance = ({ address, enabled }: Props) => {
  const client = getPublicClient();

  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [ETH_BALANCE, address],
    queryFn: async () => {
      return await client.getBalance({
        address: address,
      });
    },
  });
  return { data, isFetching, isFetched };
};
