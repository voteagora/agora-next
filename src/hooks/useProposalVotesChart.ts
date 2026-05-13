import { useQuery } from "@tanstack/react-query";
import { ChartVote } from "@/lib/types";
import Tenant from "@/lib/tenant/tenant";
import { fetchRawProposalVotesFromArchive } from "@/lib/archiveUtils";

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
  const { namespace, ui } = Tenant.current();
  const useArchive = ui.toggle("include-nonivotes")?.enabled ?? false;

  const { data, isFetching, isFetched } = useQuery({
    enabled: enabled,
    queryKey: [QK, proposalId, proposalType, useArchive],
    queryFn: async (): Promise<ChartVote[]> => {
      if (useArchive) {
        const archiveVotes = await fetchRawProposalVotesFromArchive({
          namespace,
          proposalId,
        });
        return archiveVotes.map((vote) => ({
          voter: vote.voter,
          support: vote.support ?? "1",
          weight: String(vote.weight ?? vote.vp ?? "0"),
          block_number: String(vote.block_number),
          created: vote.ts != null ? String(vote.ts) : undefined,
        }));
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
