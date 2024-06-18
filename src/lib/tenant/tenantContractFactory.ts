import { TENANT_NAMESPACES } from "@/lib/constants";
import { TenantContracts, type TenantNamespace } from "@/lib/types";
import { ensTenantContractConfig } from "@/lib/tenant/configs/contracts/ens";
import { etherfiTenantContractConfig } from "@/lib/tenant/configs/contracts/etherfi";
import { optimismTenantContractConfig } from "@/lib/tenant/configs/contracts/optimism";
import { uniswapTenantContractConfig } from "@/lib/tenant/configs/contracts/uniswap";

export default class TenantContractFactory {
  public static create(
    namespace: TenantNamespace,
    isProd: boolean
  ): TenantContracts {
    switch (namespace) {
      case TENANT_NAMESPACES.ETHERFI:
        return etherfiTenantContractConfig(isProd);
      case TENANT_NAMESPACES.ENS:
        return ensTenantContractConfig(isProd);
      case TENANT_NAMESPACES.OPTIMISM:
        return optimismTenantContractConfig(isProd);
      case TENANT_NAMESPACES.UNISWAP:
        return uniswapTenantContractConfig(isProd);
      default:
        throw new Error(`Invalid namespace: ${namespace}`);
    }
  }
}
