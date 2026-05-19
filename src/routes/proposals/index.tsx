/*
 * TanStack Start port of src/app/proposals/page.tsx.
 * URL: /proposals
 */

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import Hero from "@/components/Hero/Hero";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import ArchiveProposalsList from "@/components/Proposals/ProposalsList/ArchiveProposalsList";
import { proposalsFilterOptions } from "@/lib/constants";
import { DraftsTabsWrapper } from "@/components/Proposals/DraftsTabsWrapper";
import {
  type PaginatedResult,
  type PaginationParams,
} from "@/app/lib/pagination";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";

// ─── server functions for client-invoked callbacks ───────────────────────────

const serverFetchProposals = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { filter: string; limit: number; offset: number }) => data
  )
  .handler(async ({ data }) => {
    const { fetchProposals } = await import(
      "@/app/api/common/proposals/getProposals"
    );
    return (await fetchProposals({
      filter: data.filter,
      pagination: { limit: data.limit, offset: data.offset },
    })) as any;
  });

const serverFetchNeedsMyVoteProposals = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  .handler(async ({ data }) => {
    const { fetchNeedsMyVoteProposals } = await import(
      "@/app/api/common/proposals/getNeedsMyVoteProposals"
    );
    return (await fetchNeedsMyVoteProposals(data.address)) as any;
  });

const serverFetchDraftProposals = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  .handler(async ({ data }) => {
    const { fetchDraftProposals } = await import(
      "@/app/api/common/proposals/getProposals"
    );
    return fetchDraftProposals(data.address as `0x${string}`);
  });

const serverFetchSponsorshipProposals = createServerFn({ method: "GET" })
  .inputValidator((data: { address: string }) => data)
  .handler(async ({ data }) => {
    const { fetchDraftProposalForSponsor } = await import(
      "@/app/api/common/proposals/getProposals"
    );
    return fetchDraftProposalForSponsor(data.address as `0x${string}`);
  });

const serverLoadProposalsPage = createServerFn({ method: "GET" }).handler(
  async () => {
    const { ui, namespace } = Tenant.current();

    const plmEnabled = ui.toggle("proposal-lifecycle")?.enabled ?? false;
    const supportsNotifications =
      ui.toggle("email-subscriptions")?.enabled ?? false;
    const useArchiveForProposals =
      ui.toggle("use-archive-for-proposals")?.enabled ?? false;

    const { fetchVotableSupply } = await import(
      "@/app/api/common/votableSupply/getVotableSupply"
    );
    const { fetchGovernanceCalendar } = await import(
      "@/app/api/common/governanceCalendar/getGovernanceCalendar"
    );

    const emptyPaginated = () => ({
      meta: { has_next: false, total_returned: 0, next_offset: 0 },
      data: [] as any[],
    });

    let governanceCalendar: any;
    let relevantProposals: any;
    let allProposals: any;
    let votableSupply: string;
    let archivedProposals = emptyPaginated();

    if (useArchiveForProposals) {
      const { fetchProposalsFromArchive } = await import("@/lib/archiveUtils");
      [governanceCalendar, archivedProposals, votableSupply] =
        await Promise.all([
          fetchGovernanceCalendar(),
          fetchProposalsFromArchive(
            namespace,
            proposalsFilterOptions.everything.filter
          ),
          fetchVotableSupply(),
        ]);
      relevantProposals = emptyPaginated();
      allProposals = emptyPaginated();
    } else {
      const { fetchProposals } = await import(
        "@/app/api/common/proposals/getProposals"
      );
      [governanceCalendar, relevantProposals, allProposals, votableSupply] =
        await Promise.all([
          fetchGovernanceCalendar(),
          fetchProposals({
            filter: proposalsFilterOptions.relevant.filter,
            pagination: { limit: 10, offset: 0 },
          }),
          fetchProposals({
            filter: proposalsFilterOptions.everything.filter,
            pagination: { limit: 10, offset: 0 },
          }),
          fetchVotableSupply(),
        ]);
    }

    return {
      plmEnabled,
      supportsNotifications,
      useArchiveForProposals,
      governanceCalendar,
      relevantProposals,
      allProposals,
      votableSupply,
      archivedProposals,
    };
  }
);

// ─── route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/proposals/")({
  head: () => {
    const { ui } = Tenant.current();
    const page = ui.page("proposals");
    const { title, description } = page?.meta ?? {
      title: "Proposals",
      description: "",
    };
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  loader: async () => serverLoadProposalsPage(),
  component: function ProposalsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;

    const {
      plmEnabled,
      supportsNotifications,
      useArchiveForProposals,
      governanceCalendar,
      relevantProposals,
      allProposals,
      votableSupply,
      archivedProposals,
    } = data;

    const proposalsContent = (
      <>
        <NeedsMyVoteProposalsList
          fetchNeedsMyVoteProposals={(address: string) =>
            serverFetchNeedsMyVoteProposals({ data: { address } })
          }
          votableSupply={votableSupply}
        />
        {useArchiveForProposals ? (
          <ArchiveProposalsList
            proposals={archivedProposals.data}
            governanceCalendar={governanceCalendar}
          />
        ) : (
          <ProposalsList
            initRelevantProposals={relevantProposals}
            initAllProposals={allProposals}
            fetchProposals={(pagination: PaginationParams, filter: string) =>
              serverFetchProposals({
                data: {
                  filter,
                  limit: pagination.limit,
                  offset: pagination.offset,
                },
              }) as Promise<PaginatedResult<Proposal[]>>
            }
            governanceCalendar={governanceCalendar}
            votableSupply={votableSupply}
          />
        )}
      </>
    );

    return (
      <div className="flex flex-col">
        {supportsNotifications && <SubscribeDialogLauncher />}
        <Hero page="proposals" />
        <DraftsTabsWrapper
          plmEnabled={!!plmEnabled}
          fetchDraftProposals={(address: `0x${string}`) =>
            serverFetchDraftProposals({ data: { address } })
          }
          fetchSponsorshipProposals={(address: `0x${string}`) =>
            serverFetchSponsorshipProposals({ data: { address } })
          }
        >
          {proposalsContent}
        </DraftsTabsWrapper>
      </div>
    );
  },
});
