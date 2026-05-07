import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AgoraAPI from "@/app/lib/agoraAPI";
import {
  MIRADOR_FLOW_HEADER,
  MIRADOR_TRACE_ID_HEADER,
} from "@/lib/mirador/constants";

describe("AgoraAPI.post", () => {
  const originalFetch = global.fetch;
  const originalApiKey = process.env.NEXT_PUBLIC_AGORA_API_KEY;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_AGORA_API_KEY = "test-api-key";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
      }))
    );
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.NEXT_PUBLIC_AGORA_API_KEY = originalApiKey;
  });

  it("preserves Mirador headers when extraHeaders is a Headers instance", async () => {
    const api = new AgoraAPI();
    const extraHeaders = new Headers({
      [MIRADOR_TRACE_ID_HEADER]: "trace-123",
      [MIRADOR_FLOW_HEADER]: "governance_vote",
      "x-test-header": "ok",
    });

    await api.post("/relay/vote", "v1", { ok: true }, extraHeaders);

    const [, requestInit] = (global.fetch as any).mock.calls[0];
    expect(requestInit.headers).toBeInstanceOf(Headers);
    expect(requestInit.headers.get(MIRADOR_TRACE_ID_HEADER)).toBe("trace-123");
    expect(requestInit.headers.get(MIRADOR_FLOW_HEADER)).toBe(
      "governance_vote"
    );
    expect(requestInit.headers.get("x-test-header")).toBe("ok");
    expect(requestInit.headers.get("authorization")).toBe(
      "Bearer test-api-key"
    );
    expect(requestInit.headers.get("Content-Type")).toBe("application/json");
  });
});
