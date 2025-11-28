import { TENANT_NAMESPACES } from "@/lib/constants";
import { TenantContracts, type TenantNamespace } from "@/lib/types";
import { ensTenantContractConfig } from "@/lib/tenant/configs/contracts/ens";
import { etherfiTenantContractConfig } from "@/lib/tenant/configs/contracts/etherfi";
import { optimismTenantContractConfig } from "@/lib/tenant/configs/contracts/optimism";
import { uniswapTenantContractConfig } from "@/lib/tenant/configs/contracts/uniswap";
import { cyberTenantConfig } from "@/lib/tenant/configs/contracts/cyber";
import { deriveTenantConfig } from "@/lib/tenant/configs/contracts/derive";
import { scrollTenantContractConfig } from "@/lib/tenant/configs/contracts/scroll";
import { protocolGuildTenantContractConfig } from "./configs/contracts/protocol-guild";
import { boostTenantConfig } from "./configs/contracts/boost";
import { xaiTenantConfig } from "./configs/contracts/xai";
import { b3TenantConfig } from "./configs/contracts/b3";
import { demoTenantConfig } from "./configs/contracts/demo";
import { lineaTenantConfig } from "./configs/contracts/linea";
import { townsTenantConfig } from "./configs/contracts/towns";
import { syndicateTenantConfig } from "./configs/contracts/syndicate";
import { demo2TenantConfig } from "./configs/contracts/demo2";

export default class TenantContractFactory {
  public static create(
    namespace: TenantNamespace,
    isProd: boolean,
    alchemyId: string
  ): TenantContracts {
    switch (namespace) {
      case TENANT_NAMESPACES.ETHERFI:
        return etherfiTenantContractConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.ENS:
        return ensTenantContractConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.OPTIMISM:
        return optimismTenantContractConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.UNISWAP:
        return uniswapTenantContractConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.CYBER:
        return cyberTenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.DERIVE:
        return deriveTenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.SCROLL:
        return scrollTenantContractConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.PGUILD:
        return protocolGuildTenantContractConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.BOOST:
        return boostTenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.XAI:
        return xaiTenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.B3:
        return b3TenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.DEMO:
        return demoTenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.LINEA:
        return lineaTenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.TOWNS:
        return townsTenantConfig({ isProd, alchemyId });
      case TENANT_NAMESPACES.SYNDICATE:
        return syndicateTenantConfig({ isProd, alchemyId });

            case TENANT_NAMESPACES.DEMO2:
        return demo2TenantConfig({ isProd, alchemyId });

      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
