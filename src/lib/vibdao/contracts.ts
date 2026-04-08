import fs from 'node:fs';
import path from 'node:path';
import type { Abi } from 'viem';
import { env, getParsedPublicEnv } from './env';

type DeploymentFile = {
  chainId: number;
  rpcUrl: string;
  MockDOT: `0x${string}`;
  TreasuryVault: `0x${string}`;
  FellowshipPayroll: `0x${string}`;
  VibTimelock: `0x${string}`;
  VIBVotes: `0x${string}`;
  VibGovernor: `0x${string}`;
  DonationController: `0x${string}`;
};

type ArtifactFile = {
  abi: Abi;
};

export type ClientContracts = {
  chainId: number;
  rpcUrl: string;
  addresses: {
    dot: `0x${string}`;
    treasury: `0x${string}`;
    payroll: `0x${string}`;
    timelock: `0x${string}`;
    vibToken: `0x${string}`;
    governor: `0x${string}`;
    donationController: `0x${string}`;
  };
  abi: {
    dot: Abi;
    treasury: Abi;
    payroll: Abi;
    timelock: Abi;
    vibToken: Abi;
    governor: Abi;
    donationController: Abi;
  };
};

let cachedContracts: ClientContracts | null = null;

function readJsonFile<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function getContractsRoot(): string {
  return path.resolve(process.cwd(), env.VIBDAO_CONTRACTS_DIR);
}

export function getClientContracts(): ClientContracts {
  if (cachedContracts) return cachedContracts;

  const root = getContractsRoot();
  const publicEnv = getParsedPublicEnv();
  const deployment = readJsonFile<DeploymentFile>(path.join(root, 'deployments', 'local.json'));
  const loadAbi = (name: string) => readJsonFile<ArtifactFile>(path.join(root, 'abi', `${name}.json`)).abi;

  cachedContracts = {
    chainId: deployment.chainId ?? publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_ID,
    rpcUrl: publicEnv.NEXT_PUBLIC_VIBDAO_CHAIN_RPC_URL || deployment.rpcUrl,
    addresses: {
      dot: deployment.MockDOT,
      treasury: deployment.TreasuryVault,
      payroll: deployment.FellowshipPayroll,
      timelock: deployment.VibTimelock,
      vibToken: deployment.VIBVotes,
      governor: deployment.VibGovernor,
      donationController: deployment.DonationController,
    },
    abi: {
      dot: loadAbi('MockDOT'),
      treasury: loadAbi('TreasuryVault'),
      payroll: loadAbi('FellowshipPayroll'),
      timelock: loadAbi('VibTimelock'),
      vibToken: loadAbi('VIBVotes'),
      governor: loadAbi('VibGovernor'),
      donationController: loadAbi('DonationController'),
    },
  };

  return cachedContracts;
}
