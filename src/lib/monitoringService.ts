import { StatsD } from "hot-shots";
import Tenant from "./tenant/tenant";

interface MetricOptions {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

class MonitoringService {
  private client: StatsD;
  private enabled: boolean;
  private namespace: string;

  constructor() {
    const isVercel = process.env.VERCEL === "1";
    this.enabled = process.env.ENABLE_METRICS === "true";
    this.namespace = `agora-next.${Tenant.current().namespace}`;

    this.client = new StatsD({
      host: isVercel
        ? "https://api.datadoghq.com"
        : process.env.DD_AGENT_HOST || "localhost",
      port: isVercel ? 443 : Number(process.env.DD_AGENT_PORT) || 8125,
      prefix: `${this.namespace}.`,
      errorHandler: (error) => {
        console.error("StatsD error:", error);
      },
      protocol: isVercel ? "tcp" : "udp",
      sampleRate: 1,
      useDefaultRoute: true,
    });
  }

  async recordMetric(options: MetricOptions) {
    if (!this.enabled) {
      console.log("Metrics disabled, skipping metric:", {
        name: options.name,
        value: options.value,
        labels: options.labels,
      });
      return;
    }

    // Convert labels to Datadog tags format
    const tags = Object.entries(options.labels || {}).map(
      ([key, value]) => `${key}:${value}`
    );

    // Log the metric being sent
    console.log("Sending metric to Datadog:", {
      metric: `${this.namespace}.${options.name}`,
      value: options.value,
      tags: tags,
    });

    // Send metric to Datadog
    this.client.gauge(options.name, options.value, tags, (error) => {
      if (error) {
        console.error("Error sending metric to Datadog:", error);
      } else {
        console.log("Successfully sent metric to Datadog:", {
          metric: `${this.namespace}.${options.name}`,
          value: options.value,
          tags: tags,
        });
      }
    });
  }
}

export const monitoring = new MonitoringService();
