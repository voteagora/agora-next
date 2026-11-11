"use server";

import { unstable_cache } from "next/cache";

import { Proposal } from "@/app/api/common/proposals/proposal";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";

import Tenant from "../tenant/tenant";
import ALL_CHECKS from "./checks";
import { handleCrossChainSimulations } from "./cross-chain/tenderly-execution-engine";
import { generateReport } from "./report";
import { runChecks } from "./runChecks";
import { simulateNew, simulateNewApproval, simulateProposed } from "./simulate";
import {
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

type SimulationActionResult<T> =
  | { ok: true; report: T }
  | { ok: false; error: string };

// Errors thrown from a server action are redacted in production (the client only sees
// "Minified React error #441"), so failures are logged here and returned as data instead.
async function toActionResult<T>(
  label: string,
  run: () => Promise<T>
): Promise<SimulationActionResult<T>> {
  try {
    return { ok: true, report: await run() };
  } catch (error) {
    console.error(`${label} failed:`, error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runCrossChainIfL1Ok(
  simulationResult: SimulationResult
): Promise<SimulationResult> {
  if (!simulationResult.sim.transaction.status) return simulationResult;
  return handleCrossChainSimulations(simulationResult);
}

async function checkNewProposalImpl({
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
  if (!governorType) {
    throw new Error("Governor type is not configured for this tenant");
  }

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

  const checkResults = await runChecks(ALL_CHECKS, proposal, sim, proposalData);

  const [startBlock, endBlock] = await Promise.all([
    proposal.startBlock && Number(proposal.startBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.startBlock))
      : null,
    proposal.endBlock && Number(proposal.endBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.endBlock))
      : null,
  ]);

  const report = await generateReport(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposal,
    checkResults,
    simulationResult
  );

  return report;
}

async function checkExistingProposalImpl({
  existingProposal,
}: {
  existingProposal: Proposal;
}) {
  const tenant = Tenant.current();
  const governor = tenant.contracts.governor;
  const provider = tenant.contracts.governor.provider;
  const governorType = tenant.contracts.governorType;
  if (!governorType) {
    throw new Error("Governor type is not configured for this tenant");
  }

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

  const checkResults = await runChecks(
    ALL_CHECKS,
    proposalEvent,
    sim,
    proposalData
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

  const report = await generateReport(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposalEvent,
    checkResults,
    simulationResult
  );

  return report;
}

async function checkNewApprovalProposalImpl({
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
  if (!governorType) {
    throw new Error("Governor type is not configured for this tenant");
  }

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

  const checkResults = await runChecks(ALL_CHECKS, proposal, sim, proposalData);

  const [startBlock, endBlock] = await Promise.all([
    proposal.startBlock && Number(proposal.startBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.startBlock))
      : null,
    proposal.endBlock && Number(proposal.endBlock) <= latestBlock.number
      ? getBlockCached(provider, Number(proposal.endBlock))
      : null,
  ]);

  const report = await generateReport(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposal,
    checkResults,
    simulationResult
  );

  return report;
}

export async function checkNewProposal(
  args: Parameters<typeof checkNewProposalImpl>[0]
) {
  return toActionResult("checkNewProposal", () => checkNewProposalImpl(args));
}

export async function checkExistingProposal(
  args: Parameters<typeof checkExistingProposalImpl>[0]
) {
  return toActionResult("checkExistingProposal", () =>
    checkExistingProposalImpl(args)
  );
}

export async function checkNewApprovalProposal(
  args: Parameters<typeof checkNewApprovalProposalImpl>[0]
) {
  return toActionResult("checkNewApprovalProposal", () =>
    checkNewApprovalProposalImpl(args)
  );
}
