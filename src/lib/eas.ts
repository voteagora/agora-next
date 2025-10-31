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

const { slug, contracts } = Tenant.current();

const CREATE_PROPOSAL_SCHEMA_ID =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? "0x590765de6f34bbae3e51aa89e571f567fa6d63cf3f8225592d58133860a0ccda"
    : "0xfc5b3c0472d09ac39f0cb9055869e70c4c59413041e3fd317f357789389971e4";

const EAS_V2_SCHEMA_IDS = {
  CREATE_PROPOSAL:
    "0x442d586d8424b5485de1ff46cb235dcb96b41d19834926bbad1cd157fbeeb8fc",
  VOTE:
    process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
      ? "0x2b0e624e00310c7e88a1b7840238e285152b38ab00160b14c0d4e54e0a53a3aa"
      : "0x3bc2cb5268eedcc69ce64646cd096ed4ef2ed0537cb6bbed80e5f7a844060610",
};

const schemaEncoder = new SchemaEncoder(
  "address contract,uint256 id,address proposer,string description,string[] choices,uint8 proposal_type_id,uint256 start_block,uint256 end_block, string proposal_type, uint256[] tiers, uint256 onchain_proposalid, uint8 max_approvals, uint8 criteria, uint128 criteria_value, uint8 calculationOptions"
);

const eas =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? new EAS("0x4200000000000000000000000000000000000021")
    : new EAS("0x4200000000000000000000000000000000000021");

const easV2 =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? new EAS("0xC2679fBD37d54388Ce493F1DB75320D236e1815e")
    : new EAS("0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587");

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
// EAS v2 Governance Functions

// Schema encoders for EAS v2 attestations
const v2SchemaEncoders = {
  CREATE_PROPOSAL: new SchemaEncoder(
    "string title,string description,uint64 startts,uint64 endts,string tags"
  ),
  VOTE: new SchemaEncoder("int8 choice,string reason"),
};

export async function createV2CreateProposalAttestation({
  title,
  description,
  startts,
  endts,
  tags,
  proposal_type_uid,
  signer,
}: {
  title: string;
  description: string;
  startts: bigint;
  endts: bigint;
  tags: string;
  proposal_type_uid?: string;
  signer: JsonRpcSigner;
}) {
  easV2.connect(signer as any);

  const encodedData = v2SchemaEncoders.CREATE_PROPOSAL.encodeData([
    { name: "title", value: title, type: "string" },
    { name: "description", value: description, type: "string" },
    { name: "startts", value: startts, type: "uint64" },
    { name: "endts", value: endts, type: "uint64" },
    { name: "tags", value: tags, type: "string" },
  ]);

  const txResponse = await easV2.attest({
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
  easV2.connect(signer as any);

  const encodedData = v2SchemaEncoders.VOTE.encodeData([
    { name: "choice", value: choice, type: "int8" },
    { name: "reason", value: reason, type: "string" },
  ]);

  const recipient =
    contracts.easRecipient || "0x0000000000000000000000000000000000000000";
  const expirationTime = NO_EXPIRATION;
  const revocable = false;

  const txResponse = await easV2.attest({
    schema: EAS_V2_SCHEMA_IDS.VOTE,
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
