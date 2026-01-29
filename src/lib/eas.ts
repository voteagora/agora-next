import {
  SchemaEncoder,
  NO_EXPIRATION,
  EAS,
  ZERO_BYTES32,
} from "@ethereum-attestation-service/eas-sdk";
import { JsonRpcSigner, toUtf8Bytes } from "ethers";
import Tenant from "./tenant/tenant";
import { keccak256 } from "viem";
import { defaultAbiCoder } from "@ethersproject/abi";
import { getEASAddress } from "./constants";
import { easVotingTypeToNumber } from "@/app/create/types";

const { slug, contracts } = Tenant.current();

const CREATE_PROPOSAL_SCHEMA_ID =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? "0x590765de6f34bbae3e51aa89e571f567fa6d63cf3f8225592d58133860a0ccda"
    : "0xfc5b3c0472d09ac39f0cb9055869e70c4c59413041e3fd317f357789389971e4";

const EAS_V2_SCHEMA_IDS = {
  CREATE_PROPOSAL:
    "0x38bfba767c2f41790962f09bcf52923713cfff3ad6d7604de7cc77c15fcf169a",
  VOTE: {
    1: "0x12cd8679de42e111a5ece9f2aee44dc8b8351024dea881cda97c2ff5b58349f6",
    11155111:
      "0x19c36b80a224c4800fd6ed68901ec21f591563c8a5cb2dd95382d430603f91ff",
    8453: "0x72edbb9603b8ff8ae5310c1d33912f4a7998bea0c03afc0e06a64e41d32b78b9",
  } as Record<number, string>,
  ADVANCED_VOTE: {
    1: "0xc4465af5d96b474b1c7a6418500461d3de1fc35552679bf695eb2b3124817dce",
    11155111:
      "0x991b014c62b19364882fc89dbf3baa6104b4598ee2c4f29152be2cbcfcb4cb81",
    8453: "0x72edbb9603b8ff8ae5310c1d33912f4a7998bea0c03afc0e06a64e41d32b78b9",
  },
};

const schemaEncoder = new SchemaEncoder(
  "address contract,uint256 id,address proposer,string description,string[] choices,uint8 proposal_type_id,uint256 start_block,uint256 end_block, string proposal_type, uint256[] tiers, uint256 onchain_proposalid, uint8 max_approvals, uint8 criteria, uint128 criteria_value, uint8 calculationOptions"
);

const eas = new EAS(getEASAddress(contracts.token.chain.id));

export async function createProposalAttestation({
  contract,
  proposer,
  description,
  choices,
  proposal_type_id,
  start_block,
  end_block,
  signer,
  proposal_type,
  tiers,
  onchain_proposalid,
  maxApprovals,
  criteria,
  criteriaValue,
  calculationOptions,
}: {
  contract: string;
  proposer: string;
  description: string;
  choices: string[];
  proposal_type_id: number;
  start_block: string;
  end_block: string;
  proposal_type: string;
  tiers: number[];
  signer: JsonRpcSigner;
  onchain_proposalid?: bigint | null;
  maxApprovals: number;
  criteria: number;
  criteriaValue: number;
  calculationOptions: number;
}) {
  eas.connect(signer as any);

  const id = BigInt(
    keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "bytes32", "bytes32"],
        [
          keccak256(toUtf8Bytes(slug)),
          keccak256(toUtf8Bytes(description)),
          keccak256(toUtf8Bytes(Date.now().toString())),
        ]
      ) as `0x${string}`
    )
  );

  const encodedData = schemaEncoder.encodeData([
    { name: "contract", value: contract, type: "address" },
    { name: "id", value: id, type: "uint256" },
    { name: "proposer", value: proposer, type: "address" },
    { name: "description", value: description, type: "string" },
    { name: "choices", value: choices, type: "string[]" },
    { name: "proposal_type_id", value: proposal_type_id, type: "uint8" },
    { name: "start_block", value: BigInt(start_block), type: "uint256" },
    { name: "end_block", value: BigInt(end_block), type: "uint256" },
    { name: "proposal_type", value: proposal_type, type: "string" },
    { name: "tiers", value: tiers, type: "uint256[]" },
    {
      name: "onchain_proposalid",
      value: onchain_proposalid || 0n,
      type: "uint256",
    },
    { name: "max_approvals", value: maxApprovals, type: "uint8" },
    { name: "criteria", value: criteria, type: "uint8" },
    { name: "criteria_value", value: criteriaValue, type: "uint128" },
    { name: "calculationOptions", value: calculationOptions, type: "uint8" },
  ]);

  const recipient = "0x0000000000000000000000000000000000000000";
  const expirationTime = NO_EXPIRATION;
  const revocable = true;

  const txResponse = await eas.attest({
    schema: CREATE_PROPOSAL_SCHEMA_ID,
    data: {
      recipient,
      expirationTime,
      revocable,
      refUID: ZERO_BYTES32,
      data: encodedData,
      value: 0n,
    },
  });

  const receipt = await txResponse.wait();

  if (!receipt) {
    console.error(
      "Transaction failed or was not mined. Full response:",
      receipt
    );
    throw new Error("Transaction failed or was not mined.");
  }

  return {
    transactionHash: receipt,
    id,
  };
}

