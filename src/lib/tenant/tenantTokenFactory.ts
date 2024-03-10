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
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
