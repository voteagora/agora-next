import { afterEach, describe, expect, it } from "vitest";
import type { EIP1193Provider } from "viem";
import { getActiveWindowEthereumProvider } from "../activeInjectedProvider";

function provider(): EIP1193Provider {
  return {
    on: () => {},
    removeListener: () => {},
    request: (async () => null) as EIP1193Provider["request"],
  };
}

function setWindowEthereum(ethereum: unknown) {
  Object.defineProperty(window, "ethereum", {
    configurable: true,
    value: ethereum,
  });
}

describe("getActiveWindowEthereumProvider", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "ethereum");
  });

  it("returns null without window.ethereum", async () => {
    await expect(
      getActiveWindowEthereumProvider({
        getProvider: async () => provider(),
      })
    ).resolves.toBeNull();
  });

  it("returns window.ethereum when the active connector provider matches it", async () => {
    const ethereum = provider();
    setWindowEthereum(ethereum);

    await expect(
      getActiveWindowEthereumProvider({
        getProvider: async () => ethereum,
      })
    ).resolves.toBe(ethereum);
  });

  it("returns the matching provider from window.ethereum.providers", async () => {
    const activeProvider = provider();
    setWindowEthereum({
      on: () => {},
      removeListener: () => {},
      request: (async () => null) as EIP1193Provider["request"],
      providers: [provider(), activeProvider],
    });

    await expect(
      getActiveWindowEthereumProvider({
        getProvider: async () => activeProvider,
      })
    ).resolves.toBe(activeProvider);
  });

  it("returns null for a non-window embedded provider", async () => {
    setWindowEthereum(provider());

    await expect(
      getActiveWindowEthereumProvider({
        getProvider: async () => provider(),
      })
    ).resolves.toBeNull();
  });

  it("returns null when connector provider lookup fails", async () => {
    setWindowEthereum(provider());

    await expect(
      getActiveWindowEthereumProvider({
        getProvider: async () => {
          throw new Error("provider unavailable");
        },
      })
    ).resolves.toBeNull();
  });
});
