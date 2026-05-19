/*
 * TanStack Start port of src/app/info/page.tsx.
 * URL: /info
 */

import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { FREQUENCY_FILTERS, TENANT_NAMESPACES } from "@/lib/constants";
import { UIDunaDescriptionConfig } from "@/lib/tenant/tenantUI";
import Hero from "@/components/Hero/Hero";
import InfoAbout from "@/app/info/components/InfoAbout";
import { InfoHero } from "@/app/info/components/InfoHero";
import { ChartTreasury } from "@/app/info/components/ChartTreasury";
import GovernanceCharts from "@/app/info/components/GovernanceCharts";
import DunaDisclosuresContent from "@/app/duna/components/DunaDisclosuresContent";
import GovernanceInfoSections from "@/app/info/components/GovernanceInfoSections";
import FormationDocumentsList from "@/app/duna/components/FormationDocumentsList";
import { ExternalLink } from "@/icons/ExternalLink";
import GovernorSettingsParams from "@/app/info/components/GovernorSettingsParams";
import ContractList from "@/app/info/components/ContractList";
import GovernorSettingsProposalTypes from "@/app/info/components/GovernorSettingsProposalTypes";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const serverGetTreasuryData = createServerFn({ method: "GET" })
  .inputValidator((data: { frequency: string }) => data)
  .handler(async ({ data }) => {
    const { apiFetchTreasuryBalanceTS } = await import(
      "@/app/api/balances/[frequency]/getTreasuryBalanceTS"
    );
    return apiFetchTreasuryBalanceTS(data.frequency);
  });

const serverGetDelegateWeights = createServerFn({ method: "GET" }).handler(
  async () => {
    const { apiFetchDelegateWeights } = await import(
      "@/app/api/analytics/top/delegates/getTopDelegateWeighs"
    );
    return apiFetchDelegateWeights();
  }
);

const serverGetProposalVoteCounts = createServerFn({ method: "GET" }).handler(
  async () => {
    const { apiFetchProposalVoteCounts } = await import(
      "@/app/api/analytics/vote/getProposalVoteCounts"
    );
    return apiFetchProposalVoteCounts();
  }
);

const serverGetMetrics = createServerFn({ method: "GET" })
  .inputValidator((data: { metric: string; frequency: string }) => data)
  .handler(async ({ data }) => {
    const { apiFetchMetricTS } = await import(
      "@/app/api/analytics/metric/[metric_id]/[frequency]/getMetricsTS"
    );
    return apiFetchMetricTS(data.metric, data.frequency);
  });

