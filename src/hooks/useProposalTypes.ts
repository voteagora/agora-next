import { useQuery } from "@tanstack/react-query";
import { fetchProposalTypes } from "@/app/api/common/proposals/getProposals";

export function useProposalTypes() {
  return useQuery({
    queryKey: ["proposalTypes"],
    queryFn: fetchProposalTypes,
  });
}
