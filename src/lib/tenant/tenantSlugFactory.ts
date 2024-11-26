import { TenantNamespace } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { type DaoSlug } from "@prisma/client";

export default class TenantSlugFactory {
  public static create(namespace: TenantNamespace): DaoSlug {
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
        return "OP";
      case TENANT_NAMESPACES.ENS:
        return "ENS";
      case TENANT_NAMESPACES.ETHERFI:
        return "ETHERFI";
      case TENANT_NAMESPACES.UNISWAP:
        return "UNI";
      case TENANT_NAMESPACES.CYBER:
        return "CYBER";
      case TENANT_NAMESPACES.DERIVE:
        return "DERIVE";
      case TENANT_NAMESPACES.SCROLL:
        return "SCROLL";
      case TENANT_NAMESPACES.PGUILD:
        return "PGUILD";
      case TENANT_NAMESPACES.BOOST:
        return "BOOST";
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
