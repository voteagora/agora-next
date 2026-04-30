"use server";

import { unstable_cache } from "next/cache";

import { Proposal } from "@/app/api/common/proposals/proposal";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";

import Tenant from "../tenant/tenant";
import ALL_CHECKS from "./checks";
import { handleCrossChainSimulations } from "./cross-chain/tenderly-execution-engine";
import { generateAndSaveReports } from "./report";
import { simulateNew, simulateNewApproval, simulateProposed } from "./simulate";
import {
  AllCheckResults,
  ApprovalProposalOption,
  ApprovalProposalSettings,
  SimulationConfigNew,
  SimulationConfigNewApproval,
  SimulationConfigProposed,
  SimulationResult,
} from "./types";

const ONE_HOUR_IN_SECONDS = 60 * 60;

const tenant = Tenant.current();
const { contracts } = tenant;
const provider = contracts.governor.provider;

const getBlockCached = unstable_cache(
  async (p: typeof provider, blockNumber: number) => p.getBlock(blockNumber),
  ["getBlock-checkProposal"],
  { revalidate: ONE_HOUR_IN_SECONDS }
);

async function runCrossChainIfL1Ok(
  simulationResult: SimulationResult
): Promise<SimulationResult> {
  if (!simulationResult.sim.transaction.status) return simulationResult;
  return handleCrossChainSimulations(simulationResult);
}

export async function checkNewProposal({
  targets,
  values,
  signatures,
  calldatas,
  draftId,
  title,
}: {
  targets: string[];
  values: bigint[];
  signatures: string[];
  calldatas: string[];
  draftId: string;
  title?: string;
}) {
  const tenant = Tenant.current();
  const governor = tenant.contracts.governor;
  const provider = tenant.contracts.governor.provider;
  const governorType = tenant.contracts.governorType;

  const config: SimulationConfigNew = {
    governorAddress: governor.address,
    governorType: governorType,
    targets,
    values,
    signatures,
    calldatas,
    description: "",
  };

  const proposalData = {
    governor,
    provider,
    timelock: tenant.contracts.timelock!,
  };

  let simulationResult = await simulateNew(config);
  simulationResult = await runCrossChainIfL1Ok(simulationResult);

  const { sim, proposal, latestBlock } = simulationResult;

  if (!proposal) {
    throw new Error("Proposal not correctly simulated");
  }

  proposal.title = title;

  const checkResults: AllCheckResults = Object.fromEntries(
    await Promise.all(
      Object.keys(ALL_CHECKS).map(async (checkId) => [
        checkId,
        {
          name: ALL_CHECKS[checkId].name,
          result: await ALL_CHECKS[checkId].checkProposal(
            proposal,
            sim,
            proposalData
          ),
        },
      ])
    )
  );

  const [startBlock, endBlock] = await Promise.all([
    proposal.startBlock && Number(proposal.startBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.startBlock))
      : null,
    proposal.endBlock && Number(proposal.endBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.endBlock))
      : null,
  ]);

  // todo: correctly save it
  const dir = `./reports/${tenant.namespace}/${config.governorAddress}`;
  const report = await generateAndSaveReports(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposal,
    checkResults,
    dir,
    simulationResult
  );

  return report;
}

export async function checkExistingProposal({
  existingProposal,
}: {
  existingProposal: Proposal;
}) {
  const tenant = Tenant.current();
  const governor = tenant.contracts.governor;
  const provider = tenant.contracts.governor.provider;
  const governorType = tenant.contracts.governorType;

  const config: SimulationConfigProposed = {
    governorAddress: governor.address,
    governorType: governorType,
    proposalId: existingProposal.id,
    proposal: existingProposal,
  };

  const proposalData = {
    governor,
    provider,
    timelock: tenant.contracts.timelock!,
  };

  let simulationResult = await simulateProposed(config);
  simulationResult = await runCrossChainIfL1Ok(simulationResult);

  const { sim, latestBlock } = simulationResult;

  const proposalEvent = simulationResult.proposal;
  if (!proposalEvent) {
    throw new Error("Proposal not correctly simulated");
  }
  proposalEvent.title =
    proposalEvent.title || existingProposal.markdowntitle || "";

  const checkResults: AllCheckResults = Object.fromEntries(
    await Promise.all(
      Object.keys(ALL_CHECKS).map(async (checkId) => {
        const result = await ALL_CHECKS[checkId].checkProposal(
          proposalEvent,
          sim,
          proposalData
        );
        return [
          checkId,
          {
            name: ALL_CHECKS[checkId].name,
            result,
          },
        ];
      })
    )
  );

  const [startBlock, endBlock] = await Promise.all([
    existingProposal.startBlock &&
    Number(existingProposal.startBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(existingProposal.startBlock))
      : null,
    existingProposal.endBlock &&
    Number(existingProposal.endBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(existingProposal.endBlock))
      : null,
  ]);

  // todo: correctly save it
  const dir = `./reports/${tenant.namespace}/${config.governorAddress}`;
  const report = await generateAndSaveReports(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposalEvent,
    checkResults,
    dir,
    simulationResult
  );

  return report;
}

export async function checkNewApprovalProposal({
  unformattedProposalData,
  description,
  draftId,
  options,
  settings,
  title,
  combination,
  totalNumOfOptions,
}: {
  unformattedProposalData: `0x${string}`;
  description: string;
  draftId: string;
  title?: string;
  options: ApprovalProposalOption[];
  settings: ApprovalProposalSettings;
  combination?: number[];
  totalNumOfOptions?: number;
}) {
  const tenant = Tenant.current();
  const governor = tenant.contracts.governor;
  const provider = tenant.contracts.governor.provider;
  const governorType = tenant.contracts.governorType;

  // Avoiding importing ProposalType from @/app/proposals/draft/types to avoid circular dependency
  const moduleAddress = getProposalTypeAddress("approval" as any);

  const config: SimulationConfigNewApproval = {
    governorType: governorType,
    unformattedProposalData,
    description,
    moduleAddress: moduleAddress as `0x${string}`,
    options,
    settings,
    combination,
    totalNumOfOptions,
  };

  const proposalData = {
    governor,
    provider,
    timelock: tenant.contracts.timelock!,
  };

  let simulationResult = await simulateNewApproval(config);
  simulationResult = await runCrossChainIfL1Ok(simulationResult);

  const { sim, proposal, latestBlock } = simulationResult;

  if (!proposal) {
    throw new Error("Proposal not correctly simulated");
  }

  proposal.title = title;

  const checkResults: AllCheckResults = Object.fromEntries(
    await Promise.all(
      Object.keys(ALL_CHECKS).map(async (checkId) => [
        checkId,
        {
          name: ALL_CHECKS[checkId].name,
          result: await ALL_CHECKS[checkId].checkProposal(
            proposal,
            sim,
            proposalData
          ),
        },
      ])
    )
  );

  const [startBlock, endBlock] = await Promise.all([
    proposal.startBlock && Number(proposal.startBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.startBlock))
      : null,
    proposal.endBlock && Number(proposal.endBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.endBlock))
      : null,
  ]);

  const dir = `./reports/${tenant.namespace}/${governor.address}`;
  const report = await generateAndSaveReports(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposal,
    checkResults,
    dir,
    simulationResult
  );

  return report;
}
