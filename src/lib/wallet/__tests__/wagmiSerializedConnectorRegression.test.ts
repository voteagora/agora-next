import {
  connect,
  createConfig,
  createConnector,
  createStorage,
  http,
  writeContract,
} from "@wagmi/core";
import { mainnet } from "wagmi/chains";
import { describe, expect, it } from "vitest";

const account = "0x0000000000000000000000000000000000000002";
const contractAddress = "0x0000000000000000000000000000000000000001";

const governorAbi = [
  {
    type: "function",
    name: "castVote",
    stateMutability: "nonpayable",
    inputs: [
      { name: "proposalId", type: "uint256" },
      { name: "support", type: "uint8" },
    ],
    outputs: [],
  },
] as const;

function createMemoryStorage() {
  const values = new Map<string, string>();

  return createStorage({
    storage: {
      getItem: (key) => values.get(key),
      removeItem: (key) => {
        values.delete(key);
      },
      setItem: (key, value) => {
        values.set(key, value);
      },
    },
  });
}

function createTestConnector() {
  return createConnector(() => ({
    id: "injected",
    name: "MetaMask",
    type: "injected",
    async connect({ withCapabilities } = {}) {
      return {
        accounts: (withCapabilities
          ? [{ address: account, capabilities: {} }]
          : [account]) as never,
        chainId: mainnet.id,
      };
    },
    async disconnect() {},
    async getAccounts() {
      return [account];
    },
    async getChainId() {
      return mainnet.id;
    },
    async getProvider() {
      return {
        request: async () => null,
      };
    },
    async isAuthorized() {
      return true;
    },
    onAccountsChanged() {},
    onChainChanged() {},
    onDisconnect() {},
  }));
}

function createTestConfig(storage: ReturnType<typeof createMemoryStorage>) {
  return createConfig({
    chains: [mainnet],
    connectors: [createTestConnector()],
    ssr: true,
    storage,
    transports: {
      [mainnet.id]: http(),
    },
  });
}

// Guards against a Wagmi bug where persisted connector shells lack live methods.
// If Wagmi fixes this upstream, remove the readiness check and this test together.
describe("Wagmi persisted connector regression", () => {
  it("throws the getChainId TypeError when a persisted connector shell is used for a write", async () => {
    const storage = createMemoryStorage();
    const firstConfig = createTestConfig(storage);

    await connect(firstConfig, {
      connector: firstConfig.connectors[0],
    });
    await new Promise((resolve) => setTimeout(resolve, 0));

    const persistedState = (await storage.getItem("store" as never)) as any;
    const persistedConnection = persistedState.state.connections.get(
      persistedState.state.current
    );
    expect(persistedConnection.connector.getChainId).toBeUndefined();

    const reloadedConfig = createTestConfig(storage);
    reloadedConfig.setState({
      ...persistedState.state,
      status: "reconnecting",
    });

    await expect(
      writeContract(reloadedConfig, {
        address: contractAddress,
        abi: governorAbi,
        functionName: "castVote",
        args: [96n, 1],
        chainId: mainnet.id,
      })
    ).rejects.toThrow("connection.connector.getChainId is not a function");
  });
});
