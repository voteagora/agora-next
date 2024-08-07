import {
  EtherfiToken__factory,
  OptimismGovernor__factory,
} from "@/lib/contracts/generated";
import { ITokenContract } from "@/lib/contracts/common/interfaces/ITokenContract";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { scroll } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { JsonRpcProvider } from "ethers";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const scrollTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  // other contracts (testnet)
  // 0xE27B7b6DB440b27249b49E3C0A686B82c36A0D7e -- timelock
  // 0x011EE4D990219F5ee8718005fc3484890E170042 -- proposal types
  // 0x2e0C197f1fca7628ADfa2bdaabd1df4670186C06 -- proxy admin

  const TOKEN = isProd ? "0x0" : "0xBa61Bf34b51aD4710a784dc5B675df67817FCDa6";
  const GOVERNOR = isProd
    ? "0x0"
    : "0x9394E163ce253f29086A4A2733BcfC0ca28fFc6c";

  const provider = new JsonRpcProvider(
    `https://scroll-mainnet.g.alchemy.com/v2/${alchemyId}`
  );
  const chain = scroll;

  return {
    token: new TenantContract<ITokenContract>({
      abi: EtherfiToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: EtherfiToken__factory.connect(TOKEN, provider),
      provider,
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: OptimismGovernor__factory.abi,
      address: GOVERNOR,
      chain,
      contract: OptimismGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),
  };
};
