"use server";

import { getAllForAForAdvancedDelegation } from "@/app/api/delegations/getDelegations";
import { type DelegateStatementFormValues } from "@/components/DelegateStatement/CurrentDelegateStatement";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { getVotesForDelegate } from "@/app/api/common/votes/getVotes";
import {
  getProxy,
  getVotingPowerAvailableForDirectDelegation,
  getVotingPowerAvailableForSubdelegation,
  isDelegatingToProxy,
} from "@/app/api/common/voting-power/getVotingPower";
import { getDelegate } from "@/app/api/common/delegates/getDelegates";
import { getDelegateStatement } from "@/app/api/common/delegateStatement/getDelegateStatement";
import {
  getAllDelegatorsInChains,
  getCurrentDelegatees,
  getCurrentDelegators,
  getDirectDelegatee,
} from "@/app/api/common/delegations/getDelegations";
import { createDelegateStatement } from "@/app/api/common/delegateStatement/createDelegateStatement";
import Tenant from "@/lib/tenant/tenant";

// Pass address of the connected wallet
export async function fetchVotingPowerForSubdelegation(
  addressOrENSName: string
) {
  return getVotingPowerAvailableForSubdelegation(addressOrENSName);
}

// Pass address of the connected wallet
export async function checkIfDelegatingToProxy(addressOrENSName: string) {
  return isDelegatingToProxy(addressOrENSName);
}

// Pass address of the connected wallet
export async function fetchBalanceForDirectDelegation(
  addressOrENSName: string
) {
  return getVotingPowerAvailableForDirectDelegation(addressOrENSName);
}

export async function fetchDirectDelegatee(addressOrENSName: string) {
  return getDirectDelegatee(addressOrENSName);
}

// Pass address of the connected wallet
export async function getProxyAddress(addressOrENSName: string) {
  return getProxy(addressOrENSName);
}

export async function fetchDelegate(addressOrENSName: string) {
  return cache(
    (address: string) => getDelegate(address)
  )(addressOrENSName);
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

export async function fetchDelegateStatement(addressOrENSName: string) {
  return cache(
      (addressOrENS: string) => getDelegateStatement(addressOrENS)
  )(addressOrENSName);
}

export async function fetchVotesForDelegate(
  addressOrENSName: string,
  page = 1
) {
  return getVotesForDelegate({
    addressOrENSName,
    page,
  });
}

// Pass address of the connected wallet
export async function fetchCurrentDelegatees(addressOrENSName: string) {
  return getCurrentDelegatees(addressOrENSName);
}

export async function fetchCurrentDelegators(addressOrENSName: string) {
  return getCurrentDelegators(addressOrENSName);
}

// TODO temporary fetch all query - optimization via API needed
export async function fetchAllForAdvancedDelegation(address: string) {
  return getAllForAForAdvancedDelegation(address);
}

// Pass address of the connected wallet
export async function fetchAllDelegatorsInChainsForAddress(
  addressOrENSName: string
) {
  return getAllDelegatorsInChains(addressOrENSName);
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