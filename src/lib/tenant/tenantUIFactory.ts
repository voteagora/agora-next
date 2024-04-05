import { TenantNamespace } from "@/lib/types";

import { TENANT_NAMESPACES } from "@/lib/constants";
import { uniswapTenantUIConfig } from "@/lib/tenant/configs/uniswap";
import { etherfiTenantUIConfig } from "@/lib/tenant/configs/etherfi";
import { ensTenantUIConfig } from "@/lib/tenant/configs/ens";
import { optimismTenantUIConfig } from "@/lib/tenant/configs/optimism";

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
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
