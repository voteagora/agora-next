import { TenantNamespace } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";

export default class TenantSlugFactory {
  public static create(namespace: TenantNamespace): string {
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
        return "OP";
      case TENANT_NAMESPACES.ENS:
        return "ENS";
      case TENANT_NAMESPACES.ETHERFI:
        return "EFI";
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
