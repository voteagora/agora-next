interface AnalyticsEvent {
  event_name: string;
  event_data: Record<string, any>;
}

interface AnalyticsService {
  trackEvent(event: AnalyticsEvent): Promise<void>;
}

// Database analytics service
class DatabaseAnalytics implements AnalyticsService {
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    const apiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;

    if (!apiKey) {
      throw new Error("AGORA_API_KEY is not set");
    }

    await fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(event, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      ),
    });
  }
}

class AnalyticsManager {
  private services: AnalyticsService[] = [];

  addService(service: AnalyticsService) {
    this.services.push(service);
  }

  async trackEvent(event: AnalyticsEvent) {
    await Promise.all(
      this.services.map((service) =>
        service.trackEvent(event).catch((err) => {
          console.error("Analytics service error:", err);
          // Don't throw - we don't want one service failure to affect others
        })
      )
    );
  }
}

const analyticsManager = new AnalyticsManager();
analyticsManager.addService(new DatabaseAnalytics());

export const trackEvent = (event: AnalyticsEvent) =>
  analyticsManager.trackEvent(event);
