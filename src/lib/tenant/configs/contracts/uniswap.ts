import { EtherfiToken__factory } from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { ethProvider } from "@/app/lib/provider";
import { mainnet } from "viem/chains";

export const uniswapTenantContractConfig = (
  isProd: boolean
): TenantContracts => {
  const TOKEN = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

  return {
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: mainnet,
      contract: EtherfiToken__factory.connect(TOKEN, ethProvider),
    }),
  };
};
