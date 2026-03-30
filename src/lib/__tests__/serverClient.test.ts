import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { clientCtorMock, web3PluginMock } = vi.hoisted(() => ({
  clientCtorMock: vi
    .fn()
    .mockImplementation((apiKey: string, options?: unknown) => ({
      apiKey,
      options,
    })),
  web3PluginMock: vi.fn(() => ({ name: "web3" })),
}));

vi.mock("server-only", () => ({}));

vi.mock("@miradorlabs/nodejs-sdk", () => ({
  Client: clientCtorMock,
  Web3Plugin: web3PluginMock,
}));

describe("serverClient", () => {
  const originalMiradorEnabled = process.env.NEXT_PUBLIC_MIRADOR_ENABLED;
  const originalServerApiKey = process.env.MIRADOR_SERVER_API_KEY;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = originalMiradorEnabled;
    process.env.MIRADOR_SERVER_API_KEY = originalServerApiKey;
  });

  it("returns null when Mirador is globally disabled", async () => {
    process.env.NEXT_PUBLIC_MIRADOR_ENABLED = "false";
    process.env.MIRADOR_SERVER_API_KEY = "server-key";

    const { getMiradorServerClient } = await import(
      "@/lib/mirador/serverClient"
    );

    expect(getMiradorServerClient()).toBeNull();
    expect(clientCtorMock).not.toHaveBeenCalled();
  });

  it("creates a server client with Web3Plugin when Mirador is not disabled", async () => {
    delete process.env.NEXT_PUBLIC_MIRADOR_ENABLED;
    process.env.MIRADOR_SERVER_API_KEY = "server-key";

    const { getMiradorServerClient } = await import(
      "@/lib/mirador/serverClient"
    );

    expect(getMiradorServerClient()).toEqual(
      expect.objectContaining({ apiKey: "server-key" })
    );
    expect(clientCtorMock).toHaveBeenCalledWith(
      "server-key",
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
  });
});
