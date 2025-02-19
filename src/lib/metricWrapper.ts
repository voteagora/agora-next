import { monitoring } from "./monitoringService";

export async function withMetrics<T>(
  api: string,
  fn: () => Promise<T>,
  labels: Record<string, string> = {}
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await fn();

    // Record success metrics
    const duration = Date.now() - startTime;
    await monitoring.recordMetric({
      name: "api.duration",
      value: duration,
      labels: {
        api,
        result: "success",
        ...labels,
      },
    });

    await monitoring.recordMetric({
      name: "api.requests",
      value: 1,
      labels: {
        api,
        result: "success",
        ...labels,
      },
    });

    return result;
  } catch (error) {
    // Record error metrics
    const duration = Date.now() - startTime;
    await monitoring.recordMetric({
      name: "api.duration",
      value: duration,
      labels: {
        api,
        result: "error",
        ...labels,
      },
    });

    await monitoring.recordMetric({
      name: "api.requests",
      value: 1,
      labels: {
        api,
        result: "error",
        ...labels,
      },
    });

    throw error;
  }
}
