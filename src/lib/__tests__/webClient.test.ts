import { beforeEach, describe, expect, it, vi } from "vitest";

const { clientCtorMock, web3PluginMock } = vi.hoisted(() => ({
  clientCtorMock: vi
    .fn()
    .mockImplementation((apiKey: string, options?: unknown) => ({
      apiKey,
      options,
    })),
  web3PluginMock: vi.fn(() => ({ name: "web3" })),
}));

vi.mock("@miradorlabs/web-sdk/dist/index.esm.js", () => ({
  Client: clientCtorMock,
  Web3Plugin: web3PluginMock,
}));

import {
  configureMiradorWebClient,
  getMiradorWebClient,
} from "@/lib/mirador/webClient";

describe("webClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    configureMiradorWebClient({ enabled: false });
  });

  it("does not initialize a web client unless tracing is enabled", () => {
    configureMiradorWebClient({
      apiKey: "web-key",
      enabled: false,
    });

    expect(clientCtorMock).not.toHaveBeenCalled();
    expect(getMiradorWebClient()).toBeNull();
  });

  it("initializes a web client with Web3Plugin when tracing is enabled", () => {
    configureMiradorWebClient({
      apiKey: "web-key",
      enabled: true,
    });

    expect(clientCtorMock).toHaveBeenCalledWith(
      "web-key",
      expect.objectContaining({
        plugins: expect.arrayContaining([
          expect.objectContaining({ name: "web3" }),
        ]),
        callbacks: expect.objectContaining({
          onFlushError: expect.any(Function),
          onDropped: expect.any(Function),
        }),
      })
    );
    expect(getMiradorWebClient()).not.toBeNull();
  });
});
