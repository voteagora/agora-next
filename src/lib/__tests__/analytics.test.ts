import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import Tenant from "@/lib/tenant/tenant";
import { ANALYTICS_EVENT_NAMES } from "@/lib/types";

const originalEnv = { ...process.env };

global.fetch = vi.fn(() => Promise.resolve({ ok: true } as Response));
vi.mock("@/lib/tenant/tenant", () => {
  return {
    default: {
      current: vi.fn(() => ({
        contracts: {
          token: {
            chain: { id: 1 },
            address: "0xMockTokenAddress",
          },
          governor: {
            address: "0xMockGovernorAddress",
          },
        },
        slug: "mock-tenant",
        ui: {
          toggle: vi.fn((key) => {
            if (key === "analytics") {
              return { enabled: true };
            }
            return undefined;
          }),
        },
      })),
    },
  };
});

describe("Analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();

    // Reset process.env for each test
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("should not track events when NEXT_PUBLIC_ENABLE_BI_METRICS_CAPTURE is not set to true", async () => {
    process.env.NEXT_PUBLIC_ENABLE_BI_METRICS_CAPTURE = "false";

    // Import the module with the current environment settings
    const analyticsModule = await import("../analytics");

    await analyticsModule.trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
      event_data: {
        proposal_id: "1",
        support: 1,
        voter: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        transaction_hash: "0xabcdef",
      },
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("should track events when NEXT_PUBLIC_ENABLE_BI_METRICS_CAPTURE is set to true", async () => {
    process.env.NEXT_PUBLIC_ENABLE_BI_METRICS_CAPTURE = "true";
    process.env.NEXT_PUBLIC_AGORA_API_KEY = "mock-api-key";

    const analyticsModule = await import("../analytics");

    await analyticsModule.trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
      event_data: {
        proposal_id: "1",
        support: 1,
        voter: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        transaction_hash: "0xabcdef",
      },
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer mock-api-key",
      },
      body: expect.any(String),
    });

    const calledBody = JSON.parse((global.fetch as any).mock.calls[0][1].body);
    expect(calledBody).toMatchObject({
      event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
      event_data: {
        proposal_id: "1",
        support: 1,
        voter: "0x1234567890123456789012345678901234567890",
        transaction_hash: "0xabcdef",
        dao_slug: "mock-tenant",
        chain_id: 1,
        token_address: "0xMockTokenAddress",
        governor_address: "0xMockGovernorAddress",
      },
    });
  });

  it("should not track events when tenant analytics toggle is disabled, even if env var is true", async () => {
    process.env.NEXT_PUBLIC_ENABLE_BI_METRICS_CAPTURE = "true";

    // Mock the tenant toggle to return disabled
    const mockTenant = Tenant.current as any;
    mockTenant.mockReturnValueOnce({
      contracts: {
        token: {
          chain: { id: 1 },
          address: "0xMockTokenAddress",
        },
        governor: {
          address: "0xMockGovernorAddress",
        },
      },
      slug: "mock-tenant",
      ui: {
        toggle: (key: string) => {
          if (key === "analytics") {
            return { enabled: false };
          }
          return undefined;
        },
      },
    });

    const analyticsModule = await import("../analytics");

    await analyticsModule.trackEvent({
      event_name: ANALYTICS_EVENT_NAMES.STANDARD_VOTE,
      event_data: {
        proposal_id: "1",
        support: 1,
        voter: "0x1234567890123456789012345678901234567890" as `0x${string}`,
        transaction_hash: "0xabcdef",
      },
    });

    expect(global.fetch).not.toHaveBeenCalled();
  });
});
