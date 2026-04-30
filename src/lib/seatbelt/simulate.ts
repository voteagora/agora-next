import { defaultAbiCoder } from "@ethersproject/abi";
import { getAddress } from "@ethersproject/address";
import { HashZero } from "@ethersproject/constants";
import { keccak256 } from "@ethersproject/keccak256";
import { toUtf8Bytes } from "@ethersproject/strings";
import { unstable_cache } from "next/cache";

import Tenant from "../tenant/tenant";
import { getPublicClient } from "../viem";
import { GOVERNOR_TYPE } from "../constants";
import {
  ProposalData,
  ProposalEvent,
  SimulationConfigNew,
  SimulationConfigProposed,
  SimulationResult,
  TenderlyPayload,
  TenderlySimulation,
  TenderlyContract,
  StorageEncodingResponse,
  SimulationConfigNewApproval,
} from "./types";
import { encodeFunctionData, StateOverride } from "viem";
import { ParsedProposalData } from "../proposalUtils";
import { encodeState } from "./encode-state";
import { IMembershipContract } from "../contracts/common/interfaces/IMembershipContract";
import {
  BLOCK_GAS_LIMIT,
  DEFAULT_SIMULATION_FROM,
  getTenderlyEncodeUrl,
  sendSimulation,
  tenderlyFetchHeaders,
  TENDERLY_API_BASE_URL,
} from "./tenderly-api";
const DEFAULT_FROM = DEFAULT_SIMULATION_FROM;

const tenant = Tenant.current();
const { contracts, ui } = tenant;
const useL1BlockNumber = ui.toggle("use-l1-block-number")?.enabled;
const provider = contracts.governor.provider;
const providerForTime = contracts.providerForTime;
const chainIdForTime = contracts.chainForTime?.id;
const governor = contracts.governor;
const timelock = contracts.timelock;
const governorType = contracts.governorType;

type StateOverridesPayload = {
  networkID: string;
  stateOverrides: Record<string, { value: Record<string, string> }>;
};

function tenderlyHeaderBlockNumber(
  governanceSimBlock: bigint,
  forkBlockNumber: number
): bigint {
  const forkBn = BigInt(forkBlockNumber);
  return governanceSimBlock > forkBn ? governanceSimBlock : forkBn;
}

function applyTimelockEthFunding(
  simulationPayload: TenderlyPayload,
  fromAddress: string,
  timelockAddress: string,
  totalValue: bigint
): void {
  if (totalValue === 0n) return;
  simulationPayload.value = totalValue.toString();
  const objs = simulationPayload.state_objects!;
  objs[fromAddress] = {
    ...objs[fromAddress],
    balance: totalValue.toString(),
  };
  objs[timelockAddress] = {
    ...objs[timelockAddress],
    balance: totalValue.toString(),
  };
}

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const ONE_MINUTE_IN_SECONDS_BLOCK = 60;
const TEN_SECONDS_IN_SECONDS = 10;

const getBlockCached = unstable_cache(
  async (p: typeof provider, blockNumber: number) => p.getBlock(blockNumber),
  ["getBlock-simulate"],
  { revalidate: ONE_MINUTE_IN_SECONDS_BLOCK }
);

export async function generateProposalId(
  {
    targets,
    values,
    calldatas,
    description,
    proposalType,
    unformattedProposalData,
    moduleAddress,
  }: {
    targets: string[];
    values: bigint[];
    calldatas: string[];
    description: string;
    proposalType?: "basic" | "approval" | "optimistic";
    unformattedProposalData?: string;
    moduleAddress?: string;
  } = {
    targets: [],
    values: [],
    calldatas: [],
    description: "",
    proposalType: "basic",
  }
): Promise<bigint> {
  const client = getPublicClient();
  // Fetch proposal count from the contract and increment it by 1.
  if (governorType === GOVERNOR_TYPE.BRAVO) {
    const count = (await client.readContract({
      address: governor.address as `0x${string}`,
      abi: governor.abi,
      functionName: "proposalCount",
      args: [],
    })) as unknown as bigint;
    return count + 1n;
  }

  if (proposalType === "optimistic" || proposalType === "approval") {
    const proposalId = BigInt(
      keccak256(
        defaultAbiCoder.encode(
          ["address", "address", "bytes", "bytes32"],
          [
            governor.address,
            moduleAddress,
            unformattedProposalData,
            keccak256(toUtf8Bytes(description)),
          ]
        )
      )
    );
    return proposalId;
  }

  // Compute proposal ID from the tx data
  return BigInt(
    keccak256(
      defaultAbiCoder.encode(
        ["address[]", "uint256[]", "bytes[]", "bytes32"],
        [
          targets,
          values,
          calldatas.map(ensureHexPrefix),
          keccak256(toUtf8Bytes(description)),
        ]
      )
    )
  );
}

