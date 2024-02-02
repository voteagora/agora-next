import { getAuthorityChainsForNamespace } from "../common/authority-chains/getAuthorityChains";

export const getAuthorityChains = ({
  address,
  blockNumber,
}: {
  address: string;
  blockNumber: number;
}) =>
  getAuthorityChainsForNamespace({
    address,
    blockNumber,
    namespace: "optimism",
  });
