"use server";

import {
  ZERO_BYTES32,
  EAS,
  Signature,
} from "@ethereum-attestation-service/eas-sdk";

import { ethers } from "ethers";
import Tenant from "./tenant/tenant";

const { contracts } = Tenant.current();
const provider = contracts.token.provider;

const eas =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? new EAS("0x4200000000000000000000000000000000000021")
    : new EAS("0x4200000000000000000000000000000000000021");

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