// Returns the identifier of an operation containing a batch of transactions.
// For OZ governors, predecessor is often zero and salt is often description hash.
// This is only intended to be used with OZ governors.
function hashOperationBatchOz(
  targets: string[],
  values: bigint[],
  calldatas: string[],
  predecessor: string,
  salt: string
): bigint {
  return BigInt(
    keccak256(
      defaultAbiCoder.encode(
        ["address[]", "uint256[]", "bytes[]", "bytes32", "bytes32"],
        [targets, values, calldatas.map(ensureHexPrefix), predecessor, salt]
      )
    )
  );
}

const getTotalSupplyCached = unstable_cache(
  async () => {
    if (contracts.token.isERC20()) {
      return contracts.token.contract.totalSupply();
    } else if (contracts.token.isERC721()) {
      const token = contracts.token.contract as IMembershipContract;
      const publicClient = getPublicClient(
        useL1BlockNumber ? contracts.chainForTime : contracts.token.chain
      );
      const blockNumber = await publicClient.getBlockNumber();
      return token.getPastTotalSupply(Number(blockNumber) - 1);
    } else {
      return 0;
    }
  },
  [
    "getTotalSupply-simulate",
    contracts.token.address,
    String(contracts.token.chain?.id || "defaultChain"),
  ],
  { revalidate: ONE_WEEK_IN_SECONDS }
);

// --- Simulation methods ---
/**
 * @notice Simulates execution of an on-chain proposal that has not yet been executed
 * @param config Configuration object
 */
