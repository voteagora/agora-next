import { useQuery } from "@tanstack/react-query";
import { type DaoSlug } from "@prisma/client";

interface FinancialMetricsData {
  TOTAL_ASSETS: number | null;
  NET_PROFIT?: number | null;
  NET_LOSS?: number | null;
  TOTAL_OPERATING_EXPENSES: number | null;
  CASH_AND_CASH_EQUIVALENTS: number | null;
}

interface FinancialMetric {
  id: number;
  dao_slug: DaoSlug;
  topic_id: number | null;
  year: number | null;
  month: string | null;
  data: FinancialMetricsData;
  createdAt: Date;
  updatedAt: Date;
}

interface FinancialMetricsResponse {
  metrics: FinancialMetric[];
}

export function useFinancialMetrics(daoSlug: DaoSlug) {
  return useQuery({
    queryKey: ["financial-metrics", daoSlug],
    queryFn: async () => {
      const response = await fetch(
        `/api/duna/financial-metrics?daoSlug=${daoSlug}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch financial metrics");
      }

      return response.json() as Promise<FinancialMetricsResponse>;
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}
