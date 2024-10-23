import { fetchProposals as apiFetchProposals } from "@/app/api/common/proposals/getProposals";
import { proposalsFilterOptions } from "@/lib/constants";
import AllProposalListClient from "./AllProposalListClient";

async function fetchProposals(
  filter: string,
  pagination = { limit: 10, offset: 0 }
) {
  "use server";
  return apiFetchProposals({ filter, pagination });
}

const AllProposalList = async () => {
  const proposals = await fetchProposals(
    proposalsFilterOptions.everything.filter
  );

  return (
    <AllProposalListClient
      initProposals={proposals}
      fetchProposals={fetchProposals}
    />
  );
};

export default AllProposalList;
