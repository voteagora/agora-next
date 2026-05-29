import { beforeEach, describe, expect, it, vi } from "vitest";

import { MIRADOR_FLOW } from "@/lib/mirador/constants";
import {
  clearStoredSiweLoginTraceState,
  closeStoredSiweLoginTrace,
  prepareFreshSiweLoginTrace,
  setStoredSiweLoginTraceState,
  startFreshSiweLoginTrace,
} from "@/lib/mirador/siweLoginTrace";
import {
  addMiradorEvent,
  closeMiradorTrace,
  flushMiradorTrace,
  startMiradorTrace,
} from "@/lib/mirador/webTrace";

vi.mock("@/lib/tenant/tenant", () => ({
  default: {
    current: () => ({
      ui: {
        toggle: () => ({
          enabled: true,
          config: {
            proposalCreation: true,
            siweLoginTracing: true,
          },
        }),
      },
    }),
  },
}));

vi.mock("@/lib/mirador/webTrace", () => ({
  addMiradorAttributes: vi.fn(),
  addMiradorEvent: vi.fn(),
  closeMiradorTrace: vi.fn(),
  flushMiradorTrace: vi.fn(),
  getMiradorTraceId: vi.fn((trace) => trace?.getTraceId?.() ?? null),
  startMiradorTrace: vi.fn(),
}));

describe("siweLoginTrace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStoredSiweLoginTraceState();
  });

  it("tags notification preferences siwe traces with the flow and siwe_login tags", () => {
    const trace = { id: "trace" };
    (startMiradorTrace as any).mockReturnValue(trace);

    expect(
      startFreshSiweLoginTrace({
        purpose: "notification_preferences",
        walletAddress: "0x1234567890123456789012345678901234567890",
        chainId: 1,
      })
    ).toBe(trace);

    expect(startMiradorTrace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "notification_preferences_siwe_login",
        flow: MIRADOR_FLOW.notificationPreferences,
        tags: ["notification_preferences", "siwe_login"],
        attributes: {
          "auth.kind": "siwe",
          "auth.purpose": "notification_preferences",
        },
      })
    );
  });

  it("persists delegate statement siwe traces with the correct flow tags", async () => {
    const trace = {
      id: "trace",
      getTraceId: vi.fn(() => "trace-123"),
    };
    (startMiradorTrace as any).mockReturnValue(trace);

    await prepareFreshSiweLoginTrace({
      purpose: "delegate_statement",
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
    });

    expect(startMiradorTrace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "delegate_statement_siwe_login",
        flow: MIRADOR_FLOW.delegateStatement,
        tags: ["delegate_statement", "siwe_login"],
      })
    );
  });

  it("resumes the stored siwe login trace when closing it", async () => {
    const trace = { id: "trace" };
    (startMiradorTrace as any).mockReturnValue(trace);

    setStoredSiweLoginTraceState({
      traceId: "trace-123",
      purpose: "delegate_statement",
      flow: MIRADOR_FLOW.delegateStatement,
      walletAddress: "0x1234567890123456789012345678901234567890",
      chainId: 1,
      startedAt: Date.now(),
    });

    await closeStoredSiweLoginTrace({
      eventName: "siwe_login_completed",
      reason: "siwe_login_completed",
    });

    expect(startMiradorTrace).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "delegate_statement_siwe_login",
        flow: MIRADOR_FLOW.delegateStatement,
        tags: ["delegate_statement", "siwe_login"],
      })
    );
    expect(addMiradorEvent).toHaveBeenCalledWith(
      trace,
      "siwe_login_completed",
      undefined
    );
    expect(flushMiradorTrace).toHaveBeenCalledWith(trace);
    expect(closeMiradorTrace).toHaveBeenCalledWith(
      trace,
      "siwe_login_completed"
    );
  });
});
