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

export const cyberTenantConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd ? " " : "0x8dfC3B23EE4ca0b8C4af1e4EC7F72D2efbAB70E3";
  const GOVERNOR = isProd
    ? "0x176A107b77B09973d9fBE6AE2643D0bB6c4B3A7D"
    : "0x741005a136766e6e03ed8a7cc32d6a91241e5bf5";

  const provider = new JsonRpcProvider(
    isProd
      ? "https://cyber.alt.technology"
      : "https://cyber-testnet.alt.technology/"
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

    governor: new TenantContract<IGovernorContract>({
      abi: [],
      address: GOVERNOR,
      chain,
      contract: OptimismGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),
  };
};
