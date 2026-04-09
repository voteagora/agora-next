import { beforeEach, describe, expect, it, vi } from "vitest";

import { MIRADOR_FLOW } from "@/lib/mirador/constants";

const { toggleMock } = vi.hoisted(() => ({
  toggleMock: vi.fn(),
}));

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: toggleMock,
      },
    }),
  },
}));

describe("mirador config", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.NEXT_PUBLIC_MIRADOR_ENABLED;
    toggleMock.mockReturnValue({
      enabled: true,
      config: {
        proposalCreation: true,
        siweLoginTracing: true,
      },
    });
  });

  it("enables the web client only when at least one Mirador flow is enabled", async () => {
    const { isMiradorEnabled, shouldEnableMiradorWebClient } = await import(
      "@/lib/mirador/config"
    );

    expect(isMiradorEnabled()).toBe(true);
    expect(shouldEnableMiradorWebClient()).toBe(true);

    toggleMock.mockReturnValue({
      enabled: true,
      config: {},
    });

    expect(isMiradorEnabled()).toBe(false);
    expect(shouldEnableMiradorWebClient()).toBe(false);
  });

  it("checks the per-flow Mirador flags explicitly", async () => {
    const { isMiradorFlowTracingEnabled } = await import(
      "@/lib/mirador/config"
    );

    expect(isMiradorFlowTracingEnabled(MIRADOR_FLOW.proposalCreation)).toBe(
      true
    );
    expect(isMiradorFlowTracingEnabled(MIRADOR_FLOW.governanceVote)).toBe(
      false
    );

    toggleMock.mockReturnValue({
      enabled: true,
      config: {
        governanceVote: true,
      },
    });

    expect(isMiradorFlowTracingEnabled(MIRADOR_FLOW.governanceVote)).toBe(
      true
    );
  });

  it("maps SIWE-backed flows to the existing siweLoginTracing flag", async () => {
    const { isMiradorFlowTracingEnabled } = await import(
      "@/lib/mirador/config"
    );

    expect(
      isMiradorFlowTracingEnabled(MIRADOR_FLOW.notificationPreferences)
    ).toBe(true);
    expect(isMiradorFlowTracingEnabled(MIRADOR_FLOW.delegateStatement)).toBe(
      true
    );
  });
});
