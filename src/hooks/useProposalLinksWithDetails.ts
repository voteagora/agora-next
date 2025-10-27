import { useQuery } from "@tanstack/react-query";
import { getProposalLinksWithDetails } from "@/lib/actions/proposalLinksWithDetails";
import Tenant from "@/lib/tenant/tenant";

interface LinkedItemDetails {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: string;
  metadata?: {
    commentsCount?: number;
    category?: string;
    status?: string;
  };
}

export function useProposalLinksWithDetails(targetId: string) {
  const { ui } = Tenant.current();
  const isEnabled = ui.toggle("easv2-govlessvoting")?.enabled;

  const query = useQuery({
    queryKey: ["proposalLinksWithDetails", targetId],
    queryFn: async () => {
      const result = await getProposalLinksWithDetails(targetId);
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch proposal links");
      }
      return result.links as LinkedItemDetails[];
    },
    enabled: !!targetId && isEnabled,
  });

  return {
    links: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
