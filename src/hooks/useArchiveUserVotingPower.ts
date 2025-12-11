import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";
import { ArchiveNonVoterRow } from "@/lib/archiveUtils";

interface Props {
  proposalId: string;
  userAddress: string | undefined;
}

const QK = "archive-user-vp";

export const useArchiveUserVotingPower = ({
  proposalId,
  userAddress,
}: Props) => {
  const { data, isFetching, isFetched, isError } = useQuery({
    enabled: !!userAddress && !!proposalId,
    queryKey: [QK, proposalId, userAddress?.toLowerCase()],
    queryFn: async () => {
      if (!userAddress) return null;

      const { namespace } = Tenant.current();

      const response = await fetch(
        `/api/archive/non-voters/${proposalId}?namespace=${namespace}`,
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch archive non-voters");
      }

      const { data: rawNonVoters } = (await response.json()) as {
        data: ArchiveNonVoterRow[];
      };

      const userNonVoter = rawNonVoters.find(
        (nonVoter) => nonVoter.addr?.toLowerCase() === userAddress.toLowerCase()
      );

      if (!userNonVoter) {
        return null;
      }

      return userNonVoter.vp !== undefined ? String(userNonVoter.vp) : "0";
    },
  });

  return { data, isFetching, isFetched, isError, queryKey: QK };
};
