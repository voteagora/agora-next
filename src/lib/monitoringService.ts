import Tenant from "./tenant/tenant";

interface MetricOptions {
  name: string;
  value: number;
  labels?: Record<string, string>;
  type?: "count" | "distribution";
}

class MonitoringService {
  private enabled: boolean;
  private namespace: string;
  private apiKey!: string;

  constructor() {
    this.enabled = process.env.ENABLE_DD_METRICS === "true";
    this.namespace = `agora-next.${Tenant.current().namespace}`;

    const apiKey = process.env.DD_API_KEY;
    if (!apiKey) {
      console.error("DD_API_KEY environment variable is not set!");
      this.enabled = false;
      return;
    }

    this.apiKey = apiKey;
  }

  async recordMetric(options: MetricOptions) {
    if (!this.enabled) {
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
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "DD-API-KEY": this.apiKey,
        },
        body: payload,
      });

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
