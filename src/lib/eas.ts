import {
  SchemaEncoder,
  NO_EXPIRATION,
} from "@ethereum-attestation-service/eas-sdk";
import { toUtf8Bytes } from "ethers";
import Tenant from "./tenant/tenant";
import { keccak256 } from "viem";
import { defaultAbiCoder } from "@ethersproject/abi";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { getEAS } from "./eas-server";

const { slug } = Tenant.current();

export const CREATE_PROPOSAL_SCHEMA_ID =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? "0xdc6fc01a5dd61a7f6af0b12018217b390593c5b01df4e89b365ec354734400ae"
    : "0xdc6fc01a5dd61a7f6af0b12018217b390593c5b01df4e89b365ec354734400ae";

const schemaEncoder = new SchemaEncoder(
  "address contract,string id,address proposer,string description,string[] choices,uint8 proposal_type_id,uint256 start_block,uint256 end_block"
);

export async function createProposalAttestation({
  contract,
  proposer,
  description,
  choices,
  proposal_type_id,
  start_block,
  end_block,
}: {
  contract: string;
  proposer: string;
  description: string;
  choices: string[];
  proposal_type_id: number;
  start_block: string;
  end_block: string;
}) {
  const eas = getEAS();
  const id = keccak256(
    defaultAbiCoder.encode(
      ["bytes32", "bytes32"],
      [keccak256(toUtf8Bytes(slug)), keccak256(toUtf8Bytes(description))]
    ) as `0x${string}`
  );

  const encodedData = schemaEncoder.encodeData([
    { name: "contract", value: contract, type: "address" },
    { name: "id", value: id, type: "string" },
    { name: "proposer", value: proposer, type: "address" },
    { name: "description", value: description, type: "string" },
    { name: "choices", value: choices, type: "string[]" },
    { name: "proposal_type_id", value: proposal_type_id, type: "uint8" },
    { name: "start_block", value: start_block, type: "uint256" },
    { name: "end_block", value: end_block, type: "uint256" },
  ]);

  const recipient = "0x0000000000000000000000000000000000000000";
  const expirationTime = NO_EXPIRATION;
  const revocable = false;

  const signature = await signDelegatedAttestation({
    schema: CREATE_PROPOSAL_SCHEMA_ID,
    recipient,
    expirationTime,
    revocable,
    refUID: id,
    encodedData,
    deadline: expirationTime,
    value: 0n,
  });

  const txResponse = await eas.attestByDelegation({
    schema: CREATE_PROPOSAL_SCHEMA_ID,
    data: {
      recipient,
      expirationTime,
      revocable,
      data: encodedData,
    },
    signature,
    attester: proposer,
  });

  const receipt = await txResponse.wait(1);

  if (!receipt) {
    console.error(
      "Transaction failed or was not mined. Full response:",
      txResponse
    );
    throw new Error("Transaction failed or was not mined.");
  }

  console.log("receipt", receipt);

  return {
    transactionHash: receipt,
    id,
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
}: {
  schema: string;
  recipient: string;
  expirationTime: bigint;
  revocable: boolean;
  refUID: string;
  encodedData: string;
  deadline: bigint;
  value: bigint;
}) => {
  const eas = getEAS();
  const signer = useEthersSigner();
  if (!signer) {
    throw new Error("No signer found");
  }
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
