import { useQuery } from "@tanstack/react-query";
import { apiFetchStakedDeposits } from "@/app/api/staking/getStakedDeposits";

export const useStakedDepositsForAddress = (address: string) => {
  const { data, isFetching, isFetched } = useQuery({
    queryKey: ["stakedDepositsForAddress", address],
    queryFn: async () => {
      return await apiFetchStakedDeposits({ address });
    },
  });

  return { data, isFetching, isFetched };
};
