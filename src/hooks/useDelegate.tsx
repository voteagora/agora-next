import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchDelegate } from "@/app/delegates/actions";
import { Delegate } from "@/app/api/common/delegates/delegate";
import { useCallback } from "react";

const CACHE_TIME = 180000; // 3 minute cache

interface Props {
  address: `0x${string}` | undefined;
}
export const DELEGATE_QK = "delegate";

export const useDelegate = ({ address }: Props) => {
  const { data, isFetching, isFetched, refetch } = useQuery({
    enabled: !!address,
    queryKey: [DELEGATE_QK, address],
    queryFn: async () => {
      return (await fetchDelegate(address as string)) as Delegate;
    },
    staleTime: CACHE_TIME,
  });

  return { data, isFetching, isFetched, refetch };
};
