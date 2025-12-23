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
import { EAS_ADDRESS } from "./constants";

const { contracts } = Tenant.current();
const provider = contracts.token.provider;

const eas = new EAS(EAS_ADDRESS[contracts.token.chain.id]);

const CHECK_PROPOSAL_SCHEMA_ID: Record<number, string> = {
  1: "0x80155c3a8c4ea17ce96e8899f7ab1ceca9e85382d7f893619a1d03947a70f844",
  11155111:
    "0x08df8e6e629077cabef4ed15cd4ff4f2359c2a60ad65b8355ac1f905b8f23a6f",
  8453: "0xe8d4638f7eb0d8d480f81365b9fe99a9826dd42a012f0ecd3e3621bfe1602b41",
};

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
  eas.connect(sender as any);

  const schemaEncoder = new SchemaEncoder("string[] passed,string[] failed");

  const encodedData = schemaEncoder.encodeData([
    { name: "passed", value: passed, type: "string[]" },
    { name: "failed", value: failed, type: "string[]" },
  ]);

  const txResponse = await eas.attest({
    schema: CHECK_PROPOSAL_SCHEMA_ID[contracts.token.chain.id],
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
