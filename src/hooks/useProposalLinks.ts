import { useQuery } from "@tanstack/react-query";
import { getProposalLinks } from "@/lib/actions/proposalLinks";

interface ProposalLink {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
}

interface UseProposalLinksOptions {
  sourceId?: string;
  targetId?: string;
  enabled?: boolean;
}

export function useProposalLinks({
  sourceId,
  targetId,
  enabled = true,
}: UseProposalLinksOptions) {
  const query = useQuery({
    queryKey: ["proposalLinks", sourceId, targetId],
    queryFn: async () => {
      const result = await getProposalLinks({ sourceId, targetId });
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch proposal links");
      }
      return result.links as ProposalLink[];
    },
    enabled: enabled && (!!sourceId || !!targetId),
  });

  return {
    links: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
