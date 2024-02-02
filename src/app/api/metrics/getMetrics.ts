import { getMetricsForNamespace } from "../common/metrics/getMetrics";

export const getMetrics = () =>
  getMetricsForNamespace({ namespace: "optimism" });
