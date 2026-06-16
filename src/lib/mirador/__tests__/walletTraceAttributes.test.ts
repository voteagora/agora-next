import { describe, expect, it } from "vitest";

import { getWalletTraceAttributes } from "../walletTraceAttributes";

describe("getWalletTraceAttributes", () => {
  it("captures Wagmi account and connector diagnostics", () => {
    const attributes = getWalletTraceAttributes({
      accountChainId: 1,
      accountStatus: "reconnecting",
      connector: {
        id: "injected",
        name: "MetaMask",
        type: "injected",
        uid: "persisted-connector",
      },
      targetChainId: 1,
    });

    expect(attributes).toMatchObject({
      "wallet.accountStatus": "reconnecting",
      "wallet.connectedChainId": 1,
      "wallet.targetChainId": 1,
      "wallet.connector.id": "injected",
      "wallet.connector.name": "MetaMask",
      "wallet.connector.type": "injected",
      "wallet.connector.uid": "persisted-connector",
      "wallet.connector.hasGetAccounts": false,
      "wallet.connector.hasGetChainId": false,
      "wallet.connector.hasGetProvider": false,
      "wallet.connector.hasLiveMethods": false,
    });
  });

  it("marks live connectors as having the methods Wagmi writes need", () => {
    const attributes = getWalletTraceAttributes({
      accountStatus: "connected",
      connector: {
        getAccounts: async () => [],
        getChainId: async () => 1,
        getProvider: async () => ({}),
      },
    });

    expect(attributes).toMatchObject({
      "wallet.connector.hasGetAccounts": true,
      "wallet.connector.hasGetChainId": true,
      "wallet.connector.hasGetProvider": true,
      "wallet.connector.hasLiveMethods": true,
    });
  });
});
