import { useQuery } from "@tanstack/react-query";
import { ChartVote } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import type { ArchiveVoteRow } from "@/lib/archiveUtils";

const QK = "votesChart";
const CACHE_TIME = 60000; // 1 minute cache

interface Props {
  enabled: boolean;
  proposalId: string;
  proposalType?: string;
}

export const useProposalVotesChart = ({
  proposalId,
  enabled,
  proposalType,
}: Props) => {
  const { ui } = Tenant.current();
  const useArchive =
    ui.toggle("use-archive-for-proposal-details")?.enabled ?? false;

  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId, proposalType, useArchive],
    queryFn: async (): Promise<ChartVote[]> => {
      if (useArchive) {
        const response = await fetch(`/api/archive/votes/${proposalId}`, {
          cache: "no-store",
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const payload = (await response.json()) as {
          data?: ArchiveVoteRow[];
        };
        const isSnapshot = proposalType === "SNAPSHOT";

        return (payload.data ?? [])
          .map((vote) => ({
            voter: vote.voter,
            support: vote.support ?? "1",
            weight: String(vote.weight ?? vote.vp ?? "0"),
            block_number:
              vote.block_number != null ? String(vote.block_number) : "",
            created:
              vote.created != null
                ? String(vote.created)
                : vote.ts != null
                  ? String(vote.ts)
                  : undefined,
          }))
          .sort((a, b) => {
            const aKey = isSnapshot
              ? Number(a.created ?? 0)
              : Number(a.block_number || 0);
            const bKey = isSnapshot
              ? Number(b.created ?? 0)
              : Number(b.block_number || 0);
            return aKey - bKey;
          });
      }

      const response = await fetch(
        `/api/proposals/${proposalId}/chart${proposalType === "SNAPSHOT" ? `?proposalType=${proposalType}` : ""}`
      );
      return (await response.json()) as Promise<ChartVote[]>;
    },
    staleTime: CACHE_TIME,
  });

  return { data, isFetching, isFetched, queryKey: QK };
};
