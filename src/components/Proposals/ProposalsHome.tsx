import { fetchNeedsMyVoteProposals as apiFetchNeedsMyVoteProposals } from "@/app/api/common/proposals/getNeedsMyVoteProposals";
import {
  fetchDraftProposalForSponsor as apiFetchDraftProposalsForSponsorship,
  fetchDraftProposals as apiFetchDraftProposals,
  fetchProposals as apiFetchProposals,
} from "@/app/api/common/proposals/getProposals";
import { fetchVotableSupply as apiFetchVotableSupply } from "@/app/api/common/votableSupply/getVotableSupply";
import { fetchGovernanceCalendar as apiFetchGovernanceCalendar } from "@/app/api/common/governanceCalendar/getGovernanceCalendar";
import Hero from "@/components/Hero/Hero";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import { proposalsFilterOptions } from "@/lib/constants";
import Tenant from "@/lib/tenant/tenant";
import MyDraftProposals from "@/components/Proposals/DraftProposals/MyDraftProposals";
import MySponsorshipRequests from "@/components/Proposals/DraftProposals/MySponsorshipRequests";
import { PaginationParams } from "@/app/lib/pagination";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";

async function fetchProposals(
  filter: string,
  pagination = { limit: 10, offset: 0 }
) {
  "use server";
  return apiFetchProposals({ filter, pagination });
}

async function fetchNeedsMyVoteProposals(address: string) {
  "use server";
  return apiFetchNeedsMyVoteProposals(address);
}

async function fetchVotableSupply() {
  "use server";
  return apiFetchVotableSupply();
}

async function fetchGovernanceCalendar() {
  "use server";
  return apiFetchGovernanceCalendar();
}

export default async function ProposalsHome() {
  const { ui } = Tenant.current();

  if (!ui.toggle("proposals")) {
    return <div>Route not supported for namespace</div>;
  }

  const plmEnabled = ui.toggle("proposal-lifecycle")?.enabled;
  const supportsNotifications = ui.toggle("email-subscriptions")?.enabled;

  const governanceCalendar = await fetchGovernanceCalendar();
  const relevalntProposals = await fetchProposals(
    proposalsFilterOptions.relevant.filter
  );
  const allProposals = await fetchProposals(
    proposalsFilterOptions.everything.filter
  );

  const votableSupply = await fetchVotableSupply();

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero />
      {plmEnabled && (
        <>
          <MyDraftProposals
            fetchDraftProposals={async (address) => {
              "use server";
              return apiFetchDraftProposals(address);
            }}
          />
          <MySponsorshipRequests
            fetchDraftProposals={async (address) => {
              "use server";
              return apiFetchDraftProposalsForSponsorship(address);
            }}
          />
        </>
      )}
      <NeedsMyVoteProposalsList
        fetchNeedsMyVoteProposals={fetchNeedsMyVoteProposals}
        votableSupply={votableSupply}
      />
      <ProposalsList
        initRelevantProposals={relevalntProposals}
        initAllProposals={allProposals}
        fetchProposals={async (
          pagination: PaginationParams,
          filter: string
        ) => {
          "use server";
          return fetchProposals(filter, pagination);
        }}
        governanceCalendar={governanceCalendar}
        votableSupply={votableSupply}
      />
    </div>
  );
}
