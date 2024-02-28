import { type TenantNamespace, type TenantToken } from "@/lib/types";

export default class TenantTokenFactory {
  public static create(namespace:TenantNamespace): TenantToken {
    switch (namespace) {
      case "optimism":
        return {
          name: "Optimism",
          symbol: "OP",
          decimals: 18
        };

      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}