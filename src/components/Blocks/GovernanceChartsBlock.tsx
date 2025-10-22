import { GovernanceChartsBlockConfig } from "@/lib/blocks/types";
import { ChartTreasury } from "@/app/info/components/ChartTreasury";
import GovernanceCharts from "@/app/info/components/GovernanceCharts";
import { apiFetchTreasuryBalanceTS } from "@/app/api/balances/[frequency]/getTreasuryBalanceTS";
import { apiFetchDelegateWeights } from "@/app/api/analytics/top/delegates/getTopDelegateWeighs";
import { apiFetchProposalVoteCounts } from "@/app/api/analytics/vote/getProposalVoteCounts";
import { apiFetchMetricTS } from "@/app/api/analytics/metric/[metric_id]/[frequency]/getMetricsTS";
import { FREQUENCY_FILTERS } from "@/lib/constants";

interface GovernanceChartsBlockProps {
  config: GovernanceChartsBlockConfig;
}

export async function GovernanceChartsBlock({
  config,
}: GovernanceChartsBlockProps) {
  const chartTypes = new Set(config.chart_types);

  // Fetch treasury data if needed
  const treasuryData =
    chartTypes.has("treasury") || chartTypes.size === 0
      ? await apiFetchTreasuryBalanceTS(FREQUENCY_FILTERS.YEAR)
      : null;

  const shouldShowGovernanceCharts =
    chartTypes.has("active_delegates") ||
    chartTypes.has("avg_votes") ||
    chartTypes.has("required_delegates") ||
    chartTypes.has("top_delegates") ||
    chartTypes.has("votable_supply");

  return (
    <>
      {config.title && (
        <h3 className="text-2xl font-black text-primary mt-12">
          {config.title}
        </h3>
      )}

      <div className="mt-4">
        {treasuryData && treasuryData.result.length > 0 && (
          <ChartTreasury
            initialData={treasuryData.result}
            getData={async (frequency: string) => {
              "use server";
              return apiFetchTreasuryBalanceTS(frequency);
            }}
          />
        )}

        {shouldShowGovernanceCharts && (
          <GovernanceCharts
            getDelegates={async () => {
              "use server";
              return apiFetchDelegateWeights();
            }}
            getVotes={async () => {
              "use server";
              return apiFetchProposalVoteCounts();
            }}
            getMetrics={async (metric: string, frequency: string) => {
              "use server";
              return apiFetchMetricTS(metric, frequency);
            }}
          />
        )}
      </div>
    </>
  );
}
