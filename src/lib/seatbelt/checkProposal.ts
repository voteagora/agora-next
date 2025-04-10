"use server";

import { ParsedProposalData } from "../proposalUtils";
import Tenant from "../tenant/tenant";
import ALL_CHECKS from "./checks";
import { generateAndSaveReports } from "./report";
import { simulateNew, simulateProposed, simulateNewApproval } from "./simulate";
import {
  AllCheckResults,
  SimulationConfigNew,
  SimulationConfigProposed,
  SimulationConfigNewApproval,
  ApprovalProposalSettings,
  ApprovalProposalOption,
} from "./types";
import { Proposal } from "@/app/api/common/proposals/proposal";
import { getProposalTypeAddress } from "@/app/proposals/draft/utils/stages";

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

  // Generate the proposal data and dependencies needed by checks
  const proposalData = {
    governor,
    provider,
    timelock: tenant.contracts.timelock!,
  };

  // Run simulation
  const { sim, proposal, latestBlock } = await simulateNew(config);

  if (!proposal) {
    throw new Error("Proposal not correctly simulated");
  }

  proposal.title = title;

  // Run checks
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

  // Generate markdown report
  const [startBlock, endBlock] = await Promise.all([
    proposal.startBlock && Number(proposal.startBlock) <= latestBlock.number
      ? provider.getBlock(Number(proposal.startBlock))
      : null,
    proposal.endBlock && Number(proposal.endBlock) <= latestBlock.number
      ? provider.getBlock(Number(proposal.endBlock))
      : null,
  ]);

  // Save markdown report to a file
  // todo: correctly save it
  const dir = `./reports/${tenant.namespace}/${config.governorAddress}`;
  const report = await generateAndSaveReports(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposal,
    checkResults,
    dir,
    sim
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

  // Generate the proposal data and dependencies needed by checks
  const proposalData = {
    governor,
    provider,
    timelock: tenant.contracts.timelock!,
  };

  // Run simulation
  const { sim, latestBlock } = await simulateProposed(config);

  const options = (
    existingProposal.proposalData as ParsedProposalData["STANDARD"]["kind"]
  ).options;
  const option = options?.[0];

  const { targets, signatures: sigs, calldatas, values } = option;
  const proposalEvent = {
    targets: targets.map((target) => target as `0x${string}`),
    values: values.map((value) => BigInt(value)),
    signatures: sigs,
    calldatas: calldatas.map((data) => data as `0x${string}`),
    id: BigInt(existingProposal.id),
    proposalId: BigInt(existingProposal.id),
    startBlock: BigInt(existingProposal.startBlock!),
    endBlock: BigInt(existingProposal.endBlock!),
    description: existingProposal.description ?? "",
    proposer: existingProposal.proposer,
    title: existingProposal.markdowntitle ?? "",
  };

  // Run checks
  const checkResults: AllCheckResults = Object.fromEntries(
    await Promise.all(
      Object.keys(ALL_CHECKS).map(async (checkId) => [
        checkId,
        {
          name: ALL_CHECKS[checkId].name,
          result: await ALL_CHECKS[checkId].checkProposal(
            proposalEvent,
            sim,
            proposalData
          ),
        },
      ])
    )
  );

  // Generate markdown report
  const [startBlock, endBlock] = await Promise.all([
    existingProposal.startBlock &&
    Number(existingProposal.startBlock) <= latestBlock.number
      ? provider.getBlock(Number(existingProposal.startBlock))
      : null,
    existingProposal.endBlock &&
    Number(existingProposal.endBlock) <= latestBlock.number
      ? provider.getBlock(Number(existingProposal.endBlock))
      : null,
  ]);

  // Save markdown report to a file
  // todo: correctly save it
  const dir = `./reports/${tenant.namespace}/${config.governorAddress}`;
  const report = await generateAndSaveReports(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposalEvent,
    checkResults,
    dir,
    sim
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

  // Generate the proposal data and dependencies needed by checks
  const proposalData = {
    governor,
    provider,
    timelock: tenant.contracts.timelock!,
  };

  // Run simulation
  const { sim, proposal, latestBlock } = await simulateNewApproval(config);

  if (!proposal) {
    throw new Error("Proposal not correctly simulated");
  }

  proposal.title = title;

  // Run checks
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

  // Generate markdown report
  const [startBlock, endBlock] = await Promise.all([
    proposal.startBlock && Number(proposal.startBlock) <= latestBlock.number
      ? provider.getBlock(Number(proposal.startBlock))
      : null,
    proposal.endBlock && Number(proposal.endBlock) <= latestBlock.number
      ? provider.getBlock(Number(proposal.endBlock))
      : null,
  ]);

  // Save markdown report to a file
  const dir = `./reports/${tenant.namespace}/${governor.address}`;
  const report = await generateAndSaveReports(
    { start: startBlock, end: endBlock, current: latestBlock },
    proposal,
    checkResults,
    dir,
    sim
  );

  return report;
}
