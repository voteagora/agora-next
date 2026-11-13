import {
  AgoraGovernor_11__factory,
  AgoraTimelock__factory,
  Membership__factory,
  ProposalTypesConfiguratorScopes__factory,
} from "@/lib/contracts/generated";
import { TenantContract } from "@/lib/tenant/tenantContract";
import { TenantContracts } from "@/lib/types";
import { base, baseSepolia } from "viem/chains";
import { IGovernorContract } from "@/lib/contracts/common/interfaces/IGovernorContract";
import { BaseContract, JsonRpcProvider } from "ethers";
import { createTokenContract } from "@/lib/tokenUtils";
import { ITimelockContract } from "@/lib/contracts/common/interfaces/ITimelockContract";
import {
  DELEGATION_MODEL,
  GOVERNOR_TYPE,
  TIMELOCK_TYPE,
} from "@/lib/constants";
import { getRpcUrlForChain } from "@/lib/rpcConfig";

interface Props {
  isProd: boolean;
  rpcSecret: string;
}

export const civicTenantConfig = ({
  isProd,
  rpcSecret,
}: Props): TenantContracts => {
  const TOKEN = isProd
    ? "0x44b685edf24ff97fba0103ec7e365923a3b65f0b"
    : "0x2d0886464a7175a6d7b10aaa6942c49232bd8d1f";

  const GOVERNOR = isProd
    ? "0x01015e27514ba64e3f2e8655c7cd5be08d2f40cc"
    : "0x0000000000000000000000000000000000000000";

  const TIMELOCK = isProd
    ? "0x495177b4b20aa4f429445684bfabc3534b5a2db1"
    : "0x0000000000000000000000000000000000000000";

  const TYPES = isProd
    ? "0xfa5b3da3530d2353f0003e249b2c2aea8fcea534"
    : "0x0000000000000000000000000000000000000000";

  const APPROVAL_MODULE = isProd
    ? "0xaAD4A4f8a78449C811bd91fCE54f644e669277b5"
    : "0xaAD4A4f8a78449C811bd91fCE54f644e669277b5";

  const TREASURY = [TIMELOCK];
  const chain = isProd ? base : baseSepolia;
  const provider = new JsonRpcProvider(getRpcUrlForChain(chain.id, rpcSecret));

  return {
    token: createTokenContract({
      abi: Membership__factory.abi,
      address: TOKEN as `0x${string}`,
      chain,
      contract: Membership__factory.connect(TOKEN, provider),
      provider,
      type: "erc721",
    }),

    governor: new TenantContract<IGovernorContract>({
      abi: AgoraGovernor_11__factory.abi,
      address: GOVERNOR,
      chain,
      contract: AgoraGovernor_11__factory.connect(GOVERNOR, provider),
      provider,
    }),

    timelock: new TenantContract<ITimelockContract>({
      abi: AgoraTimelock__factory.abi,
      address: TIMELOCK,
      chain,
      contract: AgoraTimelock__factory.connect(TIMELOCK, provider),
      provider,
    }),

    proposalTypesConfigurator: new TenantContract<BaseContract>({
      abi: ProposalTypesConfiguratorScopes__factory.abi,
      address: TYPES,
      chain,
      contract: ProposalTypesConfiguratorScopes__factory.connect(
        TYPES,
        provider
      ),
      provider,
    }),

    treasury: TREASURY,
    governorApprovalModule: APPROVAL_MODULE,
    delegationModel: DELEGATION_MODEL.FULL,
    governorType: GOVERNOR_TYPE.AGORA,
    timelockType:
      TIMELOCK_TYPE.TIMELOCKCONTROLLER_WITH_ACCESS_CONTROL_ERC721_ERC115,
    supportScopes: true,
  };
};