export async function cancelProposalAttestation({
  attestationUID,
  signer,
  canceller,
}: {
  attestationUID: string;
  signer: JsonRpcSigner;
  canceller: string;
}) {
  eas.connect(signer as any);

  const transaction = await eas.revoke({
    schema: CREATE_PROPOSAL_SCHEMA_ID,
    data: {
      uid: attestationUID,
      value: 0n,
    },
  });

  const receipt = await transaction.wait();

  return {
    transactionHash: receipt,
    attestationUID,
  };
}

export const signDelegatedAttestation = async ({
  schema,
  recipient,
  expirationTime,
  revocable,
  refUID,
  encodedData,
  deadline,
  value,
  signer,
}: {
  schema: string;
  recipient: string;
  expirationTime: bigint;
  revocable: boolean;
  refUID: string;
  encodedData: string;
  deadline: bigint;
  value: bigint;
  signer: JsonRpcSigner;
}) => {
  eas.connect(signer as any);

  const delegated = await eas.getDelegated();

  const response = await delegated.signDelegatedAttestation(
    {
      schema,
      recipient,
      expirationTime,
      revocable,
      refUID,
      data: encodedData,
      deadline,
      value,
    },
    signer
  );

  return response.signature;
};

// EAS v2 Governance Functions (Syndicate)

// Voting type constants
export const EAS_VOTING_TYPE = {
  STANDARD: 0,
  APPROVAL: 1,
  OPTIMISTIC: 2,
} as const;

// Approval criteria constants
export const EAS_APPROVAL_CRITERIA = {
  THRESHOLD: 0,
  TOP_CHOICES: 1,
} as const;

// Schema encoders for EAS v2 attestations
const v2SchemaEncoders = {
  CREATE_PROPOSAL: new SchemaEncoder(
    "string title,string description,uint64 startts,uint64 endts,string tags, string kwargs"
  ),
  VOTE: new SchemaEncoder("int8 choice,string reason"),
  ADVANCED_VOTE: new SchemaEncoder("string choice,string reason"),
};

export async function createV2CreateProposalAttestation({
  title,
  description,
  startts,
  endts,
  tags,
  proposal_type_uid,
  signer,
  votingType = "standard",
  choices = [],
  maxApprovals = 1,
  criteria = EAS_APPROVAL_CRITERIA.THRESHOLD,
  criteriaValue = 0,
  budget = 0,
}: {
  title: string;
  description: string;
  startts: bigint;
  endts: bigint;
  tags: string;
  proposal_type_uid?: string;
  signer: JsonRpcSigner;
  votingType?: string;
  choices?: string[];
  maxApprovals?: number;
  criteria?: number;
  criteriaValue?: number;
  budget?: number;
}) {
  eas.connect(signer as any);
  let kwargs;
  if (votingType === "approval") {
    kwargs = {
      choices,
      max_approvals: maxApprovals,
      criteria,
      criteria_value: criteriaValue,
      voting_module: votingType,
      budget,
    };
  } else {
    kwargs = {
      voting_module: votingType,
    };
  }

  const encodedData = v2SchemaEncoders.CREATE_PROPOSAL.encodeData([
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "startts", value: startts, type: "uint64" },
    { name: "endts", value: endts, type: "uint64" },
    { name: "tags", value: tags, type: "string" },
    { name: "kwargs", value: JSON.stringify(kwargs), type: "string" },
  ]);

  const txResponse = await eas.attest({
    schema: EAS_V2_SCHEMA_IDS.CREATE_PROPOSAL,
    data: {
      recipient:
        contracts.easRecipient || "0x0000000000000000000000000000000000000000",
      expirationTime: NO_EXPIRATION,
      revocable: true,
      refUID: proposal_type_uid || ZERO_BYTES32,
      data: encodedData,
      value: 0n,
    },
  });

  const receipt = await txResponse.wait();
  return { transactionHash: receipt };
}

