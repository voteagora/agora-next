import { monitoring } from "./monitoringService";
import { AsyncLocalStorage } from "async_hooks";
import { v4 as uuidv4 } from "uuid";

// Create a request context storage
const asyncLocalStorage = new AsyncLocalStorage();

interface TimingContext {
  startTime: number;
  api: string;
  labels: Record<string, string>;
  requestId: string;
}

export async function withMetrics<T>(
  api: string,
  fn: () => Promise<T>,
  labels: Record<string, string> = {}
): Promise<T> {
  const startTime = Date.now();
  // Add timestamp to make the ID more unique and traceable
  const requestId = `${startTime}-${uuidv4()}`;
  const context: TimingContext = { startTime, api, labels, requestId };

  // Log with ISO timestamp and request ID for better debugging
  console.log(
    `[${requestId}] ### ${api} started at ${new Date(startTime).toISOString()} (${startTime}ms)`
  );

  return asyncLocalStorage.run(context, async () => {
    try {
      const result = await fn();

      // Get timing from the context
      const currentContext = asyncLocalStorage.getStore() as TimingContext;
      const endTime = Date.now();
      const duration = endTime - currentContext.startTime;

      console.log(
        `[${currentContext.requestId}] ### ${api} succeeded at ${new Date(endTime).toISOString()} (${endTime}ms) - duration: ${duration}ms`
      );

      await monitoring.recordMetric({
        name: "api.duration",
        value: duration,
        labels: {
          api,
          result: "success",
          ...labels,
        },
        type: "distribution",
      });

      await monitoring.recordMetric({
        name: "api.requests",
        value: 1,
        labels: {
          api,
          result: "success",
          ...labels,
        },
        type: "count",
      });

      return result;
    } catch (error) {
      const currentContext = asyncLocalStorage.getStore() as TimingContext;
      const endTime = Date.now();
      const duration = endTime - currentContext.startTime;

      console.log(
        `[${currentContext.requestId}] ### ${api} failed at ${new Date(endTime).toISOString()} (${endTime}ms) - duration: ${duration}ms`
      );

      await monitoring.recordMetric({
        name: "api.duration",
        value: duration,
        labels: {
          api,
          result: "error",
          ...labels,
        },
        type: "distribution",
      });

      await monitoring.recordMetric({
        name: "api.requests",
        value: 1,
        labels: {
          api,
          result: "error",
          ...labels,
        },
        type: "count",
      });

      throw error;
    }
  });
}
