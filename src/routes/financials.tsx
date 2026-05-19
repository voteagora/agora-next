/*
 * TanStack Start port of src/app/financials/page.tsx.
 * URL: /financials
 */

import { createServerFn } from "@tanstack/react-start";
import { createFileRoute, redirect } from "@tanstack/react-router";

import Tenant from "@/lib/tenant/tenant";
import { FREQUENCY_FILTERS } from "@/lib/constants";
import { ChartTreasury } from "@/app/info/components/ChartTreasury";
import GovernanceCharts from "@/app/info/components/GovernanceCharts";
import DunaMetricsCards from "@/app/duna/components/DunaMetricsCards";
import FinancialStatementsClient from "@/app/duna/components/FinancialStatementsClient";
import financialMock from "@/assets/tenant/financial_mock.png";
import financialDocMock from "@/assets/tenant/financial-doc-mock.png";

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

export const Route = createFileRoute("/financials")({
  beforeLoad: () => {
    const { ui } = Tenant.current();
    if (!ui.toggle("duna")?.enabled) {
      throw redirect({ to: "/" });
    }
  },
  head: () => {
    const tenant = Tenant.current();
    const page = tenant.ui.page("financials") || tenant.ui.page("info");
    const title = page?.meta?.title ?? "Financials";
    const description = page?.meta?.description ?? "";
    return {
      meta: [{ title }, { name: "description", content: description }],
    };
  },
  loader: async () => {
    const { ui } = Tenant.current();
    const hasGovernanceCharts =
      ui.toggle("info/governance-charts")?.enabled === true;
    const areFinancialsComingSoon =
      ui.toggle("financials-coming-soon")?.enabled === true;

    if (areFinancialsComingSoon) {
      return {
        areFinancialsComingSoon: true,
        hasGovernanceCharts: false,
        treasuryData: null as null | Awaited<
          ReturnType<typeof serverGetTreasuryData>
        >,
        financialStatements: [] as unknown[],
        isFinancialStatementsEnabled: false,
        financialStatementsTitle: "",
      };
    }

    const { apiFetchTreasuryBalanceTS } = await import(
      "@/app/api/balances/[frequency]/getTreasuryBalanceTS"
    );
    const treasuryData = await apiFetchTreasuryBalanceTS(
      FREQUENCY_FILTERS.YEAR
    );

    // Fetch DunaFinancials data
    const financialStatementsToggle = ui.toggle("duna/financial-statements");
    const isFinancialStatementsEnabled =
      financialStatementsToggle?.enabled ?? false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let financialStatements: any[] = [];

    if (isFinancialStatementsEnabled) {
      try {
        const { getDunaCategoryId, getForumTopics } = await import(
          "@/lib/actions/forum"
        );
        const dunaCategoryId = await getDunaCategoryId();
        if (dunaCategoryId) {
          const topicsResult = await getForumTopics({
            categoryId: dunaCategoryId,
          });
          if (topicsResult?.success) {
            financialStatements = topicsResult.data
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .filter((topic: any) => topic.isFinancialStatement === true)
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              .map((topic: any) => ({
                id: topic.id,
                name: topic.title,
                url: "",
                ipfsCid: "",
                createdAt: topic.createdAt,
                uploadedBy: topic.address,
                archived: topic.deletedAt !== null,
                revealTime: topic.revealTime,
                expirationTime: topic.expirationTime,
                topicId: topic.id,
                topicTitle: topic.title,
              }));
          }
        }
      } catch (error) {
        console.error("Error fetching forum data:", error);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const financialStatementsConfig = financialStatementsToggle?.config as any;

    return {
      areFinancialsComingSoon: false,
      hasGovernanceCharts,
      treasuryData,
      financialStatements,
      isFinancialStatementsEnabled,
      financialStatementsTitle:
        financialStatementsConfig?.title?.toUpperCase() ??
        "FINANCIAL STATEMENTS",
    };
  },
  component: function FinancialsPage() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = Route.useLoaderData() as any;
    if (!data) return null;

    const {
      areFinancialsComingSoon,
      treasuryData,
      hasGovernanceCharts,
      financialStatements,
      isFinancialStatementsEnabled,
      financialStatementsTitle,
    } = data;

    if (areFinancialsComingSoon) {
      return (
        <div className="flex flex-col">
          <div className="flex flex-col max-w-[76rem]">
            <div className="relative">
              <img
                src={financialMock}
                alt="Static proposals"
                className="w-full h-auto blur-[10px] opacity-60 block"
              />
              <img
                src={financialDocMock}
                alt="Static proposals"
                className="w-full h-auto blur-[10px] opacity-60 block mt-4"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-primary text-center text-base leading-6">
                  Coming soon
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col">
        {/* DunaFinancials content */}
        <div id="duna-financials" className="mt-8 flex flex-col gap-6">
          <DunaMetricsCards />
          {isFinancialStatementsEnabled && financialStatements.length > 0 && (
            <div className="border border-line rounded-2xl p-6 bg-cardBackground shadow-sm min-w-0">
              <p className="text-base font-semibold text-primary uppercase tracking-wide">
                {financialStatementsTitle}
              </p>
              <FinancialStatementsClient
                statements={financialStatements}
                title=""
              />
            </div>
          )}
        </div>

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
