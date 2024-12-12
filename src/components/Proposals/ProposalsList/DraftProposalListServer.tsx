import { fetchProposals as apiFetchProposals } from "@/app/api/common/proposals/getProposals";
import {
  draftProposalsFilterOptions,
  draftProposalsSortOptions,
  proposalsFilterOptions,
} from "@/lib/constants";
import AllProposalListClient from "./AllProposalListClient";
import { fetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";

async function fetchProposals(
  filter: string,
  pagination = { limit: 10, offset: 0 }
) {
  "use server";
  return apiFetchProposals({ filter, pagination });
}

const DraftProposalListServer = async ({
  searchParams,
}: {
  searchParams: { filter?: string; sort?: string };
}) => {
  const filter =
    searchParams.filter || draftProposalsFilterOptions.allDrafts.value;
  const sort = searchParams.sort || draftProposalsSortOptions.newest.sort;

  // fetchDraftProposals
  const proposals = await fetchProposals(
    proposalsFilterOptions.everything.filter
  );

  const votableSupply = await fetchVotableSupply();

  return (
    <AllProposalListClient
      initProposals={proposals}
      fetchProposals={fetchProposals}
      votableSupply={votableSupply}
    />
  );
};

export default DraftProposalListServer;
