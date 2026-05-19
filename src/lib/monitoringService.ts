interface MetricOptions {
  name: string;
  value: number;
  labels?: Record<string, string>;
  type?: "count" | "distribution";
}

interface ApiRequestOptions {
  api: string;
  result: "success" | "error";
  durationMs: number;
  requestId: string;
  source?: "operation" | "route" | "server_action";
  labels?: Record<string, string>;
  error?: unknown;
}

function getTenantNamespace() {
  return process.env.NEXT_PUBLIC_AGORA_INSTANCE_NAME || "unknown";
}

class MonitoringService {
  private datadogEnabled: boolean;
  private axiomEnabled: boolean;
  private namespace: string;
  private datadogApiKey?: string;
  private axiomToken?: string;
  private axiomDataset?: string;
  private axiomIngestUrl?: string;
  private requestTimeoutMs: number;

  constructor() {
    this.namespace = `agora-next.${getTenantNamespace()}`;
    this.requestTimeoutMs = 2000;

    this.axiomEnabled = process.env.ENABLE_AXIOM_METRICS !== "false";
    this.axiomToken = process.env.AXIOM_TOKEN;
    this.axiomDataset = process.env.AXIOM_DATASET;
    this.axiomIngestUrl = `https://api.axiom.co/v1/datasets/${encodeURIComponent(process.env.AXIOM_DATASET || "")}/ingest`;

    if (this.axiomEnabled && (!this.axiomToken || !this.axiomDataset)) {
      console.warn(
        "Axiom metrics are enabled, but AXIOM_TOKEN or AXIOM_DATASET is missing."
      );
      this.axiomEnabled = false;
    }

    this.datadogEnabled = process.env.ENABLE_DD_METRICS === "true";
    this.datadogApiKey = process.env.DD_API_KEY;

    if (this.datadogEnabled && !this.datadogApiKey) {
      console.warn(
        "Datadog metrics are enabled, but DD_API_KEY environment variable is missing."
      );
      this.datadogEnabled = false;
    }
  }

  async recordMetric(options: MetricOptions) {
    if (!this.datadogEnabled) {
      return;
    }

    await this.recordDatadogMetric(options);
  }

  async recordApiRequest(options: ApiRequestOptions) {
    await this.recordAxiomApiRequest(options);
  }

  private async postJson(
    url: string,
    headers: Record<string, string>,
    body: string
  ) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      return await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  private getCommonAxiomFields() {
    const tenantNamespace = getTenantNamespace();

    return {
      service: "agora-next",
      namespace: `agora-next.${tenantNamespace}`,
      tenant: tenantNamespace,
      env:
        process.env.VERCEL_ENV === "production" ? "production" : "development",
      vercelEnv: process.env.VERCEL_ENV,
      nodeEnv: process.env.NODE_ENV,
      vercelRegion: process.env.VERCEL_REGION,
      vercelSha: process.env.VERCEL_GIT_COMMIT_SHA,
    };
  }

  private getErrorFields(error: unknown) {
    if (!error) {
      return {};
    }

    const errorRecord =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : {};
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : undefined;
    const errorType =
      error instanceof Error
        ? error.name
        : typeof errorRecord.name === "string"
          ? errorRecord.name
          : typeof error;
    const errorCode =
      typeof errorRecord.code === "string" ||
      typeof errorRecord.code === "number"
        ? String(errorRecord.code)
        : undefined;

    return {
      errorType,
      errorCode,
      errorMessage: errorMessage?.slice(0, 500),
    };
  }

  private async recordAxiomApiRequest(options: ApiRequestOptions) {
    if (
      !this.axiomEnabled ||
      !this.axiomToken ||
      !this.axiomDataset ||
      !this.axiomIngestUrl
    ) {
      return;
    }

    const labels = options.labels || {};
    const event = {
      ...labels,
      time: new Date().toISOString(),
      event: "api.request",
      api: options.api,
      result: options.result,
      durationMs: options.durationMs,
      requestId: options.requestId,
      source: options.source || "operation",
      ...this.getCommonAxiomFields(),
      ...this.getErrorFields(options.error),
    };

    try {
      const response = await this.postJson(
        this.axiomIngestUrl,
        {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.axiomToken}`,
        },
        JSON.stringify([event])
      );

      if (!response.ok) {
        console.error(
          "Failed to send api.request event to Axiom",
          await response.text()
        );
      }
    } catch (error) {
      console.error("Error sending api.request event to Axiom", error);
    }
  }

  private async recordDatadogMetric(options: MetricOptions) {
    if (!this.datadogEnabled || !this.datadogApiKey) {
      return;
    }

    const tags = Object.entries(options.labels || {}).map(
      ([key, value]) => `${key}:${value}`
    );

    // Add global tags
    tags.push(
      `env:${process.env.VERCEL_ENV === "production" ? "production" : "development"}`,
      "service:agora-next"
    );

    const metricName = `${this.namespace}.${options.name}`;
    const metricType = options.type;

    // Determine endpoint and payload based on metric type
    const endpoint =
      metricType === "distribution"
        ? "https://api.datadoghq.com/api/v1/distribution_points"
        : "https://api.datadoghq.com/api/v1/series";

    // Create appropriate payload based on metric type
    let payload;
    if (metricType === "distribution") {
      payload = JSON.stringify({
        series: [
          {
            metric: metricName,
            points: [[Math.floor(Date.now() / 1000), [options.value]]], // Nested array for distribution
            tags: tags,
          },
        ],
      });
    } else {
      payload = JSON.stringify({
        series: [
          {
            metric: metricName,
            points: [[Math.floor(Date.now() / 1000), options.value]],
            type: metricType,
            tags: tags,
          },
        ],
      });
    }

    try {
      const response = await this.postJson(
        endpoint,
        {
          "Content-Type": "application/json",
          "DD-API-KEY": this.datadogApiKey,
        },
        payload
      );

      if (!response.ok) {
        console.error(
          `Failed to send ${metricType} metric to Datadog`,
          await response.text()
        );
      }
    } catch (error) {
      console.error(`Error sending ${metricType} metric to Datadog`, error);
    }
  }
}

export const monitoring = new MonitoringService();