export const Route = createFileRoute("/info")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("info")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const tenant = Tenant.current();
    const page = tenant.ui.page("info") || tenant.ui.page("/");
    const { title, description } = page!.meta;
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  loader: async () => {
    const { ui, namespace } = Tenant.current();
    const hasGovernanceCharts =
      ui.toggle("info/governance-charts")?.enabled === true;
    const hasDunaAdministration = ui.toggle("duna")?.enabled === true;
    const isEtherFi = namespace === TENANT_NAMESPACES.ETHERFI;

    if (hasDunaAdministration) {
      // Fetch DunaAbout data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let documents: any[] = [];
      try {
        const { getDunaCategoryId, getForumCategoryAttachments } = await import(
          "@/lib/actions/forum"
        );
        const dunaCategoryId = await getDunaCategoryId();
        if (dunaCategoryId) {
          const [documentsResult, archivedDocumentsResult] = await Promise.all([
            getForumCategoryAttachments({ categoryId: dunaCategoryId }),
            getForumCategoryAttachments({
              categoryId: dunaCategoryId,
              archived: true,
            }),
          ]);
          if (documentsResult.success) {
            documents = documentsResult.data;
          }
          if (archivedDocumentsResult.success) {
            const archivedDocs = archivedDocumentsResult.data.filter(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (archivedDoc: any) =>
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                !documents.some((doc: any) => doc.id === archivedDoc.id)
            );
            documents = [...documents, ...archivedDocs];
          }
        }
      } catch (error) {
        console.error("Error fetching forum data:", error);
      }

      const documentOrder = [
        "Association Agreement",
        "Purpose",
        "Existing Authorization of Authority",
        "Grant Programs Overview",
        "Redacted EIN",
      ];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getDocumentOrderIndex = (docName: any) => {
        const index = documentOrder.findIndex((suffix) =>
          docName.includes(suffix)
        );
        return index === -1 ? documentOrder.length : index;
      };
      const otherDocuments = documents
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((doc: any) => !doc.isFinancialStatement)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .sort((a: any, b: any) => {
          return getDocumentOrderIndex(a.name) - getDocumentOrderIndex(b.name);
        });

      const dunaToggle = ui.toggle("duna");
      const administrationTitle =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dunaToggle?.config as { title?: string })?.title ??
        "DUNA Administration";
      const dunaDescriptionToggle = ui.toggle("duna-description");
      const dunaDescriptionContent = (
        dunaDescriptionToggle?.config as UIDunaDescriptionConfig
      )?.content;
      const infoAboutPage = ui.page("info/about");
      const infoPage = ui.page("info");
      const communityLinks = infoPage?.links ?? [];
      const aboutContent =
        dunaDescriptionToggle?.enabled && dunaDescriptionContent
          ? dunaDescriptionContent
          : (infoAboutPage?.description ?? null);
      const aboutTitle =
        ui.customization?.customAboutSubtitle || administrationTitle;

      return {
        variant: "duna" as const,
        hasDunaDisclosures: ui.toggle("duna-disclosures")?.enabled === true,
        hasGovernanceCharts: false,
        hideGovernorSettings: false,
        treasuryData: null as null | Awaited<
          ReturnType<typeof serverGetTreasuryData>
        >,
        proposalTypes: [] as unknown[],
        // DunaAbout data
        otherDocuments,
        communityLinks,
        aboutContent,
        aboutTitle,
        hasAboutContent: !!aboutContent,
      };
    }

    if (isEtherFi) {
      return {
        variant: "etherfi" as const,
        hasDunaDisclosures: false,
        hasGovernanceCharts: false,
        hideGovernorSettings: false,
        treasuryData: null as null | Awaited<
          ReturnType<typeof serverGetTreasuryData>
        >,
        proposalTypes: [] as unknown[],
        otherDocuments: [] as unknown[],
        communityLinks: [] as unknown[],
        aboutContent: null as string | null,
        aboutTitle: "",
        hasAboutContent: false,
      };
    }

    const hideGovernorSettings =
      ui.toggle("hide-governor-settings")?.enabled === true;

    // Fetch GovernorSettings data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let proposalTypes: any[] = [];
    if (!hideGovernorSettings) {
      const { fetchProposalTypes } = await import(
        "@/app/api/common/proposals/getProposals"
      );
      proposalTypes = await fetchProposalTypes();
    }

    const { apiFetchTreasuryBalanceTS } = await import(
      "@/app/api/balances/[frequency]/getTreasuryBalanceTS"
    );
    const treasuryData = await apiFetchTreasuryBalanceTS(
      FREQUENCY_FILTERS.YEAR
    );

    return {
      variant: "default" as const,
      hasDunaDisclosures: false,
      hasGovernanceCharts,
      hideGovernorSettings,
      treasuryData,
      proposalTypes,
      otherDocuments: [] as unknown[],
      communityLinks: [] as unknown[],
      aboutContent: null as string | null,
      aboutTitle: "",
      hasAboutContent: false,
    };
  },
  component: function InfoPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;

    const {
      variant,
      treasuryData,
      hasGovernanceCharts,
      hideGovernorSettings,
      hasDunaDisclosures,
      proposalTypes,
      otherDocuments,
      communityLinks,
      aboutContent,
      aboutTitle,
      hasAboutContent,
    } = data;

    if (variant === "etherfi") {
      return (
        <div>
          <Hero page="info" />
          <div>
            <div className="flex gap-6">
              <div className="bg-gradient-to-b from-stone-300 to-white w-[1px] relative top-2"></div>
              <div className="flex flex-col gap-8 max-w-2xl">
                <div>
                  <div className="text-sm text-indigo-800 font-medium">
                    Live – ETHFI token launch
                  </div>
                  <div>
                    <div className="w-[13px] h-[13px] rounded-full bg-indigo-800 relative -left-[31px] border-4 -top-4"></div>
                    On March 18th, we&apos;re launching the $ETHFI token and
                    taking the first step towards full decentralization.
                  </div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">
                    Phase 1 – Governance initiation
                  </div>
                  <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                  <div>
                    Over the next weeks, we will be gradually bringing voters
                    into Ether.fi&apos;s governance by launching offchain voting
                    on Snapshot, delegate elections, our security council, and
                    discourse groups.
                  </div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">
                    Phase 2 – Transition to onchain governance
                  </div>
                  <div>
                    <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                    As the community grows over the next months, we will be
                    fully deploying the Agora onchain governor, and granting the
                    community access control to Ether.fi&apos;s protocol and
                    treasury. This is allow Ether.fi&apos;s team and the
                    community to fully collaborate in steering the protocol.
                  </div>
                </div>
                <div>
                  <div className="text-sm text-secondary font-medium">
                    Phase 3 – Full Ossification
                  </div>
                  <div className="w-[5px] h-[5px] rounded-full bg-stone-300 relative -left-[27px] -top-4"></div>
                  <div>
                    In the long run, we&apos;ll work on fully automating and
                    ossifying governance function so that Ether.fi can stand the
                    test of time and last as an immutable protocol underpinning
                    Ethereum&apos;s staking
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (variant === "duna") {
      return (
        <div className="flex flex-col">
          <InfoHero />
          {/* Inlined DunaAbout */}
          <div className="mt-8 flex flex-col gap-6">
            {(hasAboutContent || communityLinks.length > 0) && (
              <div className="flex flex-col lg:flex-row gap-6">
                {hasAboutContent && (
                  <div className="flex-1 border border-line rounded-2xl p-6 bg-cardBackground shadow-sm">
                    <p className="text-base font-semibold text-primary uppercase tracking-wide mb-6">
                      {aboutTitle}
                    </p>
                    <div className="text-secondary text-base leading-relaxed whitespace-pre-line">
                      {aboutContent}
                    </div>
                  </div>
                )}
                {communityLinks.length > 0 && (
                  <div className="lg:w-80 border border-line rounded-2xl p-6 bg-cardBackground shadow-sm flex-shrink-0">
                    <p className="text-base font-semibold text-primary uppercase tracking-wide mb-6">
                      COMMUNITY RESOURCES
                    </p>
                    <div className="flex flex-col gap-1">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {communityLinks.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 py-2 text-secondary hover:text-primary transition-colors group"
                        >
                          <ExternalLink className="flex-shrink-0 text-secondary group-hover:text-primary transition-colors" />
                          <span className="text-base font-medium">
                            {link.title}{" "}
                            <span className="text-tertiary">↗</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {otherDocuments.length > 0 && (
              <div className="border border-line rounded-2xl p-6 bg-cardBackground shadow-sm min-w-0 flex-1">
                <p className="text-base font-semibold text-primary uppercase tracking-wide">
                  FORMATION DOCUMENTS
                </p>
                <FormationDocumentsList initialDocuments={otherDocuments} />
              </div>
            )}
            <GovernanceInfoSections />
          </div>
          {hasDunaDisclosures && <DunaDisclosuresContent />}
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        <InfoHero />
        <InfoAbout />
        {!hideGovernorSettings && (
          /* Inlined GovernorSettings */
          <Accordion
            type="single"
            collapsible
            className="w-full border border-line p-6 mt-4 rounded-xl bg-neutral shadow-sm"
          >
            <AccordionItem className="border-none" value="item-1">
              <AccordionTrigger className="text-primary font-bold hover:no-underline p-0">
                Governor settings
              </AccordionTrigger>
              <AccordionContent className="pt-6 px-0">
                <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                  <div className="w-full sm:w-[65%] border border-line rounded-lg">
                    <ContractList />
                  </div>
                  <div className="w-full sm:w-[35%] border border-line h-fit rounded-lg">
                    <GovernorSettingsParams />
                  </div>
                </div>
                <div className="w-full border border-line rounded-lg mt-6">
                  <GovernorSettingsProposalTypes
                    proposalTypes={proposalTypes}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        <GovernanceInfoSections />
        {treasuryData && treasuryData.result.length > 0 && (
          <ChartTreasury
            initialData={treasuryData.result}
            getData={(frequency: string) =>
              serverGetTreasuryData({ data: { frequency } })
            }
          />
        )}
        {hasGovernanceCharts && (
          <GovernanceCharts
            getDelegates={() => serverGetDelegateWeights()}
            getVotes={() => serverGetProposalVoteCounts()}
            getMetrics={(metric: string, frequency: string) =>
              serverGetMetrics({ data: { metric, frequency } })
            }
          />
        )}
      </div>
    );
  },
});
