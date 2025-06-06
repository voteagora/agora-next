import { TenantNamespace } from "@/lib/types";
import { TENANT_NAMESPACES } from "@/lib/constants";
import { uniswapTenantUIConfig } from "@/lib/tenant/configs/ui/uniswap";
import { etherfiTenantUIConfig } from "@/lib/tenant/configs/ui/etherfi";
import { ensTenantUIConfig } from "@/lib/tenant/configs/ui/ens";
import { optimismTenantUIConfig } from "@/lib/tenant/configs/ui/optimism";
import { cyberTenantUIConfig } from "@/lib/tenant/configs/ui/cyber";
import { deriveTenantUIConfig } from "@/lib/tenant/configs/ui/derive";
import { scrollTenantUIConfig } from "@/lib/tenant/configs/ui/scroll";
import { protocolGuildTenantUIConfig } from "@/lib/tenant/configs/ui/protocol-guild";
import { boostTenantUIConfig } from "@/lib/tenant/configs/ui/boost";
import { xaiTenantUIConfig } from "@/lib/tenant/configs/ui/xai";
import { b3TenantUIConfig } from "@/lib/tenant/configs/ui/b3";
import { demoTenantUIConfig } from "@/lib/tenant/configs/ui/demo";
import { lineaTenantUIConfig } from "@/lib/tenant/configs/ui/linea";

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

      case TENANT_NAMESPACES.DERIVE:
        return deriveTenantUIConfig;

      case TENANT_NAMESPACES.SCROLL:
        return scrollTenantUIConfig;

      case TENANT_NAMESPACES.PGUILD:
        return protocolGuildTenantUIConfig;

      case TENANT_NAMESPACES.BOOST:
        return boostTenantUIConfig;

      case TENANT_NAMESPACES.XAI:
        return xaiTenantUIConfig;

      case TENANT_NAMESPACES.B3:
        return b3TenantUIConfig;

      case TENANT_NAMESPACES.DEMO:
        return demoTenantUIConfig;

      case TENANT_NAMESPACES.LINEA:
        return lineaTenantUIConfig;
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
