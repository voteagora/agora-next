import { GoogleAuth } from "google-auth-library";

interface MetricOptions {
  name: string;
  value: number;
  labels?: Record<string, string>;
}

class MonitoringService {
  private batchSize: number;
  private batchDelayMs: number;
  private metricsBatch: MetricOptions[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private projectId: string;
  private auth: GoogleAuth;
  private enabled: boolean;

  constructor() {
    // Check if metrics are enabled
    this.enabled = process.env.ENABLE_METRICS === "true";

    this.projectId = process.env.GOOGLE_CLOUD_PROJECT!;
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CLOUD_CREDENTIALS!, "base64").toString()
    );

    this.auth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/monitoring.write"],
    });

    this.batchSize = Number(process.env.MONITORING_BATCH_SIZE) || 20;
    this.batchDelayMs = Number(process.env.MONITORING_BATCH_DELAY_MS) || 1000;
  }

  async recordMetric(options: MetricOptions) {
    if (!this.enabled) {
      return;
    }

    this.metricsBatch.push(options);

    if (this.metricsBatch.length >= this.batchSize) {
      await this.flushMetrics();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(
        () => this.flushMetrics(),
        this.batchDelayMs
      );
    }
  }

  private async flushMetrics() {
    if (this.metricsBatch.length === 0) return;

    const timeSeriesData = this.metricsBatch.map((metric) => ({
      metric: {
        type: `custom.googleapis.com/agora/${metric.name}`,
        labels: metric.labels || {},
      },
      resource: {
        type: "global",
        labels: {},
      },
      points: [
        {
          interval: {
            endTime: {
              seconds: Math.floor(Date.now() / 1000),
            },
          },
          value: {
            doubleValue: metric.value,
          },
        },
      ],
    }));

    try {
      console.log(
        `Sending ${this.metricsBatch.length} metrics to GCP:`,
        this.metricsBatch.map((m) => `${m.name}=${m.value}`)
      );

      const client = await this.auth.getClient();
      const token = await client.getAccessToken();

      const response = await fetch(
        `https://monitoring.googleapis.com/v3/projects/${this.projectId}/timeSeries`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ timeSeries: timeSeriesData }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, body: ${errorBody}`
        );
      }
      console.log("Metrics sent successfully");
    } catch (error) {
      console.error("Error sending metrics to GCP:", error);
      // Log the actual time series data being sent for debugging
      console.error(
        "Time series data:",
        JSON.stringify(timeSeriesData, null, 2)
      );
    }

    this.metricsBatch = [];
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
  }
}

export const monitoring = new MonitoringService();
