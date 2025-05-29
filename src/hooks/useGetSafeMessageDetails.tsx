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
      console.log("messageHash", messageHash, safeApiKit);
      if (!messageHash) {
        throw new Error("No message hash provided");
      }
      const messageDetails = await safeApiKit!.getMessage(messageHash);
      console.log("messageDetails", messageDetails);
      return messageDetails;
    },
    enabled: Boolean(messageHash) && Boolean(safeApiKit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
