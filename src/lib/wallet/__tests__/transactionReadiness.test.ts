import { describe, expect, it } from "vitest";

import { getWalletTransactionReadinessError } from "../transactionReadiness";

describe("getWalletTransactionReadinessError", () => {
  it("blocks transactions while the wallet is reconnecting", () => {
    const error = getWalletTransactionReadinessError({
      connector: {
        getAccounts: async () => [],
        getChainId: async () => 1,
      },
      status: "reconnecting",
    });

    expect(error?.message).toContain("still reconnecting");
  });

  it("blocks serialized connector shells without live methods", () => {
    const error = getWalletTransactionReadinessError({
      connector: {},
      status: "connected",
    });

    expect(error?.message).toContain("still initializing");
  });

  it("allows connected wallets with live connector methods", () => {
    const error = getWalletTransactionReadinessError({
      connector: {
        getAccounts: async () => ["0x0000000000000000000000000000000000000000"],
        getChainId: async () => 1,
      },
      status: "connected",
    });

    expect(error).toBeNull();
  });
});
