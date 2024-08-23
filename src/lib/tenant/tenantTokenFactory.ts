import { type TenantNamespace, type TenantToken } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default class TenantTokenFactory {
  public static create(namespace: TenantNamespace): TenantToken {
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
        return {
          name: "Optimism",
          symbol: "OP",
          decimals: 18,
        };
      case TENANT_NAMESPACES.ENS:
        return {
          name: "ENS",
          symbol: "ENS",
          decimals: 18,
        };

      case TENANT_NAMESPACES.ETHERFI:
        return {
          name: "Ether.fi",
          symbol: "ETHFI",
          decimals: 18,
        };

      case TENANT_NAMESPACES.UNISWAP:
        return {
          name: "Uniswap",
          symbol: "UNI",
          decimals: 18,
        };

      case TENANT_NAMESPACES.CYBER:
        return {
          name: "Cyber",
          symbol: "cCYBER",
          decimals: 18,
        };
      case TENANT_NAMESPACES.SCROLL:
        return {
          name: "Scroll",
          symbol: "SCROLL",
          decimals: 18,
        };
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
