import { useQuery } from "@tanstack/react-query";
import { CopelandResult } from "@/lib/copelandCalculation";

export type CopelandResultResponse = {
  results: CopelandResult[];
  unavailableReason?: "encrypted_choices";
};

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
      const payload = (await response.json()) as
        | CopelandResult[]
        | CopelandResultResponse;

      return Array.isArray(payload) ? { results: payload } : payload;
    },
    enabled: !!proposalId,
    staleTime: 60 * 5 * 1000, // 5 minutes
  });
};