export async function simulateNew(
  config: SimulationConfigNew
): Promise<SimulationResult> {
  const client = getPublicClient();

  // --- Validate config ---
  const { governorType, targets, values, signatures, calldatas, description } =
    config;

  if (targets.length !== values.length)
    throw new Error("targets and values must be the same length");
  if (targets.length !== signatures.length)
    throw new Error("targets and signatures must be the same length");
  if (targets.length !== calldatas.length)
    throw new Error("targets and calldatas must be the same length");

  // --- Get details about the proposal we're simulating ---
  const chainId = BigInt(governor.chain.id);

  const [
    blockNumberToUseRes,
    latestBlockL2Res,
    votingTokenSupplyRes,
    proposalIdRes,
  ] = await Promise.all([
    (async () =>
      useL1BlockNumber && chainIdForTime
        ? (await getLatestBlockCached(BigInt(chainIdForTime))) - 3
        : (await getLatestBlockCached(chainId)) - 3)(),
    (async () =>
      useL1BlockNumber && chainIdForTime
        ? (await getLatestBlockCached(chainId)) - 3
        : null)(),
    getTotalSupplyCached(),
    generateProposalId({
      targets,
      values,
      calldatas: calldatas.map(ensureHexPrefix),
      description,
    }),
  ]);

  const blockNumberToUse = blockNumberToUseRes;
  const latestBlockL2 = latestBlockL2Res;
  const votingTokenSupply = votingTokenSupplyRes;
  const proposalId = proposalIdRes;

  const latestBlock =
    useL1BlockNumber && providerForTime
      ? await getBlockCached(providerForTime, blockNumberToUse)
      : await getBlockCached(provider, blockNumberToUse);

  if (!latestBlock) {
    throw new Error("latestBlock is null");
  }

  if (!timelock) {
    throw new Error("timelock is null");
  }

  const startBlock = BigInt(latestBlock.number - 100);

  const proposal: ProposalEvent = {
    id: proposalId, // Bravo governor
    proposalId, // OZ governor (for simplicity we just include both ID formats)
    proposer: DEFAULT_FROM,
    startBlock,
    endBlock: startBlock + 1n,
    description,
    targets,
    values,
    signatures,
    calldatas: calldatas.map(ensureHexPrefix),
  };

  // --- Prepare simulation configuration ---
  const simBlock = proposal.endBlock! + 1n;

  const simTimestamp =
    governorType === GOVERNOR_TYPE.BRAVO
      ? BigInt(latestBlock.timestamp) + (simBlock - proposal.endBlock!) * 12n
      : BigInt(latestBlock.timestamp + 1);

  const eta = simTimestamp;

  const txHashes = targets.map((target, i) => {
    const [val, sig, calldata] = [values[i], signatures[i], calldatas[i]];
    // Convert string value to BigInt
    const valBigInt = BigInt(val.toString());
    return keccak256(
      defaultAbiCoder.encode(
        ["address", "uint256", "string", "bytes", "uint256"],
        [
          target,
          valBigInt.toString(),
          sig,
          calldata.startsWith("0x") ? calldata : `0x${calldata}`,
          eta,
        ]
      )
    );
  });

  // Generate the state object needed to mark the transactions as queued in the Timelock's storage
  const timelockStorageObj: Record<string, string> = {};

  if (governorType !== GOVERNOR_TYPE.BRAVO) {
    const id = hashOperationBatchOz(
      targets,
      values,
      calldatas.map(ensureHexPrefix),
      HashZero,
      keccak256(toUtf8Bytes(description))
    );
    timelockStorageObj[`_timestamps[${"0x" + id.toString(16)}]`] =
      simTimestamp.toString();
  }

  let governorStateOverrides: Record<string, string> = {};
  if (governorType === GOVERNOR_TYPE.BRAVO) {
    for (const hash of txHashes) {
      timelockStorageObj[`queuedTransactions[${hash}]`] = "true";
    }
    const proposalKey = `proposals[${proposalId.toString()}]`;
    governorStateOverrides = {
      proposalCount: proposalId.toString(),
      [`${proposalKey}.id`]: proposalId.toString(),
      [`${proposalKey}.proposer`]: DEFAULT_FROM,
      [`${proposalKey}.eta`]: eta.toString(),
      [`${proposalKey}.startBlock`]: proposal.startBlock.toString(),
      [`${proposalKey}.endBlock`]: proposal.endBlock.toString(),
      [`${proposalKey}.canceled`]: "false",
      [`${proposalKey}.executed`]: "false",
      [`${proposalKey}.forVotes`]: votingTokenSupply.toString(),
      [`${proposalKey}.againstVotes`]: "0",
      [`${proposalKey}.abstainVotes`]: "0",
      [`${proposalKey}.targets.length`]: targets.length.toString(),
      [`${proposalKey}.values.length`]: targets.length.toString(),
      [`${proposalKey}.signatures.length`]: targets.length.toString(),
      [`${proposalKey}.calldatas.length`]: targets.length.toString(),
    };

    targets.forEach((target, i) => {
      const value = BigInt(values[i]).toString();
      governorStateOverrides[`${proposalKey}.targets[${i}]`] = target;
      governorStateOverrides[`${proposalKey}.values[${i}]`] = value;
      governorStateOverrides[`${proposalKey}.signatures[${i}]`] = signatures[i];
      governorStateOverrides[`${proposalKey}.calldatas[${i}]`] = calldatas[i];
    });
  } else {
    const proposalCoreKey = `_proposals[${proposalId.toString()}]`;
    const proposalVotesKey = `_proposalVotes[${proposalId.toString()}]`;
    const id = hashOperationBatchOz(
      targets,
      values,
      calldatas.map(ensureHexPrefix),
      HashZero,
      keccak256(toUtf8Bytes(description))
    );
    governorStateOverrides = {
      [`${proposalCoreKey}.voteEnd._deadline`]: (simBlock - 1n).toString(),
      [`${proposalCoreKey}.voteStart._deadline`]: (
        simBlock - 10000n
      ).toString(),
      [`${proposalCoreKey}.canceled`]: "false",
      [`${proposalCoreKey}.executed`]: "false",
      [`${proposalVotesKey}.forVotes`]: votingTokenSupply.toString(),
      [`${proposalVotesKey}.againstVotes`]: "0",
      [`${proposalVotesKey}.abstainVotes`]: "0",
      [`_timelockIds[${proposalId.toString()}]`]: "0x" + id.toString(16),
    };
  }

  const stateOverrides: StateOverridesPayload = {
    networkID: chainId.toString(),
    stateOverrides: {
      [timelock.address]: {
        value: timelockStorageObj,
      },
      [governor.address]: {
        value: governorStateOverrides,
      },
    },
  };

  let storageObj: StorageEncodingResponse;

  // Dev note PF: sendEncodeRequest is a Tenderly API call that encodes the state overrides. encodeState is my own implementation that does the same thing.
  // sendEncodeRequest works better for Bravo governors but encodeState works better for others.
  // Ideal state would be to have a single encoding method that works for all governor types. But doesn't seem worth the effort right now.
  if (governorType === GOVERNOR_TYPE.BRAVO) {
    storageObj = await sendEncodeRequestCached(stateOverrides);
  } else {
    storageObj = await encodeStateCached(stateOverrides);
  }

  // --- Simulate it ---
  const descriptionHash = keccak256(toUtf8Bytes(description));

  const executeInputs =
    governorType === GOVERNOR_TYPE.BRAVO
      ? [proposalId.toString()]
      : [targets, values, calldatas.map(ensureHexPrefix), descriptionHash];

  const forkBlockNumber = latestBlockL2 ? latestBlockL2 : latestBlock.number;
  const headerBlockNumber = tenderlyHeaderBlockNumber(
    simBlock,
    forkBlockNumber
  );

  const simulationPayload: TenderlyPayload = {
    network_id: chainId.toString(),
    block_number: forkBlockNumber,
    from: DEFAULT_FROM,
    to: governor.address,
    input: encodeFunctionData({
      abi: governor.abi,
      functionName: "execute",
      args: executeInputs,
    }),
    gas: BLOCK_GAS_LIMIT,
    gas_price: "0",
    value: "0",
    save_if_fails: true,
    save: true,
    generate_access_list: true,
    block_header: {
      number: `0x${headerBlockNumber.toString(16)}`,
      timestamp: `0x${simTimestamp.toString(16)}`,
    },
    state_objects: {
      [DEFAULT_FROM]: { balance: "0" },
      [timelock.address]: {
        storage:
          storageObj.stateOverrides[timelock.address.toLowerCase()]?.value,
      },
      [governor.address]: {
        storage:
          storageObj.stateOverrides[governor.address.toLowerCase()]?.value,
      },
    },
  };

  const totalValue = sumProposalActionValues(config.values);
  applyTimelockEthFunding(
    simulationPayload,
    DEFAULT_FROM,
    timelock.address,
    totalValue
  );

  // Run the simulation
  const sim = await sendSimulation(simulationPayload);

  const deps: ProposalData = {
    governor,
    timelock,
    provider,
  };

  return { sim, proposal, latestBlock, deps };
}

