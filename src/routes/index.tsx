/*
 * TanStack Start port of src/app/page.tsx.
 * URL: /
 */

import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";

import Tenant from "@/lib/tenant/tenant";
import Hero from "@/components/Hero/Hero";
import NeedsMyVoteProposalsList from "@/components/Proposals/NeedsMyVoteProposalsList/NeedsMyVoteProposalsList";
import ProposalsList from "@/components/Proposals/ProposalsList/ProposalsList";
import ArchiveProposalsList from "@/components/Proposals/ProposalsList/ArchiveProposalsList";
import { proposalsFilterOptions, TENANT_NAMESPACES } from "@/lib/constants";
import { DraftsTabsWrapper } from "@/components/Proposals/DraftsTabsWrapper";
import {
  type PaginatedResult,
  type PaginationParams,
} from "@/app/lib/pagination";
import { type Proposal } from "@/app/api/common/proposals/proposal";
import SubscribeDialogLauncher from "@/components/Notifications/SubscribeDialogRootLauncher";
import townsStaticProposals from "@/assets/tenant/towns_static_proposals.svg";
import syndicateStaticProposals from "@/assets/tenant/syndicate_static_proposals.svg";

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

// ─── route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/")({
  head: () => {
    const { ui } = Tenant.current();
    const page = ui.page("proposals");
    const { title, description } = page?.meta ?? {
      title: "Agora",
      description: "",
    };
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  loader: async () => {
    const { ui, namespace } = Tenant.current();

    if (ui.toggle("coming-soon")?.enabled) {
      return {
        comingSoon: true as const,
        supportsNotifications:
          ui.toggle("email-subscriptions")?.enabled ?? false,
        showStaticProposals:
          ui.toggle("coming-soon/show-static-proposals")?.enabled ?? false,
        isTowns: namespace === TENANT_NAMESPACES.TOWNS,
      };
    }

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
      comingSoon: false as const,
      plmEnabled,
      supportsNotifications,
      useArchiveForProposals,
      governanceCalendar,
      relevantProposals,
      allProposals,
      votableSupply,
      archivedProposals,
    };
  },
  component: function Home() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;

    if (data.comingSoon) {
      const { supportsNotifications, showStaticProposals, isTowns } = data;
      const proposalsImage = isTowns
        ? townsStaticProposals
        : syndicateStaticProposals;
      const proposalsImageSrc =
        typeof proposalsImage === "string"
          ? proposalsImage
          : proposalsImage.src;
      const overlayText = isTowns
        ? "Coming soon in January 2026"
        : "Coming Soon";
      return (
        <div className="flex flex-col">
          {supportsNotifications && <SubscribeDialogLauncher />}
          <Hero page="coming-soon" />
          <div className="flex flex-col max-w-[76rem]">
            <div className="hidden sm:flex flex-row justify-between items-baseline gap-2 mb-4">
              <h1 className="text-primary text-2xl font-extrabold mb-0">
                Proposals
              </h1>
            </div>
            {showStaticProposals && (
              <div className="relative">
                <img
                  src={proposalsImageSrc}
                  alt="Static proposals"
                  className="w-full h-auto blur-sm opacity-60 block"
                />
                <img
                  src={proposalsImageSrc}
                  alt="Static proposals"
                  className="w-full h-auto blur-sm opacity-60 block -mt-1 sm:hidden"
                />
                <img
                  src={proposalsImageSrc}
                  alt="Static proposals"
                  className="w-full h-auto blur-sm opacity-60 block -mt-1 sm:hidden"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-primary text-center text-base leading-6">
                    {overlayText}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

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
