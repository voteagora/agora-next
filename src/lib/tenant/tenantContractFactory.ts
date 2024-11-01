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
      case TENANT_NAMESPACES.PROTOCOL_GUILD:
        return protocolGuildTenantContractConfig({ isProd, alchemyId });
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
