import { useQuery } from "@tanstack/react-query";
import { useSafeApiKit } from "@/contexts/SafeApiKitContext";

export const useGetSafeMessageDetails = ({
  messageHash,
}: {
  messageHash?: string;
}) => {
  const { safeApiKit } = useSafeApiKit();
  return useQuery({
    queryKey: ["safeMessageDetails", messageHash],
    queryFn: async () => {
      if (!messageHash) {
        throw new Error("No message hash provided");
      }
      const messageDetails = await safeApiKit!.getMessage(messageHash);
      return messageDetails;
    },
    enabled: Boolean(messageHash) && Boolean(safeApiKit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
