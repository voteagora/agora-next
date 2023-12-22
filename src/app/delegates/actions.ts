"use server";

import {
    getProxy,
    getVotingPowerAvailableForDirectDelegation,
    getVotingPowerAvailableForSubdelegation,
    isDelegatingToProxy,
} from "@/app/api/voting-power/getVotingPower";
import { getCurrentDelegatees } from "@/app/api/delegations/getDelegations";
import { getDelegate } from "@/app/api/delegates/getDelegates";

// Pass address of the connected wallet
export async function fetchVotingPowerForSubdelegation(addressOrENSName: string) {
    return getVotingPowerAvailableForSubdelegation({ addressOrENSName });
}

// Pass address of the connected wallet
export async function checkIfDelegatingToProxy(addressOrENSName: string) {
    return isDelegatingToProxy({ addressOrENSName });
}

// Pass address of the connected wallet
export async function fetchBalanceForDirectDelegation(addressOrENSName: string) {
    return getVotingPowerAvailableForDirectDelegation({ addressOrENSName });
}

// Pass address of the connected wallet
export async function fetchCurrentDelegatees(addressOrENSName: string) {
    return getCurrentDelegatees({ addressOrENSName });
}

// Pass address of the connected wallet
export async function getProxyAddress(addressOrENSName: string) {
    return getProxy({ addressOrENSName });
}

export async function fetchDelegate(addressOrENSName: string) {
    "use server";

    return getDelegate({ addressOrENSName });
}