/**
 * @notice Simulates execution of an on-chain proposal that has not yet been executed
 * @param config Configuration object
 */
export async function simulateProposed(
  config: SimulationConfigProposed
): Promise<SimulationResult> {
  const { governorType, proposalId, proposal } = config;

  // --- Get details about the proposal we're simulating ---
  const chainId = BigInt(governor.chain.id);

  const [blockNumberToUseRes, latestBlockL2Res, votingTokenSupplyRes] =
    await Promise.all([
      (async () =>
        useL1BlockNumber && chainIdForTime
          ? (await getLatestBlockCached(BigInt(chainIdForTime))) - 3
          : (await getLatestBlockCached(chainId)) - 3)(),
      (async () =>
        useL1BlockNumber && chainIdForTime
          ? (await getLatestBlockCached(chainId)) - 3
          : null)(),
      getTotalSupplyCached(),
    ]);

  const blockNumberToUse = blockNumberToUseRes;
  const latestBlockL2 = latestBlockL2Res;
  const votingTokenSupply = votingTokenSupplyRes;

  const latestBlock =
    useL1BlockNumber && providerForTime
      ? await getBlockCached(providerForTime, blockNumberToUse)
      : await getBlockCached(provider, blockNumberToUse);

  const options = (
    proposal.proposalData as ParsedProposalData["STANDARD"]["kind"]
  ).options;

  const option = options?.[0];

  const { targets, signatures: sigs, calldatas, values } = option;

  // --- Prepare simulation configuration ---

  // Set `from` arbitrarily.
  const from = DEFAULT_FROM;

  if (!latestBlock) {
    throw new Error("Latest block not found");
  }

  if (!timelock) {
    throw new Error("Timelock not found");
  }

  if (!proposal.endBlock || !proposal.startBlock) {
    throw new Error("Proposal endBlock or startBlock not found");
  }

  // For Bravo governors, we use the block right after the proposal ends, and for OZ
  // governors we arbitrarily use the next block number.
  const simBlock =
    governorType === GOVERNOR_TYPE.BRAVO
      ? BigInt(proposal.endBlock!) + 1n
      : BigInt(latestBlock.number + 1);

  // For OZ governors we are given the earliest possible execution time. For Bravo governors, we
  // Compute the approximate earliest possible execution time based on governance parameters.
  const simTimestamp =
    governorType === GOVERNOR_TYPE.BRAVO
      ? BigInt(latestBlock.timestamp) +
        (simBlock - BigInt(proposal.endBlock!)) * 12n
      : BigInt(Math.floor(proposal.endTime!.getTime() / 1000 + 1));

  const eta = simTimestamp; // set proposal eta to be equal to the timestamp we simulate at

  // Compute transaction hashes used by the Timelock
  const txHashes = targets.map((target, i) => {
    const val = values[i];
    const sig = sigs[i] || "";
    const calldata = calldatas[i];

    const valBigInt = BigInt(val);
    return keccak256(
      defaultAbiCoder.encode(
        ["address", "uint256", "string", "bytes", "uint256"],
        [
          target,
          valBigInt.toString(),
          sig,
          calldata.startsWith("0x") ? calldata : `0x${calldata}`,
          eta,
        ]
      )
    );
  });

  // Generate the state object needed to mark the transactions as queued in the Timelock's storage
  const timelockStorageObj: Record<string, string> = {};

  if (governorType !== GOVERNOR_TYPE.BRAVO) {
    // Add safety check for description
    const description = proposal.description || "";

    try {
      const descHash = keccak256(toUtf8Bytes(description));

      const id = hashOperationBatchOz(
        targets,
        values.map(stringToBigInt),
        calldatas.map(ensureHexPrefix),
        HashZero,
        descHash
      );

      timelockStorageObj[`_timestamps[${"0x" + id.toString(16)}]`] =
        simTimestamp.toString();
    } catch (error) {
      console.error("Error in hashOperationBatchOz:", error);
      throw error;
    }
  }

  const proposalIdBn = BigInt(proposalId);

  let governorStateOverrides: Record<string, string> = {};
  if (governorType === GOVERNOR_TYPE.BRAVO) {
    for (const hash of txHashes) {
      timelockStorageObj[`queuedTransactions[${hash}]`] = "true";
    }
    const proposalKey = `proposals[${proposalIdBn.toString()}]`;
    governorStateOverrides = {
      proposalCount: proposalId.toString(),
      [`${proposalKey}.eta`]: eta.toString(),
      [`${proposalKey}.canceled`]: "false",
      [`${proposalKey}.executed`]: "false",
      [`${proposalKey}.forVotes`]: votingTokenSupply.toString(),
      [`${proposalKey}.againstVotes`]: "0",
      [`${proposalKey}.abstainVotes`]: "0",
    };
  } else {
    const proposalCoreKey = `_proposals[${proposalIdBn.toString()}]`;
    const proposalVotesKey = `_proposalVotes[${proposalIdBn.toString()}]`;
    const id = hashOperationBatchOz(
      targets,
      values.map(stringToBigInt),
      calldatas.map(ensureHexPrefix),
      HashZero,
      keccak256(toUtf8Bytes(proposal.description || ""))
    );
    governorStateOverrides = {
      [`${proposalCoreKey}.voteEnd._deadline`]: (simBlock - 1n).toString(),
      [`${proposalCoreKey}.voteStart._deadline`]: (
        simBlock - 10000n
      ).toString(),
      [`${proposalCoreKey}.canceled`]: "false",
      [`${proposalCoreKey}.executed`]: "false",
      [`${proposalVotesKey}.forVotes`]: votingTokenSupply.toString(),
      [`${proposalVotesKey}.againstVotes`]: "0",
      [`${proposalVotesKey}.abstainVotes`]: "0",
      [`_timelockIds[${proposalIdBn.toString()}]`]: "0x" + id.toString(16),
    };
  }

  const stateOverrides: StateOverridesPayload = {
    networkID: chainId.toString(),
    stateOverrides: {
      [timelock.address]: {
        value: timelockStorageObj,
      },
      [governor.address]: {
        value: governorStateOverrides,
      },
    },
  };

  let storageObj: StorageEncodingResponse;

  if (governorType === GOVERNOR_TYPE.BRAVO) {
    storageObj = await sendEncodeRequestCached(stateOverrides);
  } else {
    storageObj = await encodeStateCached(stateOverrides);
  }

  // --- Simulate it ---
  // Note: The Tenderly API is sensitive to the input types, so all formatting below (e.g. stripping
  // leading zeroes, padding with zeros, strings vs. hex, etc.) are all intentional decisions to
  // ensure Tenderly properly parses the simulation payload

  const safeDescription = proposal.description || "";

  const descriptionHash = keccak256(toUtf8Bytes(safeDescription));

  const executeInputs =
    governorType === GOVERNOR_TYPE.BRAVO
      ? [BigInt(proposalId)]
      : [targets, values, calldatas.map(ensureHexPrefix), descriptionHash];

  const forkBlockNumber = proposal.executedBlock
    ? Number(BigInt(proposal.executedBlock) - BigInt(10))
    : (latestBlockL2 ?? latestBlock.number);

  const headerBlockNumber = tenderlyHeaderBlockNumber(
    simBlock,
    forkBlockNumber
  );

  const simulationPayload: TenderlyPayload = {
    network_id: chainId.toString(),
    block_number: forkBlockNumber,
    from,
    to: governor.address,
    input: encodeFunctionData({
      abi: governor.abi,
      functionName: "execute",
      args: executeInputs,
    }),
    gas: BLOCK_GAS_LIMIT,
    gas_price: "0",
    value: "0",
    save_if_fails: true, // Set to true to save the simulation to your Tenderly dashboard if it fails.
    save: true, // Set to true to save the simulation to your Tenderly dashboard if it succeeds.
    generate_access_list: true, // not required, but useful as a sanity check to ensure consistency in the simulation response
    block_header: {
      // this data represents what block.number and block.timestamp should return in the EVM during the simulation
      number: `0x${headerBlockNumber.toString(16)}`,
      timestamp: `0x${simTimestamp.toString(16)}`,
    },
    state_objects: {
      // Since gas price is zero, the sender needs no balance. If the sender does need a balance to
      // send ETH with the execution, this will be overridden later.
      [from]: { balance: "0" },
      // Ensure transactions are queued in the timelock
      [timelock.address]: {
        storage:
          storageObj.stateOverrides[timelock.address.toLowerCase()]?.value,
      },
      // Ensure governor storage is properly configured so `state(proposalId)` returns `Queued`
      [governor.address]: {
        storage:
          storageObj.stateOverrides[governor.address.toLowerCase()]?.value,
      },
    },
  };

  try {
    applyTimelockEthFunding(
      simulationPayload,
      from,
      timelock.address,
      sumProposalActionValues(values)
    );
  } catch (error) {
    console.error("Error calculating total value:", error);
    throw error;
  }

  // Run the simulation
  const sim = await sendSimulation(simulationPayload);

  const deps: ProposalData = {
    governor,
    timelock,
    provider,
  };

  const proposalForChecks: ProposalEvent = {
    id: proposalIdBn,
    proposalId: proposalIdBn,
    proposer: proposal.proposer,
    startBlock: BigInt(proposal.startBlock!),
    endBlock: BigInt(proposal.endBlock!),
    description: proposal.description ?? "",
    title: proposal.markdowntitle,
    targets: targets.map((t) => getAddress(String(t))),
    values: values.map(stringToBigInt),
    signatures: sigs,
    calldatas: calldatas.map((data) => ensureHexPrefix(String(data))),
  };

  return { sim, proposal: proposalForChecks, latestBlock, deps };
}

