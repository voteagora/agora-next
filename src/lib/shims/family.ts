/*
 * SSR shim for the `family` package (ConnectKit dependency).
 *
 * The real package reads `window` at module evaluation time, which crashes
 * Node SSR even when `enableFamily: false`. ConnectKit still top-level-imports
 * `familyAccountsConnector`, so we provide a no-op connector factory for SSR.
 */

import type { CreateConnectorFn } from "wagmi";

export function familyAccountsConnector(
  _options?: unknown
): CreateConnectorFn {
  return () =>
    ({
      id: "familyAccountsProvider",
      name: "Family",
      type: "familyAccountsProvider",
      connect: async () => ({ accounts: [], chainId: 1 }),
      disconnect: async () => {},
      getAccounts: async () => [],
      getChainId: async () => 1,
      isAuthorized: async () => false,
    }) as never;
}

familyAccountsConnector.version = "0.0.0-shim";
