"use server";

import { prismaWeb2Client } from "@/app/lib/prisma";
import Tenant from "@/lib/tenant/tenant";
import { PLMConfig } from "../types";

type DraftAuthorizationContext = {
  draft: {
    id: number;
    author_address: string;
    proposal_scope?: string | null;
  };
  normalizedAddress: string;
  isAuthor: boolean;
  isOffchainCreator: boolean;
};

type AuthorizationResult =
  | { ok: true; context: DraftAuthorizationContext }
  | { ok: false; message: string };

export async function getDraftAuthorizationContext(params: {
  draftProposalId: number;
  address: string;
  includeProposalScope?: boolean;
}): Promise<AuthorizationResult> {
  const { draftProposalId, address, includeProposalScope = false } = params;

  const draft = await prismaWeb2Client.proposalDraft.findUnique({
    where: { id: draftProposalId },
    select: {
      id: true,
      author_address: true,
      ...(includeProposalScope ? { proposal_scope: true } : {}),
    },
  });

  if (!draft) {
    return { ok: false, message: "Draft not found" };
  }

  const normalizedAddress = address.toLowerCase();
  const isAuthor = draft.author_address.toLowerCase() === normalizedAddress;
  const isOffchainCreator = getOffchainCreators().some(
    (creator) => creator.toLowerCase() === normalizedAddress
  );

  return {
    ok: true,
    context: {
      draft,
      normalizedAddress,
      isAuthor,
      isOffchainCreator,
    },
  };
}

export async function requireDraftEditAccess(params: {
  draftProposalId: number;
  address: string;
}): Promise<AuthorizationResult> {
  const result = await getDraftAuthorizationContext(params);
  if (!result.ok) {
    return result;
  }

  if (!result.context.isAuthor && !result.context.isOffchainCreator) {
    return { ok: false, message: "Unauthorized" };
  }

  return result;
}

function getOffchainCreators(): string[] {
  const tenant = Tenant.current();
  const plmToggle = tenant.ui.toggle("proposal-lifecycle");
  return (plmToggle?.config as PLMConfig)?.offchainProposalCreator || [];
}
