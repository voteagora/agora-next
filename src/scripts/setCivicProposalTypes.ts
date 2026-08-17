#!/usr/bin/env tsx

/**
 * Creates Civic proposal types on-chain (the same writes /admin would send).
 * Only governor admin 0xDF35c8eC... can succeed.
 *
 * Dry-run (simulate):
 *   CIVIC_GOV_ADMIN_PK=0x... npm run civic:set-proposal-types
 *
 * Broadcast:
 *   CIVIC_GOV_ADMIN_PK=0x... npm run civic:set-proposal-types -- --broadcast
 *
 * Optional: BASE_RPC_URL=https://mainnet.base.org
 */
import { config as loadEnv } from "dotenv";
loadEnv();

import {
  createPublicClient,
  createWalletClient,
  getAddress,
  http,
  parseAbi,
  type Address,
  type Hex,
  zeroAddress,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

import { getRpcUrlForChain } from "@/lib/rpcConfig";

const GOVERNOR = "0x01015e27514ba64e3f2e8655c7cd5be08d2f40cc" as Address;
const PROPOSAL_TYPES_CONFIGURATOR =
  "0xfa5b3da3530d2353f0003e249b2c2aea8fcea534" as Address;
const GOV_ADMIN = "0xDF35c8eC563e643EC7e37C7d66b881bdc77DaCBc" as Address;
const APPROVAL_VOTING_MODULE =
  "0xaAD4A4f8a78449C811bd91fCE54f644e669277b5" as Address;
const OPTIMISTIC_MODULE =
  "0x559b7c8C9474b3A100B7759dAe5482b9510962dd" as Address;

const governorAbi = parseAbi([
  "function admin() view returns (address)",
  "function setModuleApproval(address module, bool approved)",
]);

const ptcAbi = parseAbi([
  "function setProposalType(uint8 proposalTypeId, uint16 quorum, uint16 approvalThreshold, string name, string description, address module)",
]);

// PTC stores percent * 100 (10000 = 100%). Civic asked for:
// 0% / 51%, 25% / 51%, 51% / 66% on basic types, plus approval + optimistic modules.
const PROPOSAL_TYPES = [
  {
    id: 0,
    quorum: 0,
    approvalThreshold: 5100,
    name: "No Quorum",
    description: "Basic proposal with no quorum and 51% approval",
    module: zeroAddress,
  },
  {
    id: 1,
    quorum: 2500,
    approvalThreshold: 5100,
    name: "Requires Quorum",
    description: "Basic proposal with 25% quorum and 51% approval",
    module: zeroAddress,
  },
  {
    id: 2,
    quorum: 5100,
    approvalThreshold: 6600,
    name: "Supermajority",
    description: "Basic proposal with 51% quorum and 66% approval",
    module: zeroAddress,
  },
  {
    id: 3,
    quorum: 0,
    approvalThreshold: 0,
    name: "Optimistic",
    description: "Optimistic Module",
    module: OPTIMISTIC_MODULE,
  },
  {
    id: 4,
    quorum: 2500,
    approvalThreshold: 5100,
    name: "Approval Voting",
    description: "Approval Voting Module",
    module: APPROVAL_VOTING_MODULE,
  },
] as const;

function rpcUrl(): string {
  if (process.env.BASE_RPC_URL) {
    return process.env.BASE_RPC_URL;
  }
  return getRpcUrlForChain(base.id);
}

function adminKey(): Hex {
  const key = process.env.CIVIC_GOV_ADMIN_PK;
  if (!key) {
    throw new Error("CIVIC_GOV_ADMIN_PK is required");
  }
  return (key.startsWith("0x") ? key : `0x${key}`) as Hex;
}

async function main() {
  const broadcast = process.argv.includes("--broadcast");
  const account = privateKeyToAccount(adminKey());
  const sender = getAddress(account.address);

  if (sender !== getAddress(GOV_ADMIN)) {
    throw new Error(
      `Wrong signer ${sender}. /admin only accepts governor admin ${GOV_ADMIN}.`
    );
  }

  const transport = http(rpcUrl());
  const publicClient = createPublicClient({ chain: base, transport });
  const walletClient = createWalletClient({
    account,
    chain: base,
    transport,
  });

  const onchainAdmin = getAddress(
    await publicClient.readContract({
      address: GOVERNOR,
      abi: governorAbi,
      functionName: "admin",
    })
  );
  if (onchainAdmin !== sender) {
    throw new Error(
      `Governor admin is ${onchainAdmin}, not the connected wallet ${sender}.`
    );
  }

  const calls = [
    {
      label: "approve ApprovalVotingModule",
      address: GOVERNOR,
      abi: governorAbi,
      functionName: "setModuleApproval" as const,
      args: [APPROVAL_VOTING_MODULE, true] as const,
    },
    {
      label: "approve OptimisticModule",
      address: GOVERNOR,
      abi: governorAbi,
      functionName: "setModuleApproval" as const,
      args: [OPTIMISTIC_MODULE, true] as const,
    },
    ...PROPOSAL_TYPES.map((type) => ({
      label: `setProposalType ${type.id} ${type.name}`,
      address: PROPOSAL_TYPES_CONFIGURATOR,
      abi: ptcAbi,
      functionName: "setProposalType" as const,
      args: [
        type.id,
        type.quorum,
        type.approvalThreshold,
        type.name,
        type.description,
        type.module,
      ] as const,
    })),
  ];

  console.log(broadcast ? "Broadcasting Civic proposal types" : "Dry-run");
  console.log("Signer:", sender);
  console.log("Governor:", GOVERNOR);
  console.log("ProposalTypesConfigurator:", PROPOSAL_TYPES_CONFIGURATOR);

  for (const call of calls) {
    const { request } = await publicClient.simulateContract({
      account,
      address: call.address,
      abi: call.abi,
      functionName: call.functionName,
      args: call.args,
    });

    if (!broadcast) {
      console.log(`ok  ${call.label}`);
      continue;
    }

    const hash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    if (receipt.status !== "success") {
      throw new Error(`${call.label} reverted (${hash})`);
    }
    console.log(`tx  ${call.label} ${hash}`);
  }

  if (!broadcast) {
    console.log("Simulations succeeded. Re-run with --broadcast to send txs.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
