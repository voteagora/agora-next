import { randomUUID } from "crypto";

import { monitoring } from "./monitoringService";

type LabelValue = string | number | boolean | null | undefined;
type MonitoringLabels = Record<string, LabelValue>;

type RouteMonitoringOptions<TArgs extends unknown[]> = {
  labels?: MonitoringLabels;
  getLabels?: (...args: TArgs) => MonitoringLabels | Promise<MonitoringLabels>;
};

type ActionMonitoringOptions<T> = {
  labels?: MonitoringLabels;
  isErrorResult?: (result: T) => boolean;
};

function stringifyLabels(labels: MonitoringLabels = {}) {
  return Object.fromEntries(
    Object.entries(labels)
      .filter(([, value]) => value !== undefined && value !== null)
      .map(([key, value]) => [key, String(value)])
  );
}

function getRequest(args: unknown[]) {
  return args.find((arg): arg is Request => arg instanceof Request);
}

function getRequestId(request: Request | undefined, startTime: number) {
  return (
    request?.headers.get("x-request-id") ||
    request?.headers.get("x-vercel-id") ||
    `${startTime}-${randomUUID()}`
  );
}

function isErrorStatus(statusCode: number) {
  return statusCode >= 500;
}

function isFormStateError(result: unknown) {
  return (
    typeof result === "object" &&
    result !== null &&
    "ok" in result &&
    (result as { ok?: unknown }).ok === false
  );
}

export function withApiRouteMonitoring<TArgs extends unknown[]>(
  api: string,
  handler: (...args: TArgs) => Response | Promise<Response>,
  options: RouteMonitoringOptions<TArgs> = {}
) {
  return async (...args: TArgs) => {
    const startTime = Date.now();
    const request = getRequest(args);
    const requestId = getRequestId(request, startTime);
    const dynamicLabels = options.getLabels
      ? await options.getLabels(...args)
      : {};
    const baseLabels = stringifyLabels({
      source: "route",
      method: request?.method,
      ...options.labels,
      ...dynamicLabels,
    });

    try {
      const response = await handler(...args);
      const durationMs = Date.now() - startTime;
      const statusCode = response.status;

      await monitoring.recordApiRequest({
        api,
        result: isErrorStatus(statusCode) ? "error" : "success",
        durationMs,
        requestId,
        source: "route",
        labels: {
          ...baseLabels,
          statusCode: String(statusCode),
        },
        error: isErrorStatus(statusCode) ? response.statusText : undefined,
      });

      return response;
    } catch (error) {
      await monitoring.recordApiRequest({
        api,
        result: "error",
        durationMs: Date.now() - startTime,
        requestId,
        source: "route",
        labels: {
          ...baseLabels,
          statusCode: "500",
        },
        error,
      });

      throw error;
    }
  };
}

export async function withServerActionMonitoring<T>(
  action: string,
  fn: () => Promise<T>,
  options: ActionMonitoringOptions<T> = {}
) {
  const startTime = Date.now();
  const requestId = `${startTime}-${randomUUID()}`;
  const baseLabels = stringifyLabels({
    source: "server_action",
    ...options.labels,
  });

  try {
    const result = await fn();
    const isErrorResult =
      options.isErrorResult?.(result) ?? isFormStateError(result);

    await monitoring.recordApiRequest({
      api: action,
      result: isErrorResult ? "error" : "success",
      durationMs: Date.now() - startTime,
      requestId,
      source: "server_action",
      labels: baseLabels,
      error: isErrorResult
        ? "Server action returned an error result"
        : undefined,
    });

    return result;
  } catch (error) {
    await monitoring.recordApiRequest({
      api: action,
      result: "error",
      durationMs: Date.now() - startTime,
      requestId,
      source: "server_action",
      labels: baseLabels,
      error,
    });

    throw error;
  }
}
