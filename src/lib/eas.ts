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
import { attestByDelegationServer } from "./eas-server";

const { slug } = Tenant.current();

const CREATE_PROPOSAL_SCHEMA_ID =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? "0xc2d307e00cc97b07606361c49971814ed50e20b080a0fb7a3c9c94c224463539"
    : "0xc2d307e00cc97b07606361c49971814ed50e20b080a0fb7a3c9c94c224463539";

const CANCEL_PROPOSAL_SCHEMA_ID =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? "0x59bc3744c9c3d0dd7871882f71dbf9f9709bf6bb469d45f36537f9de6288a736"
    : "0x59bc3744c9c3d0dd7871882f71dbf9f9709bf6bb469d45f36537f9de6288a736";

const schemaEncoder = new SchemaEncoder(
  "address contract,uint256 id,address proposer,string description,string[] choices,uint8 proposal_type_id,uint256 start_block,uint256 end_block, string proposal_type, uint256[] tiers, uint256 onchain_proposalid"
);

const schemaEncoderCancel = new SchemaEncoder("uint256 id");

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
}) {
  const id = BigInt(
    keccak256(
      defaultAbiCoder.encode(
        ["bytes32", "bytes32"],
        [keccak256(toUtf8Bytes(slug)), keccak256(toUtf8Bytes(description))]
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
  ]);

  const recipient = "0x0000000000000000000000000000000000000000";
  const expirationTime = NO_EXPIRATION;
  const revocable = true;

  const signature = await signDelegatedAttestation({
    schema: CREATE_PROPOSAL_SCHEMA_ID,
    recipient,
    expirationTime,
    revocable,
    refUID: ZERO_BYTES32,
    encodedData,
    deadline: expirationTime,
    value: 0n,
    signer,
  });

  if (!signature) {
    console.error("Failed to get signature");
    throw new Error("Signature is required");
  }
  if (
    typeof signature === "object" &&
    "v" in signature &&
    "r" in signature &&
    "s" in signature
  ) {
    const { v, r, s } = signature;
    if (
      typeof v !== "number" ||
      typeof r !== "string" ||
      typeof s !== "string"
    ) {
      throw new Error("Invalid signature format");
    }
  } else {
    throw new Error("Invalid signature format");
  }

  const receipt = await attestByDelegationServer({
    recipient,
    expirationTime,
    revocable,
    encodedData,
    signature,
    attester: proposer,
    schema: CREATE_PROPOSAL_SCHEMA_ID,
  });

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
