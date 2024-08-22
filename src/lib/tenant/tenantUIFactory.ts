import { TenantNamespace } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { uniswapTenantUIConfig } from "@/lib/tenant/configs/ui/uniswap";
import { etherfiTenantUIConfig } from "@/lib/tenant/configs/ui/etherfi";
import { ensTenantUIConfig } from "@/lib/tenant/configs/ui/ens";
import { optimismTenantUIConfig } from "@/lib/tenant/configs/ui/optimism";
import { cyberTenantUIConfig } from "@/lib/tenant/configs/ui/cyber";
import { newdaoTenantUIConfig } from "@/lib/tenant/configs/ui/newdao";

export default class TenantUIFactory {
  public static create(namespace: TenantNamespace): any {
    switch (namespace) {
      case TENANT_NAMESPACES.OPTIMISM:
        return optimismTenantUIConfig;

      case TENANT_NAMESPACES.ETHERFI:
        return etherfiTenantUIConfig;

      case TENANT_NAMESPACES.ENS:
        return ensTenantUIConfig;

      case TENANT_NAMESPACES.UNISWAP:
        return uniswapTenantUIConfig;

      case TENANT_NAMESPACES.CYBER:
        return cyberTenantUIConfig;

      case TENANT_NAMESPACES.NEW_DAO:
        return newdaoTenantUIConfig;

      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
