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

export default class TenantContractFactory {
  public static create(
    namespace: TenantNamespace,
    isMain: boolean,
    alchemyId: string
  ): TenantContracts {
    switch (namespace) {
      case TENANT_NAMESPACES.ETHERFI:
        return etherfiTenantContractConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.ENS:
        return ensTenantContractConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.OPTIMISM:
        return optimismTenantContractConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.UNISWAP:
        return uniswapTenantContractConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.CYBER:
        return cyberTenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.DERIVE:
        return deriveTenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.SCROLL:
        return scrollTenantContractConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.PGUILD:
        return protocolGuildTenantContractConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.BOOST:
        return boostTenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.XAI:
        return xaiTenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.B3:
        return b3TenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.DEMO:
        return demoTenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.LINEA:
        return lineaTenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.TOWNS:
        return townsTenantConfig({ isMain, alchemyId });
      case TENANT_NAMESPACES.SYNDICATE:
        return syndicateTenantConfig({ isMain, alchemyId });

      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
