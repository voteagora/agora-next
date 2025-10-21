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
import ArchiveProposalsList from "@/components/Proposals/ProposalsList/ArchiveProposalsList";
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
  const { ui, namespace } = Tenant.current();

  const hasToggle = typeof (ui as any)?.toggle === "function";
  if (!(hasToggle ? ui.toggle("proposals") : { enabled: true })) {
    return <div>Route not supported for namespace</div>;
  }

  const plmEnabled = hasToggle
    ? ui.toggle("proposal-lifecycle")?.enabled
    : false;
  const supportsNotifications = hasToggle
    ? ui.toggle("email-subscriptions")?.enabled
    : false;
  const useArchiveForProposals = hasToggle
    ? ui.toggle("use-archive-for-proposals")?.enabled
    : false;

  const emptyPaginated = () => ({
    meta: { has_next: false, total_returned: 0, next_offset: 0 },
    data: [],
  });

  // Load archived proposals if toggle is enabled
  if (useArchiveForProposals) {
    let archivedProposals: any[] = [];
    try {
      if (namespace === "cyber") {
        archivedProposals = require("@/app/proposals/data/cyber.json");
      } else if (namespace === "pguild") {
        archivedProposals = require("@/app/proposals/data/pguild.json");
      }
    } catch (error) {
      console.error("Failed to load archived proposals:", error);
      archivedProposals = [];
    }

    // Filter only standard proposals (proposal_type === 0)
    const standardProposals = archivedProposals.filter(
      (p: any) => p.proposal_type === 0 && p.voting_module_name === "standard"
    );

    const [governanceCalendar] = await (async () => {
      const results = await Promise.allSettled([fetchGovernanceCalendar()]);
      const gc = results[0].status === "fulfilled" ? results[0].value : null;
      return [gc] as const;
    })();

    return (
      <div className="flex flex-col">
        {supportsNotifications && <SubscribeDialogLauncher />}
        <Hero page="proposals" />
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
          votableSupply="0"
        />
        <ArchiveProposalsList
          proposals={standardProposals}
          governanceCalendar={governanceCalendar}
        />
      </div>
    );
  }

  const [governanceCalendar, relevantProposals, allProposals, votableSupply] =
    await (async () => {
      const results = await Promise.allSettled([
        fetchGovernanceCalendar(),
        fetchProposals(proposalsFilterOptions.relevant.filter),
        fetchProposals(proposalsFilterOptions.everything.filter),
        fetchVotableSupply(),
      ]);

      const gc = results[0].status === "fulfilled" ? results[0].value : null;
      const rel =
        results[1].status === "fulfilled" ? results[1].value : emptyPaginated();
      const all =
        results[2].status === "fulfilled" ? results[2].value : emptyPaginated();
      const vs = results[3].status === "fulfilled" ? results[3].value : "0";
      return [gc, rel, all, vs] as const;
    })();

  return (
    <div className="flex flex-col">
      {supportsNotifications && <SubscribeDialogLauncher />}
      <Hero page="proposals" />
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
        initRelevantProposals={relevantProposals}
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
