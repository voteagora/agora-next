import { useQuery } from "@tanstack/react-query";
import { fetchDirectDelegatee } from "@/app/delegates/actions";

export const DELEGATEE_QK = "delegatee";

export const useGetDelegatee = ({
  address,
}: {
  address: `0x${string}` | undefined;
}) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address,
    queryKey: [DELEGATEE_QK, address],
    queryFn: async () => {
      const delegatee = await fetchDirectDelegatee(address as `0x${string}`);
      return delegatee;
    },
  });

  return { data, isFetching, isFetched };
};
