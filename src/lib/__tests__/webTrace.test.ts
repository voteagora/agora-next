import { describe, expect, it, vi } from "vitest";

import { addMiradorSafeTxHint, closeMiradorTrace } from "@/lib/mirador/webTrace";

describe("webTrace", () => {
  it("adds a Safe tx hint when the trace supports it", () => {
    const trace = {
      addSafeTxHint: vi.fn(),
    };

    addMiradorSafeTxHint(
      trace as any,
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "ethereum",
      "draft_publish"
    );

    expect(trace.addSafeTxHint).toHaveBeenCalledWith(
      "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      "ethereum",
      "draft_publish"
    );
  });

  it("disables keepalive and waits for the pending flush queue before closing", async () => {
    let resolveFlush: (() => void) | undefined;
    const flushQueue = new Promise<void>((resolve) => {
      resolveFlush = resolve;
    });
    const stopKeepAlive = vi.fn();
    const close = vi.fn(async () => {});
    const trace = {
      getTraceId: vi.fn(() => "trace-123"),
      autoKeepAlive: true,
      flushQueue,
      stopKeepAlive,
      close,
    };

    const closePromise = closeMiradorTrace(trace as any, "done");

    expect(trace.autoKeepAlive).toBe(false);
    expect(stopKeepAlive).toHaveBeenCalledTimes(1);
    expect(close).not.toHaveBeenCalled();

    resolveFlush?.();
    await closePromise;

    expect(close).toHaveBeenCalledWith("done");
  });
});
