import React from "react";
import Tenant from "@/lib/tenant/tenant";
import { FREQUENCY_FILTERS } from "@/lib/constants";
import { apiFetchTreasuryBalanceTS } from "@/app/api/balances/[frequency]/getTreasuryBalanceTS";
import { apiFetchDelegateWeights } from "@/app/api/analytics/top/delegates/getTopDelegateWeighs";
import { apiFetchProposalVoteCounts } from "@/app/api/analytics/vote/getProposalVoteCounts";
import { apiFetchMetricTS } from "@/app/api/analytics/metric/[metric_id]/[frequency]/getMetricsTS";
import { ChartTreasury } from "@/app/info/components/ChartTreasury";
import GovernanceCharts from "@/app/info/components/GovernanceCharts";
import DunaFinancials from "@/app/duna/components/DunaFinancials";
import { getMetadataBaseUrl } from "@/app/lib/utils/metadata";
import FinancialsComingSoon from "./FinancialsComingSoon";

export const dynamic = "force-dynamic";

export async function generateMetadata({}) {
  const tenant = Tenant.current();
  const page = tenant.ui.page("financials") || tenant.ui.page("info");

  const title = page?.meta?.title ?? "Financials";
  const description = page?.meta?.description ?? "";
  const metadataBase = getMetadataBaseUrl();

  const preview = `/api/images/og/generic?title=${encodeURIComponent(
    title
  )}&description=${encodeURIComponent(description)}`;

  return {
    metadataBase,
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      images: [
        {
          url: preview,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function Page() {
  const { ui } = Tenant.current();

  if (!ui.toggle("duna")?.enabled) {
    return (
      <div className="text-primary">Route not supported for namespace</div>
    );
  }

  const hasGovernanceCharts =
    ui.toggle("info/governance-charts")?.enabled === true;

  const treasuryData = await apiFetchTreasuryBalanceTS(FREQUENCY_FILTERS.YEAR);

  const areFinancialsComingSoon = ui.toggle("financials-coming-soon");

  if (areFinancialsComingSoon) {
    return <FinancialsComingSoon />;
  }

  return (
    <div className="flex flex-col">
      <DunaFinancials />
      {treasuryData.result.length > 0 && (
        <ChartTreasury
          initialData={treasuryData.result}
          getData={async (frequency: string) => {
            "use server";
            return apiFetchTreasuryBalanceTS(frequency);
          }}
        />
      )}
      {hasGovernanceCharts && (
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
  );
}
