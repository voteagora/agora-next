"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import verifyMessage from "@/lib/serverVerifyMessage";
import { jwtVerify } from "jose";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "@/app/proposals/draft/types";

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

function isAddressAuthorizedForDraft(
  address: string,
  draftAuthorAddress: string
): boolean {
  const addressLower = address.toLowerCase();
  const authorLower = draftAuthorAddress.toLowerCase();

  if (addressLower === authorLower) {
    return true;
  }

  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  const offchainCreators =
    (plmToggle?.config as PLMConfig)?.offchainProposalCreator || [];

  return offchainCreators.some(
    (creator) => creator.toLowerCase() === addressLower
  );
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

  if (!isAddressAuthorizedForDraft(address, draft.author_address)) {
    return { ok: false as const, reason: "Unauthorized" };
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
  if (!isAddressAuthorizedForDraft(address, draft.author_address)) {
    return { ok: false as const, reason: "Unauthorized" };
  }
  return { ok: true as const };
}
