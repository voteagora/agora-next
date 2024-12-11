"use server";

import { fetchAllForAdvancedDelegation as apiFetchAllForAdvancedDelegation } from "@/app/api/delegations/getDelegations";
import { type DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { revalidatePath } from "next/cache";
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
export async function fetchDelegate(address: string) {
  return apiFetchDelegate(address);
}

export async function fetchVoterStats(address: string) {
  return apiFetchVoterStats(address);
}

export async function fetchDelegateStatement(address: string) {
  return apiFetchDelegateStatement(address);
}

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
