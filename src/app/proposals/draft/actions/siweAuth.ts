"use server";

import { prismaWeb2Client } from "@/app/lib/web2";
import verifyMessage from "@/lib/serverVerifyMessage";
import { jwtVerify } from "jose";

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
  const isValid = await verifyMessage({ address, message, signature });
  return isValid;
}

export async function verifyOwnerAndSiweForDraft(
  draftProposalId: number,
  { address, message, signature }: SiweAuthParams
) {
  const isValid = await verifySiwe({ address, message, signature });
  if (!isValid) {
    return { ok: false as const, reason: "Invalid signature" };
  }

  const draft = await prismaWeb2Client.proposalDraft.findUnique({
    where: { id: draftProposalId },
    select: { id: true, author_address: true },
  });

  if (!draft) {
    return { ok: false as const, reason: "Draft not found" };
  }

  if (draft.author_address.toLowerCase() !== address.toLowerCase()) {
    return { ok: false as const, reason: "Unauthorized: not owner" };
  }

  return { ok: true as const };
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

export async function verifyOwnerAndJwtForDraft(
  draftProposalId: number,
  jwt: string
) {
  const address = await verifyJwtAndGetAddress(jwt);
  if (!address) return { ok: false as const, reason: "Invalid token" };
  const draft = await prismaWeb2Client.proposalDraft.findUnique({
    where: { id: draftProposalId },
    select: { id: true, author_address: true },
  });
  if (!draft) return { ok: false as const, reason: "Draft not found" };
  if (draft.author_address.toLowerCase() !== address.toLowerCase()) {
    return { ok: false as const, reason: "Unauthorized: not owner" };
  }
  return { ok: true as const };
}
