import { useQuery } from "@tanstack/react-query";
import Tenant from "@/lib/tenant/tenant";

export const PROPOSAL_THRESHOLD_QK = "proposalThreshold";

export const useProposalThreshold = () => {
  const { contracts } = Tenant.current();
  const { data, isFetching, isFetched } = useQuery({
    queryKey: [PROPOSAL_THRESHOLD_QK],
    queryFn: async () => {
      return await contracts.governor.contract.proposalThreshold!();
    },
  });
  return { data, isFetching, isFetched };
};
