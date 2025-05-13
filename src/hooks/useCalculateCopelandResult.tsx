import { useQuery } from "@tanstack/react-query";
import { CopelandResult } from "@/lib/copelandCalculation";

export const useCalculateCopelandResult = ({
  proposalId,
}: {
  proposalId: string;
}) => {
  return useQuery({
    queryKey: ["copelandResult", proposalId],
    queryFn: async () => {
      const response = await fetch(
        `/api/proposals/${proposalId}/copeland-result`
      );
      return (await response.json()) as CopelandResult[];
    },
    enabled: !!proposalId,
    staleTime: 60 * 5 * 1000, // 5 minutes
  });
};
