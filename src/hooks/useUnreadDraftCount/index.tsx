import action from "./action";
import { useQuery } from "@tanstack/react-query";
import { useIsMounted } from "connectkit";

const useUnreadDraftCount = (address: `0x${string}` | undefined) => {
  const isMounted = useIsMounted();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["unreadDraftCount", address],
    queryFn: () => {
      return action(address);
    },
    enabled: !!address && isMounted,
  });

  return { data, isLoading, isError, error };
};

export default useUnreadDraftCount;
