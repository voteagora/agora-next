import {
  AgoraGovernor__factory,
  AgoraTimelock__factory,
  AgoraToken__factory,
  ProposalTypesConfigurator__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { scroll } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { FallbackProvider, JsonRpcProvider, BaseContract } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";

interface Props {
  isProd: boolean;
  alchemyId: string;
}

export const scrollTenantContractConfig = ({
  isProd,
  alchemyId,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0xd29687c813D741E2F938F4aC377128810E217b1b"
    : "0xBa61Bf34b51aD4710a784dc5B675df67817FCDa6";

  const GOVERNOR = isProd
    ? "0x2f3F2054776bd3C2fc30d750734A8F539Bb214f0"
    : "0x9394E163ce253f29086A4A2733BcfC0ca28fFc6c";

  const TREASURY = isProd
    ? ["0x79D83D1518e2eAA64cdc0631df01b06e2762CC14"]
    : ["0xE27B7b6DB440b27249b49E3C0A686B82c36A0D7e"];

  const TYPES = isProd
    ? "0xfDa7cF1D9C51b3fab41E2e4093374DD8715D640E"
    : "0x011EE4D990219F5ee8718005fc3484890E170042";

  const TIMELOCK = isProd
    ? "0x79D83D1518e2eAA64cdc0631df01b06e2762CC14"
    : "0xE27B7b6DB440b27249b49E3C0A686B82c36A0D7e";

  const provider = new FallbackProvider([
    {
      provider: new JsonRpcProvider(
        `https://scroll-mainnet.g.alchemy.com/v2/${alchemyId}`
      ),
      priority: 1,
      stallTimeout: 10,
      weight: 1,
    },
    {
      provider: new JsonRpcProvider(`https://rpc.scroll.io/`),
      priority: 2,
      stallTimeout: 10,
      weight: 1,
    },
  ]);

  return {
    token: createTokenContract({
      abi: AgoraToken__factory.abi,
      address: TOKEN as `0x${string}`,
      chain: scroll,
      contract: AgoraToken__factory.connect(TOKEN, provider),
      provider,
      type: "erc20",
      votesInterface: "IVotesPartialDelegation",
    }),

    // PLACEHOLDER CONTRACT
    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor__factory.abi,
      address: GOVERNOR,
      chain: scroll,
      contract: AgoraGovernor__factory.connect(GOVERNOR, provider),
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfigurator__factory.abi,
      address: TYPES,
      chain: scroll,
      contract: ProposalTypesConfigurator__factory.connect(TYPES, provider),
      provider,
    }),

    timelock: new TenantContract<IGovernorContract>({
      abi: AgoraTimelock__factory.abi,
      address: TIMELOCK,
      chain: scroll,
      contract: AgoraTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    treasury: TREASURY,
  };
};
