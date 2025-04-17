import { useQuery } from "@tanstack/react-query";
import { fetchCurrentDelegatees } from "@/app/delegates/actions";

export const DELEGATEE_QK = "delegatee";

export const useGetDelegatees = ({
  address,
}: {
  address: `0x${string}` | undefined;
}) => {
  const { data, isFetching, isFetched } = useQuery({
    enabled: !!address,
    queryKey: [DELEGATEE_QK, address],
    queryFn: async () => {
      const delegatees = await fetchCurrentDelegatees(address as `0x${string}`);
      return delegatees;
    },
  });

  return { data, isFetching, isFetched };
};
