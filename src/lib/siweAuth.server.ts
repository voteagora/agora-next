import "server-only";

import { jwtVerify } from "jose";
import { SiweMessage } from "siwe";

import verifyMessage from "@/lib/serverVerifyMessage";

export type SiweAuthParams = {
  address: `0x${string}`;
  message: string;
  signature: `0x${string}`;
};

export async function verifySiwe({
  address,
  message,
  signature,
}: SiweAuthParams) {
  try {
    const siweMessage = new SiweMessage(message);
    if (siweMessage.address.toLowerCase() !== address.toLowerCase()) {
      return false;
    }

    return verifyMessage({
      address,
      message,
      signature,
      chainId: siweMessage.chainId,
      allowSafeContractSignature: true,
    });
  } catch {
    return false;
  }
}

export async function verifyJwtAndGetAddress(jwt: string) {
  try {
    const verifyResult = await jwtVerify(
      jwt,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    const exp = verifyResult.payload.exp;
    if (!exp || Number(exp) < Math.floor(Date.now() / 1000)) {
      return null;
    }
    const siwe = verifyResult.payload.siwe as
      | { address: string; chainId: string }
      | undefined;
    if (!siwe?.address) return null;
    return siwe.address as `0x${string}`;
  } catch {
    return null;
  }
}
