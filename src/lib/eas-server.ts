"use server";

import { AlchemyProvider } from "ethers";

import { EAS } from "@ethereum-attestation-service/eas-sdk";
import { ethers } from "ethers";

const eas =
  process.env.NEXT_PUBLIC_AGORA_ENV === "dev"
    ? new EAS("0x4200000000000000000000000000000000000021")
    : new EAS("0x4200000000000000000000000000000000000021");

const EAS_SENDER_PRIVATE_KEY = process.env.EAS_SENDER_PRIVATE_KEY;
if (!EAS_SENDER_PRIVATE_KEY) {
  throw new Error("EAS_SENDER_PRIVATE_KEY is missing from env");
}

const provider = new AlchemyProvider(
  "optimism-sepolia",
  process.env.ALCHEMY_API_KEY
);

const sender = new ethers.Wallet(EAS_SENDER_PRIVATE_KEY, provider);

eas.connect(sender as any);

export const getEAS = () => {
  return eas;
};
