import { fetchMyDraftProposals as apiFetchMyDraftProposals } from "@/app/api/common/proposals/getProposals";
import {
  draftProposalsFilterOptions,
  draftProposalsSortOptions,
} from "@/lib/constants";
import MyDraftProposalListServerClient from "./MyDraftProposalListServerClient";
import { getConnectedAccountFromCookies } from "@/lib/wagmi";

const pagination = { limit: 10, offset: 0 };

async function fetchMyDraftProposals(
  address: `0x${string}` | undefined,
  filter: string,
  sort: string,
  pagination = { limit: 10, offset: 0 }
) {
  "use server";
  return apiFetchMyDraftProposals(address, filter, sort, pagination);
}

const MyDraftProposalListServer = async ({
  searchParams,
}: {
  searchParams: { filter?: string; sort?: string };
}) => {
  const connectedAccount = getConnectedAccountFromCookies();
  const filter =
    searchParams.filter || draftProposalsFilterOptions.allDrafts.value;
  const sort = searchParams.sort || draftProposalsSortOptions.newest.sort;

  const draftProposals = await fetchMyDraftProposals(
    connectedAccount,
    filter,
    sort,
    pagination
  );

  return (
    <MyDraftProposalListServerClient
      initMyDraftProposals={draftProposals}
      fetchMyDraftProposals={fetchMyDraftProposals}
    />
  );
};

export default MyDraftProposalListServer;
