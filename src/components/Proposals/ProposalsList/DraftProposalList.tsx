import { fetchDraftProposalsV2 as apiFetchDraftProposals } from "@/app/api/common/proposals/getProposals";
import {
  draftProposalsFilterOptions,
  draftProposalsSortOptions,
} from "@/lib/constants";
import DraftProposalListClient from "./DraftProposalListClient";
import { getConnectedAccountFromCookies } from "@/lib/wagmi";

const pagination = { limit: 10, offset: 0 };

async function fetchDraftProposals(
  address: `0x${string}` | undefined,
  filter: string,
  sort: string,
  pagination = { limit: 10, offset: 0 }
) {
  "use server";
  return apiFetchDraftProposals(address, filter, sort, pagination);
}

const DraftProposalList = async ({
  searchParams,
}: {
  searchParams: { filter?: string; sort?: string };
}) => {
  const connectedAccount = getConnectedAccountFromCookies();
  const filter =
    searchParams.filter || draftProposalsFilterOptions.allDrafts.value;
  const sort = searchParams.sort || draftProposalsSortOptions.newest.sort;

  const draftProposals = await fetchDraftProposals(
    connectedAccount,
    filter,
    sort,
    pagination
  );

  return (
    <DraftProposalListClient
      initDraftProposals={draftProposals}
      fetchDraftProposals={fetchDraftProposals}
    />
  );
};

export default DraftProposalList;
