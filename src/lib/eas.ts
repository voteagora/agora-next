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

const { slug } = Tenant.current();

const CREATE_PROPOSAL_SCHEMA_ID =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? "0x590765de6f34bbae3e51aa89e571f567fa6d63cf3f8225592d58133860a0ccda"
    : "0xfc5b3c0472d09ac39f0cb9055869e70c4c59413041e3fd317f357789389971e4";

const schemaEncoder = new SchemaEncoder(
  "address contract,uint256 id,address proposer,string description,string[] choices,uint8 proposal_type_id,uint256 start_block,uint256 end_block, string proposal_type, uint256[] tiers, uint256 onchain_proposalid, uint8 max_approvals, uint8 criteria, uint128 criteria_value, uint8 calculationOptions"
);

const eas =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? new EAS("0x4200000000000000000000000000000000000021")
    : new EAS("0x4200000000000000000000000000000000000021");

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

  const receipt = await txResponse.wait(1);

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
