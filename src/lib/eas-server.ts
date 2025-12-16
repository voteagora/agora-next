"use server";

import {
  ZERO_BYTES32,
  EAS,
  Signature,
  SchemaEncoder,
  NO_EXPIRATION,
} from "@ethereum-attestation-service/eas-sdk";

import { ethers } from "ethers";
import Tenant from "./tenant/tenant";

const { contracts } = Tenant.current();
const provider = contracts.token.provider;

const eas =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? new EAS("0x4200000000000000000000000000000000000021")
    : new EAS("0x4200000000000000000000000000000000000021");

const easV2 =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? new EAS("0xC2679fBD37d54388Ce493F1DB75320D236e1815e")
    : new EAS("0xA1207F3BBa224E2c9c3c6D5aF63D0eb1582Ce587");

const CHECK_PROPOSAL_SCHEMA_ID =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? "0x08df8e6e629077cabef4ed15cd4ff4f2359c2a60ad65b8355ac1f905b8f23a6f"
    : "0x80155c3a8c4ea17ce96e8899f7ab1ceca9e85382d7f893619a1d03947a70f844";

export const attestByDelegationServer = async ({
  recipient,
  expirationTime,
  revocable,
  encodedData,
  signature,
  attester,
  schema,
}: {
  recipient: string;
  expirationTime: bigint;
  revocable: boolean;
  encodedData: string;
  signature: Signature;
  attester: string;
  schema: string;
}) => {
  const EAS_SENDER_PRIVATE_KEY = process.env.EAS_SENDER_PRIVATE_KEY;
  if (!EAS_SENDER_PRIVATE_KEY) {
    throw new Error("EAS_SENDER_PRIVATE_KEY is missing from env");
  }

  const sender = new ethers.Wallet(EAS_SENDER_PRIVATE_KEY, provider);

  eas.connect(sender as any);

  const txResponse = await eas.attestByDelegation({
    schema,
    data: {
      recipient,
      expirationTime,
      revocable,
      refUID: ZERO_BYTES32,
      data: encodedData,
    },
    signature,
    attester,
  });

  const receipt = await txResponse.wait(1);

  return receipt;
};

export async function createCheckProposalAttestation({
  proposalId,
  daoUuid,
  passed,
  failed,
}: {
  proposalId: string;
  daoUuid: string;
  passed: string[];
  failed: string[];
}) {
  const EAS_SENDER_PRIVATE_KEY = process.env.EAS_SENDER_PRIVATE_KEY;
  if (!EAS_SENDER_PRIVATE_KEY) {
    throw new Error("EAS_SENDER_PRIVATE_KEY is missing from env");
  }

  const sender = new ethers.Wallet(EAS_SENDER_PRIVATE_KEY, provider);
  easV2.connect(sender as any);

  const schemaEncoder = new SchemaEncoder("string[] passed,string[] failed");

  const encodedData = schemaEncoder.encodeData([
    { name: "passed", value: passed, type: "string[]" },
    { name: "failed", value: failed, type: "string[]" },
  ]);

  const txResponse = await easV2.attest({
    schema: CHECK_PROPOSAL_SCHEMA_ID,
    data: {
      recipient: daoUuid,
      expirationTime: NO_EXPIRATION,
      revocable: false,
      refUID: proposalId,
      data: encodedData,
      value: 0n,
    },
  });

  const receipt = await txResponse.wait();

  return { transactionHash: receipt };
}
