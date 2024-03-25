"use server";

import { fetchAllForAdvancedDelegation as apiFetchAllForAdvancedDelegation } from "@/app/api/delegations/getDelegations";
import { type DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { revalidatePath } from "next/cache";
import { fetchVotesForDelegate as apiFetchVotesForDelegate } from "@/app/api/common/votes/getVotes";
import {
  fetchProxy,
  fetchVotingPowerAvailableForDirectDelegation,
  fetchVotingPowerAvailableForSubdelegation,
  fetchIsDelegatingToProxy,
} from "@/app/api/common/voting-power/getVotingPower";
import { fetchDelegate as apiFetchDelegate } from "@/app/api/common/delegates/getDelegates";
import { fetchDelegateStatement as apiFetchDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import {
  fetchAllDelegatorsInChains,
  fetchCurrentDelegatees as apiFetchCurrentDelegatees,
  fetchCurrentDelegators as apiFetchCurrentDelegators,
  fetchDirectDelegatee as apiFetchDirectDelegatee,
} from "@/app/api/common/delegations/getDelegations";
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import Tenant from "@/lib/tenant/tenant";

export async function fetchDelegate(address: string) {
  return apiFetchDelegate(address);
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

// Pass address of the connected wallet
export async function getProxyAddress(addressOrENSName: string) {
  return fetchProxy(addressOrENSName);
}

export async function submitDelegateStatement({
  address,
  delegateStatement,
  signature,
  message,
}: {
  address: `0x${string}`;
  delegateStatement: DelegateStatementFormValues;
  signature: `0x${string}`;
  message: string;
}) {
  const response = await createDelegateStatement({
    address,
    delegateStatement,
    signature,
    message,
  });
  revalidatePath("/delegates/create", "page");
  return response;
}

export async function fetchVotesForDelegate(
  addressOrENSName: string,
  page = 1
) {
  return apiFetchVotesForDelegate({
    addressOrENSName,
    page,
  });
}

// Pass address of the connected wallet
export async function fetchCurrentDelegatees(addressOrENSName: string) {
  return apiFetchCurrentDelegatees(addressOrENSName);
}

export async function fetchCurrentDelegators(addressOrENSName: string) {
  return apiFetchCurrentDelegators(addressOrENSName);
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

export const revalidateDelegateAddressPage = async (delegateAddress: string) => {
  revalidatePath(`/delegates/${delegateAddress}`, "page");
};