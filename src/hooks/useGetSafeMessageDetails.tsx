import { useQuery } from "@tanstack/react-query";
import { useSafeApiKit } from "@/contexts/SafeApiKitContext";

type UseGetSafeMessageDetailsOptions = {
  messageHash?: string;
  enabled?: boolean;
};

/**
 * Custom hook for fetching Safe message details using TanStack Query
 * @param options - Options for the query
 * @returns Query result with Safe message details
 */
export const useGetSafeMessageDetails = ({
  messageHash,
  enabled = true,
}: UseGetSafeMessageDetailsOptions) => {
  const { safeApiKit } = useSafeApiKit();

  return useQuery({
    queryKey: ["safeMessageDetails", messageHash],
    queryFn: async () => {
      if (!messageHash) {
        throw new Error("Message hash is required");
      }

      if (!safeApiKit) {
        throw new Error("Safe API Kit is not initialized");
      }

      try {
        const safeMessageDetails = await safeApiKit.getMessage(messageHash);
        return safeMessageDetails;
      } catch (error) {
        console.error("Error fetching Safe message details:", error);
        throw error;
      }
    },
    enabled: Boolean(messageHash && safeApiKit && enabled),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
