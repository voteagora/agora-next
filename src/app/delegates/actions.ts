"use server";

import { fetchAllForAdvancedDelegation as apiFetchAllForAdvancedDelegation } from "@/app/api/delegations/getDelegations";
import { type DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { fetchVotesForDelegate as apiFetchVotesForDelegate } from "@/app/api/common/votes/getVotes";
import {
  fetchIsDelegatingToProxy,
  fetchVotingPowerAvailableForDirectDelegation,
  fetchVotingPowerAvailableForSubdelegation,
} from "@/app/api/common/voting-power/getVotingPower";
import {
  fetchDelegate as apiFetchDelegate,
  fetchVoterStats as apiFetchVoterStats,
} from "@/app/api/common/delegates/getDelegates";
import { fetchDelegateStatement as apiFetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import {
  fetchAllDelegatorsInChains,
  fetchCurrentDelegatees as apiFetchCurrentDelegatees,
  fetchCurrentDelegators as apiFetchCurrentDelegators,
  fetchDirectDelegatee as apiFetchDirectDelegatee,
} from "@/app/api/common/delegations/getDelegations";
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import Tenant from "@/lib/tenant/tenant";
import { PaginationParams } from "../lib/pagination";
import { fetchUpdateNotificationPreferencesForAddress } from "@/app/api/common/notifications/updateNotificationPreferencesForAddress";

export const fetchDelegate = unstable_cache(
  async (address: string) => {
    return await apiFetchDelegate(address);
  },
  ["delegate"],
  {
    revalidate: 600, // 10 minute cache
    tags: ["delegate"],
  }
);

export const fetchVoterStats = unstable_cache(
  async (address: string, blockNumber?: number) => {
    return apiFetchVoterStats(address, blockNumber);
  },
  ["voterStats"],
  {
    // Cache for 10 minutes unless invalidated by the block
    // This cache will get invalidated by the block number update
    revalidate: 600,
    tags: ["voterStats"],
  }
);

export const fetchDelegateStatement = unstable_cache(
  async (address: string) => {
    return apiFetchDelegateStatement(address);
  },
  ["delegateStatement"],
  {
    revalidate: 600, // 10 minute cache
    tags: ["delegateStatement"],
  }
);

// Pass address of the connected wallet
export async function fetchVotingPowerForSubdelegation(
  addressOrENSName: string
) {
  return fetchVotingPowerAvailableForSubdelegation(addressOrENSName);
}

// Pass address of the connected wallet
export async function checkIfDelegatingToProxy(addressOrENSName: string) {
  return fetchIsDelegatingToProxy(addressOrENSName);
}

// Pass address of the connected wallet
export async function fetchBalanceForDirectDelegation(
  addressOrENSName: string
) {
  return fetchVotingPowerAvailableForDirectDelegation(addressOrENSName);
}

export async function fetchDirectDelegatee(addressOrENSName: string) {
  return apiFetchDirectDelegatee(addressOrENSName);
}

export async function submitDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
  scwAddress,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
  scwAddress?: string;
}) {
  const response = await createDelegateStatement({
    address,
    delegateStatement,
    signature,
    message,
    scwAddress,
  });

  revalidateTag("delegate");
  revalidateTag("delegateStatement");
  revalidatePath("/delegates/create", "page");
  return response;
}

export async function fetchVotesForDelegate(
  addressOrENSName: string,
  pagination?: {
    offset: number;
    limit: number;
  }
) {
  return apiFetchVotesForDelegate({
    addressOrENSName,
    pagination,
  });
}

// Pass address of the connected wallet
export async function fetchCurrentDelegatees(addressOrENSName: string) {
  return apiFetchCurrentDelegatees(addressOrENSName);
}

export async function fetchCurrentDelegators(
  addressOrENSName: string,
  pagination: PaginationParams = {
    offset: 0,
    limit: 20,
  }
) {
  return apiFetchCurrentDelegators(addressOrENSName, pagination);
}

// TODO temporary fetch all query - optimization via API needed
export async function fetchAllForAdvancedDelegation(address: string) {
  return apiFetchAllForAdvancedDelegation(address);
}

// Pass address of the connected wallet
export async function fetchAllDelegatorsInChainsForAddress(
  addressOrENSName: string
) {
  return fetchAllDelegatorsInChains(addressOrENSName);
}

export async function balanceOf(address: string) {
  const { contracts } = Tenant.current();
  return contracts.token.contract.balanceOf(address);
}

export const fetchConnectedDelegate = async (address: string) => {
  return await Promise.all([
    fetchDelegate(address),
    fetchAllDelegatorsInChainsForAddress(address),
    balanceOf(address),
  ]);
};

export const revalidateDelegateAddressPage = async (
  delegateAddress: string
) => {
  revalidatePath(`/delegates/${delegateAddress}`, "page");
};

export async function updateNotificationPreferencesForAddress(
  address: `0x${string}`,
  email: string,
  options: {
    wants_proposal_created_email: "prompt" | "prompted" | true | false;
    wants_proposal_ending_soon_email: "prompt" | "prompted" | true | false;
  }
) {
  return fetchUpdateNotificationPreferencesForAddress(address, email, options);
}
