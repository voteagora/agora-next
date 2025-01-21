import Tenant from "@/lib/tenant/tenant";

const { contracts, slug, ui } = Tenant.current();

// If a tenant explicitly sets analytics to disabled, we don't track events
const hasAnalyticsEnabled = ui.toggle("analytics")
  ? ui.toggle("analytics")?.enabled
  : true;

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
    if (!hasAnalyticsEnabled) {
      return;
    }

    // The idea is to add tenant data to the event so we can guarantee the event log has it
    // even if the call to trackEvent fails to include it.
    const eventWithTenantData = {
      ...event,
      event_data: {
        ...event.event_data,
        dao_slug: slug,
        chain_id: contracts.token.chain.id,
        token_address: contracts.token.address,
        governor_address: contracts.governor.address,
      },
    };
    await Promise.all(
      this.services.map((service) =>
        service.trackEvent(eventWithTenantData).catch((err) => {
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
