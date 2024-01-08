"use server";

import {
    getProxy,
    getVotingPowerAvailableForDirectDelegation,
    getVotingPowerAvailableForSubdelegation,
    isDelegatingToProxy,
} from "@/app/api/voting-power/getVotingPower";
import { getCurrentDelegatees, getCurrentDelegators } from "@/app/api/delegations/getDelegations";
import { getDelegate } from "@/app/api/delegates/getDelegates";
import { type DelegateStatementFormValues } from "@/components/DelegateStatement/DelegateStatementForm";
import { createDelegateStatement } from "@/app/api/delegateStatement/createDelegateStatement";
import { getDelegateStatement } from "@/app/api/delegateStatement/getDelegateStatement";
import { getVotesForDelegate } from "@/app/api/votes/getVotes";
import { VotesSortOrder } from "@/app/api/votes/vote";

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
export async function getProxyAddress(addressOrENSName: string) {
    return getProxy({ addressOrENSName });
}

export async function fetchDelegate(addressOrENSName: string) {
    return getDelegate({ addressOrENSName });
}

export async function submitDelegateStatement(address: string, values: DelegateStatementFormValues, signature: string) {
    return createDelegateStatement(address, values, signature);
}

export async function fetchDelegateStatement(addressOrENSName: string) {
    return getDelegateStatement({ addressOrENSName });
}

export async function fetchVotesForDelegate(
    addressOrENSName: string,
    page = 1,
    sortOrder?: VotesSortOrder
) {
    return getVotesForDelegate({ addressOrENSName, page, sort: undefined, sortOrder });
}

// Pass address of the connected wallet
export async function fetchCurrentDelegatees(addressOrENSName: string) {
    return getCurrentDelegatees({ addressOrENSName });
}


export async function fetchCurrentDelegators(addressOrENSName: string) {
    "use server";

    return getCurrentDelegators({ addressOrENSName });
}
