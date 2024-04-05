import { EtherfiToken__factory } from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { ethProvider } from "@/app/lib/provider";
import { mainnet } from "viem/chains";

export const etherfiTenantContractConfig = (
  isProd: boolean
): TenantContracts => {
  const TOKEN = "0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB";

  return {
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: mainnet,
      contract: EtherfiToken__factory.connect(TOKEN, ethProvider),
    }),
  };
};