export async function simulateNewApproval(
  config: SimulationConfigNewApproval
): Promise<SimulationResult> {
  const client = getPublicClient();

  // --- Validate config ---
  const {
    unformattedProposalData,
    description,
    moduleAddress,
    combination,
    totalNumOfOptions,
    settings,
  } = config;

  if (!moduleAddress) {
    throw new Error("moduleAddress is required for approval proposals");
  }

  // --- Get details about the proposal we're simulating ---
  const chainId = BigInt(governor.chain.id);

  const [blockNumberToUseRes, latestBlockL2Res, votingTokenSupplyRes] =
    await Promise.all([
      (async () =>
        useL1BlockNumber && chainIdForTime
          ? (await getLatestBlockCached(BigInt(chainIdForTime))) - 3
          : (await getLatestBlockCached(chainId)) - 3)(),
      (async () =>
        useL1BlockNumber && chainIdForTime
          ? (await getLatestBlockCached(chainId)) - 3
          : null)(),
      getTotalSupplyCached(),
    ]);

  const blockNumberToUse = blockNumberToUseRes;
  const latestBlockL2 = latestBlockL2Res;
  const votingTokenSupply = votingTokenSupplyRes;

  const latestBlock =
    useL1BlockNumber && providerForTime
      ? await getBlockCached(providerForTime, blockNumberToUse)
      : await getBlockCached(provider, blockNumberToUse);

  // Generate proposal ID using the module address
  const descriptionHash = keccak256(toUtf8Bytes(description));
  const proposalId = BigInt(
    keccak256(
      defaultAbiCoder.encode(
        ["address", "address", "bytes", "bytes32"],
        [
          governor.address,
          moduleAddress,
          unformattedProposalData,
          descriptionHash,
        ]
      )
    )
  );

  if (!latestBlock) {
    throw new Error("latestBlock is null");
  }

  if (!timelock) {
    throw new Error("timelock is null");
  }

  const startBlock = BigInt(latestBlock.number - 100);

  // todo
  const proposal: ProposalEvent = {
    id: proposalId,
    proposalId,
    proposer: DEFAULT_FROM,
    startBlock,
    endBlock: startBlock + 1n,
    description,
    targets: [],
    values: [],
    signatures: [],
    calldatas: [],
  };

  // --- Prepare simulation configuration ---
  const from = DEFAULT_FROM;

  const simBlock = proposal.endBlock! + 1n;
  const simTimestamp = BigInt(latestBlock.timestamp + 1);

  // Get execution parameters from the module
  const storageObjForFormatExecuteParams = await encodeStateCached({
    networkID: chainId.toString(),
    stateOverrides: {
      [moduleAddress.toLowerCase()]: {
        value: {
          [`proposals[${proposalId.toString()}].governor`]: governor.address,
          ...Object.fromEntries(
            Array.from({ length: totalNumOfOptions || 0 }, (_, i) => {
              return [
                `proposals[${proposalId.toString()}].optionVotes[${i}]`,
                (combination?.includes(i)
                  ? settings.criteriaValue + BigInt(1)
                  : BigInt(0)
                ).toString(),
              ];
            })
          ),
        },
      },
    },
  });

  // Dev note PF: Why the below is needed? This is the length of the optionVotes array. There isn't an easy way to access this with object.keys notation, this is a hacky solution
  // Get the governor slot from the encoded state and add 2
  const governorSlot = Object.keys(
    storageObjForFormatExecuteParams.stateOverrides[moduleAddress.toLowerCase()]
      ?.value || {}
  )[0];

  if (!governorSlot) {
    throw new Error("Could not find governor slot in encoded state");
  }

  // Convert the slot to a number, add 2, and convert back to hex
  const slotNumber = BigInt(governorSlot);
  const targetSlot = slotNumber + 2n;
  const targetSlotHex = "0x" + targetSlot.toString(16).padStart(64, "0");

  // Add the new storage slot to the state overrides
  storageObjForFormatExecuteParams.stateOverrides[
    moduleAddress.toLowerCase()
  ].value[targetSlotHex] =
    "0x" +
    BigInt(totalNumOfOptions || 0)
      .toString(16)
      .padStart(64, "0");

  const stateOverride: StateOverride = [
    {
      address: moduleAddress as `0x${string}`,
      stateDiff: Object.entries(
        storageObjForFormatExecuteParams.stateOverrides[
          moduleAddress.toLowerCase()
        ]?.value || {}
      ).map(([slot, value]) => ({
        slot: slot as `0x${string}`,
        value: value as `0x${string}`,
      })),
    },
  ];

  let result;
  try {
    const response = await client.simulateContract({
      address: moduleAddress as `0x${string}`,
      abi: [
        {
          inputs: [
            {
              internalType: "uint256",
              name: "proposalId",
              type: "uint256",
            },
            {
              internalType: "bytes",
              name: "proposalData",
              type: "bytes",
            },
          ],
          name: "_formatExecuteParams",
          outputs: [
            {
              internalType: "address[]",
              name: "targets",
              type: "address[]",
            },
            {
              internalType: "uint256[]",
              name: "values",
              type: "uint256[]",
            },
            {
              internalType: "bytes[]",
              name: "calldatas",
              type: "bytes[]",
            },
          ],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "_formatExecuteParams",
      account: governor.address as `0x${string}`,
      stateOverride: stateOverride,
      args: [proposalId, unformattedProposalData as `0x${string}`],
    });

    result = response.result;
  } catch (error) {
    throw error;
  }

  const [targets, values, calldatas] = result;

  // Generate the state object needed to mark the transactions as queued in the Timelock's storage
  const timelockStorageObj: Record<string, string> = {};

  const id = hashOperationBatchOz(
    [...targets],
    [...values],
    [...calldatas],
    HashZero,
    keccak256(toUtf8Bytes(description))
  );

  timelockStorageObj[`_timestamps[${"0x" + id.toString(16)}]`] =
    simTimestamp.toString();

  const governorStateOverrides: Record<string, string> = {
    [`_proposals[${proposalId.toString()}].voteEnd._deadline`]: (
      simBlock - 1n
    ).toString(),
    [`_proposals[${proposalId.toString()}].voteStart._deadline`]: (
      simBlock - 10000n
    ).toString(),
    [`_proposals[${proposalId.toString()}].canceled`]: "false",
    [`_proposals[${proposalId.toString()}].executed`]: "false",
    [`_proposalVotes[${proposalId.toString()}].forVotes`]:
      votingTokenSupply.toString(),
    [`_proposalVotes[${proposalId.toString()}].againstVotes`]: "0",
    [`_proposalVotes[${proposalId.toString()}].abstainVotes`]: "0",
    [`_timelockIds[${proposalId.toString()}]`]: "0x" + id.toString(16),
  };

  const stateOverrides: StateOverridesPayload = {
    networkID: chainId.toString(),
    stateOverrides: {
      [timelock.address]: {
        value: timelockStorageObj,
      },
      [governor.address]: {
        value: governorStateOverrides,
      },
    },
  };

  const storageObj = await encodeStateCached(stateOverrides);

  // --- Simulate it ---
  const forkBlockNumber = latestBlockL2 ? latestBlockL2 : latestBlock.number;
  const headerBlockNumber = tenderlyHeaderBlockNumber(
    simBlock,
    forkBlockNumber
  );

  const simulationPayload: TenderlyPayload = {
    network_id: chainId.toString(),
    block_number: forkBlockNumber,
    from,
    to: governor.address,
    input: encodeFunctionData({
      abi: governor.abi,
      functionName: "executeWithModule",
      args: [moduleAddress, unformattedProposalData, descriptionHash],
    }),
    gas: BLOCK_GAS_LIMIT,
    gas_price: "0",
    value: "0",
    save_if_fails: true,
    save: true,
    generate_access_list: true,
    block_header: {
      number: `0x${headerBlockNumber.toString(16)}`,
      timestamp: `0x${simTimestamp.toString(16)}`,
    },
    state_objects: {
      [from]: { balance: "0" },
      [timelock.address]: {
        storage:
          storageObj.stateOverrides[timelock.address.toLowerCase()]?.value,
      },
      [governor.address]: {
        storage:
          storageObj.stateOverrides[governor.address.toLowerCase()]?.value,
      },
      [moduleAddress]: {
        storage:
          storageObjForFormatExecuteParams.stateOverrides[
            moduleAddress.toLowerCase()
          ]?.value,
      },
    },
  };

  // Run the simulation
  const sim = await sendSimulation(simulationPayload);

  proposal.targets = [...targets].map((t) => getAddress(String(t)));
  proposal.values = [...values].map((v) => BigInt(v as bigint));
  proposal.calldatas = [...calldatas].map((c) =>
    ensureHexPrefix(typeof c === "string" ? c : String(c))
  );
  proposal.signatures = [...targets].map(() => "");

  const deps: ProposalData = {
    governor,
    timelock,
    provider,
  };

  return { sim, proposal, latestBlock, deps };
}

// --- Helper methods ---

/**
 * Gets the latest block number known to Tenderly
 * @param chainId Chain ID to get block number for
 */
const getLatestBlockCached = unstable_cache(
  async (chainId: bigint) => {
    try {
      // Send simulation request
      const url = `${TENDERLY_API_BASE_URL}/network/${chainId.toString()}/block-number`;
      const res = await fetch(url, {
        method: "GET",
        headers: tenderlyFetchHeaders(),
      });
      const data = await res.json();
      return data.block_number as number;
    } catch (err) {
      throw err;
    }
  },
  ["getLatestBlock-simulate"],
  { revalidate: TEN_SECONDS_IN_SECONDS }
);

/**
 * @notice Encode state overrides
 * @param payload State overrides to send
 */
const sendEncodeRequestCached = unstable_cache(
  async (payload: StateOverridesPayload): Promise<StorageEncodingResponse> => {
    try {
      const response = await fetch(getTenderlyEncodeUrl(), {
        method: "POST",
        body: JSON.stringify(payload),
        headers: tenderlyFetchHeaders(),
      });

      const sim = await response.json();

      return sim;
    } catch (err) {
      throw err;
    }
  },
  ["sendEncodeRequest", getTenderlyEncodeUrl()],
  { revalidate: ONE_WEEK_IN_SECONDS }
);

const encodeStateCached = unstable_cache(
  async (payload: StateOverridesPayload): Promise<StorageEncodingResponse> => {
    return encodeState(payload);
  },
  ["encodeStateFromPayload"],
  { revalidate: ONE_WEEK_IN_SECONDS }
);

/**
 * @notice Given a Tenderly contract object, generates a descriptive human-friendly name for that contract
 * @param contract Tenderly contract object to generate name from
 */
export function getContractName(contract: TenderlyContract | undefined) {
  if (!contract) return "unknown contract name";
  let contractName = contract?.contract_name;

  // If the contract is a token, include the full token name. This is useful in cases where the
  // token is a proxy, so the contract name doesn't give much useful information
  if (contract?.token_data?.name)
    contractName += ` (${contract?.token_data?.name})`;

  // Lastly, append the contract address and save it off
  return `${contractName} at \`${getAddress(contract.address)}\``;
}

function stringToBigInt(value: string | number | bigint): bigint {
  if (typeof value === "bigint") {
    return value;
  }
  const str = value.toString();
  try {
    return BigInt(str);
  } catch {
    // If direct conversion fails, try to handle scientific notation
    const parts = str.toLowerCase().split("e");
    if (parts.length === 2) {
      const base = parts[0];
      const exponent = parseInt(parts[1]);
      // Handle scientific notation by shifting the decimal point
      const baseWithoutDecimal = base.replace(".", "");
      const decimalIndex = base.indexOf(".");
      const decimalPlaces =
        decimalIndex === -1 ? 0 : base.length - decimalIndex - 1;
      const shift = exponent - decimalPlaces;
      if (shift >= 0) {
        return BigInt(baseWithoutDecimal + "0".repeat(shift));
      } else {
        if (baseWithoutDecimal.length + shift <= 0) return 0n;
        return BigInt(
          baseWithoutDecimal.slice(0, baseWithoutDecimal.length + shift)
        );
      }
    }
    throw new Error(`Invalid number format for BigInt conversion: ${str}`);
  }
}

function sumProposalActionValues(
  values: readonly (string | number | bigint)[]
): bigint {
  let total = 0n;
  for (const val of values) {
    total += stringToBigInt(val);
  }
  return total;
}

const ensureHexPrefix = (hex: string): `0x${string}` => {
  return hex.startsWith("0x") ? (hex as `0x${string}`) : `0x${hex}`;
};