export { EAS_V2_SCHEMA_IDS };

export async function createVoteAttestation({
  choice,
  reason,
  signer,
  proposalId,
}: {
  choice: number; // 0 = against, 1 = for, 2 = abstain
  reason: string;
  signer: JsonRpcSigner;
  proposalId: string;
}) {
  eas.connect(signer as any);

  const encodedData = v2SchemaEncoders.VOTE.encodeData([
    { name: "choice", value: choice, type: "int8" },
    { name: "reason", value: reason, type: "string" },
  ]);

  const recipient =
    contracts.easRecipient || "0x0000000000000000000000000000000000000000";
  const expirationTime = NO_EXPIRATION;
  const revocable = false;

  const txResponse = await eas.attest({
    schema: EAS_V2_SCHEMA_IDS.VOTE[contracts.token.chain.id],
    data: {
      recipient,
      expirationTime,
      revocable,
      refUID: proposalId,
      data: encodedData,
      value: 0n,
    },
  });

  const receipt = await txResponse.wait();

  if (!receipt) {
    console.error(
      "Transaction failed or was not mined. Full response:",
      receipt
    );
    throw new Error("Transaction failed or was not mined.");
  }

  return {
    transactionHash: receipt,
  };
}

/**
 * Create an approval vote attestation (multi-choice selection)
 * Uses ADVANCED_VOTE schema: "string choice,string reason"
 * Choice is comma-separated indices (e.g., "0,2,3")
 */
export async function createApprovalVoteAttestation({
  choices,
  reason,
  signer,
  proposalId,
}: {
  choices: number[];
  reason: string;
  signer: JsonRpcSigner;
  proposalId: string;
}) {
  eas.connect(signer as any);

  const choiceString = choices.join(",");

  const encodedData = v2SchemaEncoders.ADVANCED_VOTE.encodeData([
    { name: "choice", value: choiceString, type: "string" },
    { name: "reason", value: reason, type: "string" },
  ]);

  const recipient =
    contracts.easRecipient || "0x0000000000000000000000000000000000000000";
  const expirationTime = NO_EXPIRATION;
  const revocable = false;

  const txResponse = await eas.attest({
    schema:
      EAS_V2_SCHEMA_IDS.ADVANCED_VOTE[
        contracts.token.chain.id as keyof typeof EAS_V2_SCHEMA_IDS.ADVANCED_VOTE
      ],
    data: {
      recipient,
      expirationTime,
      revocable,
      refUID: proposalId,
      data: encodedData,
      value: 0n,
    },
  });

  const receipt = await txResponse.wait();

  if (!receipt) {
    console.error(
      "Transaction failed or was not mined. Full response:",
      receipt
    );
    throw new Error("Transaction failed or was not mined.");
  }

  return {
    transactionHash: receipt,
  };
}

/**
 * Create an optimistic vote attestation (veto vote)
 * Uses ADVANCED_VOTE schema: "string choice,string reason"
 * Choice is "0" (AGAINST/VETO)
 */
export async function createOptimisticVoteAttestation({
  reason,
  signer,
  proposalId,
}: {
  reason: string;
  signer: JsonRpcSigner;
  proposalId: string;
}) {
  eas.connect(signer as any);

  const choiceString = "0"; // 0 = AGAINST/VETO

  const encodedData = v2SchemaEncoders.ADVANCED_VOTE.encodeData([
    { name: "choice", value: choiceString, type: "string" },
    { name: "reason", value: reason, type: "string" },
  ]);

  const recipient =
    contracts.easRecipient || "0x0000000000000000000000000000000000000000";
  const expirationTime = NO_EXPIRATION;
  const revocable = false;

  const txResponse = await eas.attest({
    schema:
      EAS_V2_SCHEMA_IDS.ADVANCED_VOTE[
        contracts.token.chain.id as keyof typeof EAS_V2_SCHEMA_IDS.ADVANCED_VOTE
      ],
    data: {
      recipient,
      expirationTime,
      revocable,
      refUID: proposalId,
      data: encodedData,
      value: 0n,
    },
  });

  const receipt = await txResponse.wait();

  if (!receipt) {
    console.error(
      "Transaction failed or was not mined. Full response:",
      receipt
    );
    throw new Error("Transaction failed or was not mined.");
  }

  return {
    transactionHash: receipt,
  };
}
