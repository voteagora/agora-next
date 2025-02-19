import https from "https";
import Tenant from "./tenant/tenant";

interface MetricOptions {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

class MonitoringService {
  private enabled: boolean;
  private namespace: string;
  private apiKey!: string;

  constructor() {
    this.enabled = process.env.ENABLE_METRICS === "true";
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
      console.log("Metrics disabled, skipping metric:", {
        name: options.name,
        value: options.value,
        labels: options.labels,
      });
      return;
    }

    const tags = Object.entries(options.labels || {}).map(
      ([key, value]) => `${key}:${value}`
    );

    // Add global tags
    tags.push(
      `env:${process.env.VERCEL_ENV || process.env.NODE_ENV || "development"}`,
      "service:agora-next"
    );

    const metricName = `${this.namespace}.${options.name}`;

    const payload = JSON.stringify({
      series: [
        {
          metric: metricName,
          points: [[Math.floor(Date.now() / 1000), options.value]],
          type: "gauge",
          tags: tags,
        },
      ],
    });

    console.log("Sending metric to Datadog:", {
      metric: metricName,
      value: options.value,
      tags: tags,
    });

    const requestOptions = {
      method: "POST",
      hostname: "api.datadoghq.com",
      path: "/api/v1/series",
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": this.apiKey,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(requestOptions, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 202) {
            console.log("Successfully sent metric to Datadog:", {
              metric: metricName,
              value: options.value,
              tags: tags,
            });
            resolve(true);
          } else {
            console.error("Datadog API Error:", {
              statusCode: res.statusCode,
              response: data,
            });
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on("error", (error) => {
        console.error("Datadog API Request Error:", error);
        reject(error);
      });

      req.write(payload);
      req.end();
    });
  }
}

export const monitoring = new MonitoringService();
